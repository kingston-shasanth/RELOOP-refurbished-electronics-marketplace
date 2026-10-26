const fs = require('fs');
const path = require('path');
const net = require('net');
const http = require('http');
const { spawn, exec, execSync, execFileSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PID_FILE = path.join(PROJECT_ROOT, '.reloop_pids.json');
const BACKEND_DIR = path.join(PROJECT_ROOT, 'server');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'client');

// ANSI Color Codes
const COLOR_RESET = '\x1b[0m';
const COLOR_CYAN = '\x1b[36m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_RED = '\x1b[31m';
const COLOR_BOLD = '\x1b[1m';
const COLOR_DIM = '\x1b[2m';

// Helper: Check if a TCP port is open / listening
function probePort(port, host = '127.0.0.1', timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// Helper: Get list of PIDs listening on a specific port in Windows
function getPortListeningPids(port) {
  try {
    const output = execSync(`netstat -ano -p tcp`, { encoding: 'utf8' });
    const pids = new Set();
    const lines = output.split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1] && parts[1].endsWith(`:${port}`) && parts[3] === 'LISTENING') {
        const pid = parseInt(parts[4], 10);
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    }
    return Array.from(pids);
  } catch (err) {
    return [];
  }
}

// Helper: Get process command line on Windows safely
function getProcessCommandLine(pid) {
  try {
    const output = execFileSync('powershell.exe', [
      '-NoProfile',
      '-Command',
      `(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}").CommandLine`
    ], { encoding: 'utf8', timeout: 3000 });
    return output.trim();
  } catch (err) {
    return '';
  }
}

// Helper: Check if a PID is alive
function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

// Helper: Kill a process tree safely using taskkill on Windows
function killProcessTree(pid) {
  if (!pid || !isPidAlive(pid)) return;
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
  } catch (err) {
    // Ignore errors if process already exited
  }
}

// Helper: Poll HTTP URL until it returns 200 OK
function waitForHttpUrl(url, timeoutMs = 25000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for ${url}`));
        return;
      }

      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            clearInterval(interval);
            resolve(true);
          }
        })
        .on('error', () => {
          // Retry silently
        });
    }, 400);
  });
}

// ============================================================================
// COMMAND: STOP
// ============================================================================
async function handleStop() {
  console.log(`${COLOR_BOLD}====================================================================${COLOR_RESET}`);
  console.log(`${COLOR_BOLD}  RELOOP Refurbished Electronics Platform -- Stopping Services${COLOR_RESET}`);
  console.log(`${COLOR_BOLD}====================================================================${COLOR_RESET}\n`);

  let pidsToKill = new Set();

  // 1. Read PID file if available
  if (fs.existsSync(PID_FILE)) {
    try {
      const content = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
      if (content.backendPid) pidsToKill.add(content.backendPid);
      if (content.frontendPid) pidsToKill.add(content.frontendPid);
      console.log(`[INFO] Found recorded RELOOP launcher PIDs: Backend=${content.backendPid}, Frontend=${content.frontendPid}`);
    } catch (e) {
      // Ignore parse error
    }
  }

  // 2. Safely inspect Port 5000 (Backend)
  const pids5000 = getPortListeningPids(5000);
  for (const pid of pids5000) {
    const cmd = getProcessCommandLine(pid);
    if (cmd.includes('RELOOP') || cmd.includes('server.js')) {
      console.log(`[INFO] Identified RELOOP backend process on port 5000 (PID: ${pid}).`);
      pidsToKill.add(pid);
    } else {
      console.log(`${COLOR_YELLOW}[NOTICE] Port 5000 is occupied by an external non-RELOOP process (PID: ${pid}). Leaving untouched.${COLOR_RESET}`);
    }
  }

  // 3. Safely inspect Frontend Ports (5173 & 5174)
  for (const port of [5173, 5174]) {
    const pids = getPortListeningPids(port);
    for (const pid of pids) {
      const cmd = getProcessCommandLine(pid);
      if (cmd.includes('RELOOP')) {
        console.log(`[INFO] Identified RELOOP frontend process on port ${port} (PID: ${pid}).`);
        pidsToKill.add(pid);
      } else {
        console.log(`${COLOR_YELLOW}[NOTICE] Port ${port} is occupied by an external non-RELOOP process (PID: ${pid}). Leaving untouched.${COLOR_RESET}`);
      }
    }
  }

  // 4. Terminate identified RELOOP processes
  if (pidsToKill.size === 0) {
    console.log(`${COLOR_GREEN}[✓] No active RELOOP processes found running.${COLOR_RESET}`);
  } else {
    for (const pid of pidsToKill) {
      if (isPidAlive(pid)) {
        process.stdout.write(`[INFO] Stopping RELOOP process (PID: ${pid})... `);
        killProcessTree(pid);
        console.log(`${COLOR_GREEN}Done.${COLOR_RESET}`);
      }
    }
  }

  // 5. Clean up lock file
  if (fs.existsSync(PID_FILE)) {
    try {
      fs.unlinkSync(PID_FILE);
    } catch (e) {}
  }

  console.log(`\n${COLOR_GREEN}${COLOR_BOLD}[✓] RELOOP shutdown complete. All RELOOP processes stopped cleanly.${COLOR_RESET}`);
  console.log(`${COLOR_DIM}No unrelated Node.js processes were terminated.${COLOR_RESET}\n`);
}

// ============================================================================
// COMMAND: START
// ============================================================================
async function handleStart() {
  console.log(`${COLOR_BOLD}====================================================================${COLOR_RESET}`);
  console.log(`${COLOR_BOLD}  RELOOP Refurbished Electronics Platform -- Initializing Launch${COLOR_RESET}`);
  console.log(`${COLOR_BOLD}====================================================================${COLOR_RESET}\n`);

  // Step 1: Pre-flight MongoDB Check
  process.stdout.write(`[1/4] Checking MongoDB Community Server (127.0.0.1:27017)... `);
  const mongoActive = await probePort(27017, '127.0.0.1', 1500);
  if (mongoActive) {
    console.log(`${COLOR_GREEN}Active${COLOR_RESET}`);
  } else {
    console.log(`${COLOR_YELLOW}Not Detected!${COLOR_RESET}`);
    console.log(`${COLOR_YELLOW}  [WARNING] MongoDB does not appear to be running on 127.0.0.1:27017.`);
    console.log(`  The platform will start, but database operations may fail if MongoDB is offline.${COLOR_RESET}`);
  }

  // Step 2: Check if RELOOP is already running
  if (fs.existsSync(PID_FILE)) {
    try {
      const pids = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
      const backendAlive = pids.backendPid && isPidAlive(pids.backendPid);
      const frontendAlive = pids.frontendPid && isPidAlive(pids.frontendPid);

      if (backendAlive || frontendAlive) {
        console.log(`\n${COLOR_YELLOW}${COLOR_BOLD}[NOTICE] RELOOP is already active on this system!${COLOR_RESET}`);
        console.log(`  • Backend PID  : ${pids.backendPid} (${backendAlive ? 'Running' : 'Stopped'})`);
        console.log(`  • Frontend PID : ${pids.frontendPid} (${frontendAlive ? 'Running' : 'Stopped'})`);
        console.log(`  • Storefront   : http://localhost:5173`);
        console.log(`  • API Health   : http://localhost:5000/api/health\n`);
        console.log(`To stop or restart RELOOP, please run ${COLOR_BOLD}STOP_RELOOP.bat${COLOR_RESET} first.\n`);
        
        // Open browser to existing instance
        exec('start http://localhost:5173');
        return;
      } else {
        // Stale PID file, clean it up
        fs.unlinkSync(PID_FILE);
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  // Step 3: Check for port collisions
  process.stdout.write(`[2/4] Verifying port availability (5000, 5173)... `);
  const pids5000 = getPortListeningPids(5000);
  if (pids5000.length > 0) {
    const cmd = getProcessCommandLine(pids5000[0]);
    console.log(`${COLOR_RED}CONFLICT on port 5000!${COLOR_RESET}`);
    console.log(`${COLOR_RED}  [ERROR] Port 5000 is occupied by process PID ${pids5000[0]}:`);
    console.log(`  Command: ${cmd || 'Unknown Process'}`);
    console.log(`  Please free port 5000 before starting RELOOP.${COLOR_RESET}\n`);
    process.exit(1);
  }

  let frontendPort = 5173;
  const pids5173 = getPortListeningPids(5173);
  if (pids5173.length > 0) {
    const cmd = getProcessCommandLine(pids5173[0]);
    console.log(`${COLOR_YELLOW}Port 5173 is occupied by external process PID ${pids5173[0]}.${COLOR_RESET}`);
    console.log(`  [INFO] Auto-routing RELOOP frontend to fallback port 5174.`);
    frontendPort = 5174;
    const pids5174 = getPortListeningPids(5174);
    if (pids5174.length > 0) {
      frontendPort = 5175;
    }
  } else {
    console.log(`${COLOR_GREEN}Ports 5000 & 5173 Available${COLOR_RESET}`);
  }

  // Step 4: Spawn Backend and Frontend processes
  let keepAliveInterval = null;
  let isShuttingDown = false;
  console.log(`[3/4] Starting RELOOP Express backend & React/Vite frontend (port ${frontendPort})...`);

  // Backend child process
  const backendProc = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: '5000', NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Frontend child process (invoking Vite directly via node to ensure strict PID tracking)
  const vitePath = path.join(FRONTEND_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
  const frontendProc = spawn(process.execPath, [vitePath, '--port', String(frontendPort), '--strictPort', '--host', '127.0.0.1'], {
    cwd: FRONTEND_DIR,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Record PIDs to .reloop_pids.json
  const pidData = {
    backendPid: backendProc.pid,
    frontendPid: frontendProc.pid,
    frontendPort,
    startTime: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
  };
  fs.writeFileSync(PID_FILE, JSON.stringify(pidData, null, 2));

  console.log(`  • Backend spawned with PID  : ${backendProc.pid}`);
  console.log(`  • Frontend spawned with PID : ${frontendProc.pid} (Port ${frontendPort})`);
  console.log(`  • Lockfile written to       : .reloop_pids.json`);

  // Stream output with clear prefixes
  backendProc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${COLOR_CYAN}[BACKEND]${COLOR_RESET}  ${line.trim()}`);
      }
    }
  });

  backendProc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${COLOR_RED}[BACKEND ERR]${COLOR_RESET} ${line.trim()}`);
      }
    }
  });

  frontendProc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${COLOR_GREEN}[FRONTEND]${COLOR_RESET} ${line.trim()}`);
      }
    }
  });

  frontendProc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${COLOR_RED}[FRONTEND ERR]${COLOR_RESET} ${line.trim()}`);
      }
    }
  });

  // Track process lifecycle
  let backendExited = false;
  let frontendExited = false;

  const checkBothExited = () => {
    if (backendExited && frontendExited && !isShuttingDown) {
      isShuttingDown = true;
      if (typeof keepAliveInterval !== 'undefined') {
        clearInterval(keepAliveInterval);
      }
      if (fs.existsSync(PID_FILE)) {
        try { fs.unlinkSync(PID_FILE); } catch (e) {}
      }
      console.log(`\n${COLOR_YELLOW}[RELOOP] Both backend and frontend services have stopped.${COLOR_RESET}`);
      process.exit(0);
    }
  };

  backendProc.on('exit', (code) => {
    backendExited = true;
    if (code !== null && code !== 0 && !isShuttingDown) {
      console.log(`${COLOR_YELLOW}[BACKEND] Process stopped (code ${code}).${COLOR_RESET}`);
    }
    checkBothExited();
  });

  frontendProc.on('exit', (code) => {
    frontendExited = true;
    if (code !== null && code !== 0 && !isShuttingDown) {
      console.log(`${COLOR_YELLOW}[FRONTEND] Process stopped (code ${code}).${COLOR_RESET}`);
    }
    checkBothExited();
  });

  // Step 5: Wait for servers to be healthy
  console.log(`[4/4] Probing service endpoints...`);
  try {
    await Promise.all([
      waitForHttpUrl('http://127.0.0.1:5000/api/health', 15000),
      waitForHttpUrl(`http://127.0.0.1:${frontendPort}/`, 15000),
    ]);

    console.log(`\n${COLOR_GREEN}${COLOR_BOLD}========================================================================${COLOR_RESET}`);
    console.log(`${COLOR_GREEN}${COLOR_BOLD}  ✓ RELOOP Refurbished Electronics Platform is ACTIVE & READY!${COLOR_RESET}`);
    console.log(`${COLOR_BOLD}  • Storefront URL : ${COLOR_GREEN}http://localhost:${frontendPort}${COLOR_RESET}`);
    console.log(`${COLOR_BOLD}  • Backend API    : ${COLOR_CYAN}http://localhost:5000/api/health${COLOR_RESET}`);
    console.log(`${COLOR_BOLD}  • Database       : MongoDB (127.0.0.1:27017/reloop)${COLOR_RESET}`);
    console.log(`${COLOR_BOLD}------------------------------------------------------------------------${COLOR_RESET}`);
    console.log(`  Keep this terminal open while testing or browsing.`);
    console.log(`  To cleanly stop RELOOP:`);
    console.log(`    - Press ${COLOR_BOLD}Ctrl+C${COLOR_RESET} in this terminal, OR`);
    console.log(`    - Double-click ${COLOR_BOLD}STOP_RELOOP.bat${COLOR_RESET}`);
    console.log(`${COLOR_GREEN}${COLOR_BOLD}========================================================================${COLOR_RESET}\n`);

    // Auto-launch browser
    exec(`start http://localhost:${frontendPort}`);
  } catch (err) {
    console.log(`${COLOR_YELLOW}[NOTICE] Services spawned; health probe: ${err.message}${COLOR_RESET}`);
  }

  // Keep Node event loop actively running while servers operate
  keepAliveInterval = setInterval(() => {}, 60000);

  // Step 6: Graceful termination traps
  const gracefulShutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    clearInterval(keepAliveInterval);
    console.log(`\n\n${COLOR_YELLOW}[RELOOP] Interrupted. Shutting down platform services cleanly...${COLOR_RESET}`);

    killProcessTree(backendProc.pid);
    killProcessTree(frontendProc.pid);

    if (fs.existsSync(PID_FILE)) {
      try {
        fs.unlinkSync(PID_FILE);
      } catch (e) {}
    }

    console.log(`${COLOR_GREEN}[✓] RELOOP backend and frontend stopped cleanly. Terminal ready to close.${COLOR_RESET}`);
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGHUP', gracefulShutdown);
}

// Main Router
const action = process.argv[2] || 'start';
if (action === 'stop') {
  handleStop();
} else {
  handleStart();
}
