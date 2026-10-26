# RELOOP — Platform Startup & Shutdown Guide
**Refurbished Electronics E-Commerce Platform | MERN Stack**

---

### Quick Start (Double-Click Execution)

RELOOP includes a zero-configuration, double-click launcher system designed for rapid evaluation and local demonstration.

| Action | File | Description |
| :--- | :--- | :--- |
| **Start Platform** | [`START_RELOOP.bat`](file:///D:/RELOOP/START_RELOOP.bat) | Checks environment, starts Express backend & Vite frontend, streams live logs, and automatically opens `http://localhost:5173` in your default browser. |
| **Stop Platform** | [`STOP_RELOOP.bat`](file:///D:/RELOOP/STOP_RELOOP.bat) | Safely shuts down only RELOOP's backend and frontend processes. Will not kill unrelated Node.js projects. |

---

### How It Works

#### 1. Starting RELOOP
1. Navigate to the root folder `D:\RELOOP`.
2. Double-click **`START_RELOOP.bat`**.
3. The launcher terminal will open and perform automated pre-flight checks:
   - **MongoDB Check**: Verifies that MongoDB Community Server is listening on port `27017`.
   - **Port Collision Check**: Ensures ports `5000` (API) and `5173` (Frontend) are available.
   - **Duplicate Launch Prevention**: Prevents launching duplicate instances if RELOOP is already active.
4. Spawns both servers simultaneously with dedicated process tracking:
   - **Backend**: Express API on `http://localhost:5000`
   - **Frontend**: React 18 + Vite on `http://localhost:5173`
5. Records process IDs to `.reloop_pids.json` for deterministic tracking.
6. Once health checks pass, your default web browser will automatically open to `http://localhost:5173`.
7. **Keep the launcher terminal window open** while using or testing RELOOP.

#### 2. Stopping RELOOP
You can stop the platform using either of two methods:
- **Method A (Interactive)**: Return to the launcher terminal and press **`Ctrl + C`**. Both servers will shut down immediately and cleanly.
- **Method B (Double-Click)**: Double-click **`STOP_RELOOP.bat`** from Windows Explorer. It reads `.reloop_pids.json`, terminates only RELOOP's spawned process trees, and removes the lockfile.

> [!IMPORTANT]
> **Process Isolation Guarantee**: `STOP_RELOOP.bat` targets strictly RELOOP's recorded PIDs and verifies that any lingering listener on ports 5000/5173 belongs to the `D:\RELOOP` workspace. It will **never** terminate unrelated Node.js applications, dev servers, or other projects running on your machine.

---

### Port & Service Architecture

| Service | Host & Port | Description |
| :--- | :--- | :--- |
| **Storefront (Vite + React)** | `http://localhost:5173` | Customer marketplace, product catalogue, checkout, customer orders, and admin console. |
| **Backend API (Express.js)** | `http://localhost:5000` | REST API, JWT auth, authoritative pricing, atomic inventory decrements, and trade-in valuation. |
| **Database (MongoDB)** | `mongodb://127.0.0.1:27017/reloop` | Local MongoDB Community Server storing products, users, orders, and digital passports. |

---

### Pre-Configured Verified Credentials

The platform includes verified database seed accounts for academic evaluation:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@reloop.com` | `admin123` | Full access to `/admin` dashboard, product CRUD, order status transitions, and customer registry. |
| **Customer** | `customer@reloop.com` | `password123` | Access to `/account`, orders history, wishlist, checkout, and trade-in requests. |

---

### Troubleshooting Common Issues

#### Issue 1: "CONFLICT on port 5173 / Port 5173 is occupied by external process"
- **Cause**: Another project or dev server (such as an earlier Vite instance) is using port 5173.
- **Resolution**:
  1. The launcher will output the exact PID and command line of the conflicting process.
  2. Close the terminal window of the other application, or terminate that specific PID.
  3. Re-run `START_RELOOP.bat`.

#### Issue 2: "MongoDB not detected on port 27017"
- **Cause**: MongoDB Community Server service is not running.
- **Resolution**:
  1. Open Windows **Services** (`services.msc`).
  2. Locate **MongoDB Server (MongoDB)** and click **Start**.
  3. Alternatively, open PowerShell and run: `net start MongoDB`.

#### Issue 3: "RELOOP is already active on this system"
- **Cause**: An earlier RELOOP session was started and is still running in the background.
- **Resolution**:
  1. Double-click `STOP_RELOOP.bat` to clear the previous session.
  2. Double-click `START_RELOOP.bat` to launch fresh.

---

### Verification & Testing Commands

To run the automated compliance test suites manually from the terminal:

```powershell
# Run backend health checks (6 tests)
cd d:\RELOOP\server
npm run test:health

# Run full compliance workflow audit (18 tests)
npm run test:audit

# Run targeted full-stack regression suite (15 tests)
npm run test:regression

# Run master end-to-end integration suite (35 tests)
npm run test:e2e

# Run image upload & catalogue sync verification
npm run test:upload

# Verify frontend production build
cd d:\RELOOP\client
npm run build
```

---

### Demonstrating Database & Collections (Lecturer Demonstration)

RELOOP connects to a local MongoDB Community instance:
- **Connection URI**: `mongodb://127.0.0.1:27017`
- **Database Name**: `reloop`

#### 1. Instant MongoDB Compass Launch
Double-click **[`OPEN_DATABASE_GUI.bat`](file:///D:/RELOOP/OPEN_DATABASE_GUI.bat)**. It automatically launches MongoDB Compass pre-connected to `mongodb://127.0.0.1:27017` and opens the database inspection window.

#### 2. Canonical Collections & Schema Guide

| Collection Name | Document Count | Description & Key Schema Fields |
| :--- | :--- | :--- |
| `products` | 72 active items | Certified refurbished devices (exactly 9 per category across all 8 categories). Fields: `title`, `brand`, `category`, `refurbishedPrice`, `originalRetailPrice`, `stockCount`, `conditionGrade`, `images`, `specifications`, `digitalPassportId`. |
| `orders` | Dynamic | Customer transactions. Fields: `orderNumber`, `user`, `orderItems`, `shippingAddress`, `pricing`, `paymentDetails` (`paymentMethod`, `status`, `transactionId`), `orderStatus`, `statusTimeline`. |
| `users` | Verified accounts | System accounts (`admin@reloop.com`, `customer@reloop.com`, etc.). Fields: `name`, `email`, `password` (bcrypt hash), `role` (`admin` / `customer`). |
| `tradeinrequests` | Dynamic | Customer device trade-in valuations. Fields: `user`, `deviceType`, `brand`, `model`, `estimatedValue`, `condition`, `status`. |
| `digitalpassports` | 72+ passports | Cryptographic device passports. Fields: `productId`, `deviceSerialNumber`, `diagnosticSummaryScore`, `subsystemChecks` (screen, battery, chassis, etc.), `partsReplaced`. |

---

### Payment Method & Status Logic

RELOOP strictly maintains separate states for payment method, payment status, and order fulfillment status:

1. **Cash on Delivery (COD)**:
   - `paymentMethod`: `Cash on Delivery`
   - `paymentStatus`: `Pending` (unpaid upon order placement)
   - `orderStatus`: `Order Placed`
   - *Admin Fulfillment Note*: When an admin transitions an order to `Dispatched` or `Delivered`, the payment status remains `Pending` until the admin explicitly records payment collection via the **"Record COD Payment Received"** action.
2. **Simulated Card Payment**:
   - `paymentMethod`: `Simulated Card`
   - `paymentStatus`: `Paid` (instant sandbox authorization)
   - Disclosed: No real card networks are billed; test card simulator (`4242 4242 4242 4242`) used for academic assessment.
3. **Simulated UPI Payment**:
   - `paymentMethod`: `UPI Simulator`
   - `paymentStatus`: `Paid` (instant sandbox authorization)
   - Disclosed: Demonstrates virtual payment address routing without debiting real bank accounts.

---

### Verifying Admin Product Creation & Immediate Storefront Synchronisation

To demonstrate live catalogue sync to a lecturer:
1. Log in as Administrator: `admin@reloop.com` / `admin123`.
2. Navigate to **Admin Console** -> **Products & Inventory** (`/admin/products`).
3. Click **"Add New Product"**:
   - Enter Title: `Demonstration Certified ThinkPad T14`
   - Select Brand: `Lenovo`, Category: `Laptops`, Condition: `Pristine`
   - Set Refurbished Price: `₹52,000`, Stock: `3`
   - *Image upload is optional*: Leave blank to test automated category fallback, or upload an authentic photo.
4. Click **"Create & Publish Product"**.
5. Switch to a public browser tab at `/products` (or use search bar with `ThinkPad`):
   - Notice the product immediately appears in search results and category grids without restarting any server or resetting MongoDB.
   - Click the product card to inspect its real-time detail page, stock availability, and generated Digital Product Passport.
