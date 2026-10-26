const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to create standalone SVG
function writeSvg(filename, svgContent) {
  const fullPath = path.join(targetDir, filename);
  fs.writeFileSync(fullPath, svgContent.trim());
  console.log(`Generated: ${filename}`);
}

// 1. Generic Fallback
writeSvg('fallback-default.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F1F5F9" rx="12" />
  <circle cx="200" cy="140" r="48" fill="#E2E8F0" />
  <path d="M180 140 A 20 20 0 1 1 220 140" stroke="#16804A" stroke-width="6" fill="none" stroke-linecap="round" />
  <polygon points="220,132 230,140 220,148" fill="#16804A" />
  <text x="200" y="215" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" font-weight="600" fill="#475569">RELOOP CERTIFIED PRODUCT</text>
  <text x="200" y="235" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" fill="#94A3B8">Quality renewed. Value restored.</text>
</svg>
`);

// 2. MacBook Air M1
writeSvg('macbook-air-m1.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Display Lid Open -->
  <rect x="75" y="45" width="250" height="155" rx="8" fill="#24292E" stroke="#64748B" stroke-width="2" />
  <!-- Screen Area -->
  <rect x="85" y="55" width="230" height="135" rx="3" fill="#0F172A" />
  <path d="M85 55 L315 190 L85 190 Z" fill="#1E293B" opacity="0.6"/>
  <circle cx="200" cy="120" r="14" fill="#38BDF8" opacity="0.8" />
  <!-- Apple Logo Outline on Screen center -->
  <path d="M200 115 C197 115 195 117 195 120 C195 125 200 128 200 128 C200 128 205 125 205 120 C205 117 203 115 200 115 Z" fill="#FFFFFF" />
  <!-- WebCam -->
  <circle cx="200" cy="50" r="1.5" fill="#475569" />
  <!-- Hinge -->
  <rect x="150" y="200" width="100" height="4" fill="#334155" rx="2" />
  <!-- Base Keyboard Deck (Wedge) -->
  <polygon points="50,235 350,235 330,204 70,204" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5" />
  <!-- Keyboard area -->
  <polygon points="90,224 310,224 300,207 100,207" fill="#1E293B" />
  <!-- Trackpad -->
  <rect x="165" y="226" width="70" height="7" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.7" />
  <!-- Front lip -->
  <path d="M50 235 L350 235 L346 240 L54 240 Z" fill="#94A3B8" />
  <!-- Badge -->
  <rect x="14" y="14" width="94" height="22" rx="11" fill="#EBFBEE" />
  <text x="61" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#16804A">APPLE M1 · 13.3"</text>
</svg>
`);

// 3. Dell XPS 13
writeSvg('dell-xps-13.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="75" y="42" width="250" height="158" rx="6" fill="#1E293B" stroke="#475569" stroke-width="2" />
  <!-- InfinityEdge Screen -->
  <rect x="78" y="45" width="244" height="152" rx="3" fill="#0B1329" />
  <line x1="78" y1="120" x2="322" y2="120" stroke="#0284C7" stroke-width="2" opacity="0.4" />
  <!-- Windows 11 wallpaper bloom -->
  <circle cx="200" cy="115" r="30" fill="#0284C7" opacity="0.3" />
  <circle cx="200" cy="115" r="18" fill="#38BDF8" opacity="0.5" />
  <!-- Base Aluminum & Carbon Fiber -->
  <polygon points="45,236 355,236 332,200 68,200" fill="#0F172A" stroke="#94A3B8" stroke-width="1.5" />
  <!-- Carbon Fiber Palmrest Weave Texture -->
  <polygon points="50,234 350,234 329,202 71,202" fill="#1E293B" />
  <!-- Keyboard Island -->
  <polygon points="85,224 315,224 305,204 95,204" fill="#0F172A" />
  <!-- Trackpad -->
  <rect x="160" y="226" width="80" height="8" rx="1" fill="#334155" stroke="#64748B" stroke-width="0.8" />
  <rect x="14" y="14" width="94" height="22" rx="11" fill="#E0F2FE" />
  <text x="61" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">DELL XPS · FHD+</text>
</svg>
`);

// 4. HP Pavilion 15
writeSvg('hp-pavilion-15.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="65" y="40" width="270" height="162" rx="6" fill="#334155" stroke="#94A3B8" stroke-width="1.5" />
  <rect x="73" y="47" width="254" height="148" rx="2" fill="#0F172A" />
  <circle cx="200" cy="115" r="24" fill="#6366F1" opacity="0.4" />
  <polygon points="40,240 360,240 338,202 62,202" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
  <polygon points="75,228 325,228 315,205 85,205" fill="#475569" />
  <rect x="155" y="230" width="85" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" stroke-width="0.7" />
  <rect x="14" y="14" width="96" height="22" rx="11" fill="#FEF3C7" />
  <text x="62" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#D97706">RYZEN 5 · 15.6"</text>
</svg>
`);

// 5. Lenovo ThinkPad T14
writeSvg('lenovo-thinkpad-t14.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Matte Black Display -->
  <rect x="70" y="42" width="260" height="160" rx="4" fill="#090D14" stroke="#1E293B" stroke-width="2" />
  <rect x="78" y="50" width="244" height="144" rx="2" fill="#0F172A" />
  <text x="90" y="70" font-family="monospace" font-size="10" fill="#22C55E">> ThinkPad OS Ready</text>
  <!-- Matte Black Base -->
  <polygon points="45,238 355,238 335,202 65,202" fill="#0A0E17" stroke="#1E293B" stroke-width="1.5" />
  <!-- Keyboard Grid -->
  <polygon points="80,225 320,225 310,205 90,205" fill="#182232" />
  <!-- Iconic Red TrackPoint -->
  <circle cx="200" cy="215" r="3" fill="#DC2626" />
  <!-- TrackPoint Clickers with red stripe -->
  <rect x="175" y="226" width="50" height="4" fill="#1E293B" />
  <line x1="175" y1="226" x2="225" y2="226" stroke="#DC2626" stroke-width="1.2" />
  <!-- Touchpad -->
  <rect x="170" y="231" width="60" height="6" rx="1" fill="#0F172A" stroke="#334155" stroke-width="0.5" />
  <rect x="14" y="14" width="104" height="22" rx="11" fill="#FEE2E2" />
  <text x="66" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#DC2626">THINKPAD · MIL-SPEC</text>
</svg>
`);

// 6. Apple iPhone 13
writeSvg('iphone-13.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Phone Body Outer Frame (Midnight) -->
  <rect x="142" y="30" width="116" height="238" rx="26" fill="#111827" stroke="#374151" stroke-width="3" />
  <!-- OLED Screen -->
  <rect x="147" y="35" width="106" height="228" rx="22" fill="#030712" />
  <!-- Screen Wallpaper Gradient -->
  <rect x="147" y="35" width="106" height="228" rx="22" fill="url(#iphoneGrad)" />
  <defs>
    <linearGradient id="iphoneGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="60%" stop-color="#312E81" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
  </defs>
  <!-- Camera Notch -->
  <path d="M182 35 L182 45 Q182 48 185 48 L215 48 Q218 48 218 45 L218 35 Z" fill="#111827" />
  <!-- Home Indicator Bar -->
  <rect x="175" y="254" width="50" height="3" rx="1.5" fill="#FFFFFF" opacity="0.8" />
  <!-- Side Buttons -->
  <rect x="139" y="80" width="3" height="16" rx="1" fill="#4B5563" />
  <rect x="139" y="105" width="3" height="24" rx="1" fill="#4B5563" />
  <rect x="139" y="135" width="3" height="24" rx="1" fill="#4B5563" />
  <rect x="258" y="100" width="3" height="34" rx="1" fill="#4B5563" />
  <!-- Badge -->
  <rect x="14" y="14" width="104" height="22" rx="11" fill="#EBFBEE" />
  <text x="66" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#16804A">IPHONE 13 · 128GB</text>
</svg>
`);

// 7. Samsung Galaxy S22
writeSvg('galaxy-s22.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- S22 Body Contour Cut -->
  <rect x="142" y="30" width="116" height="238" rx="20" fill="#18181B" stroke="#52525B" stroke-width="2.5" />
  <!-- Dynamic AMOLED 2X Screen -->
  <rect x="146" y="34" width="108" height="230" rx="17" fill="#09090B" />
  <!-- Center Punch-Hole Camera -->
  <circle cx="200" cy="46" r="3" fill="#18181B" />
  <circle cx="200" cy="46" r="1.2" fill="#0284C7" />
  <!-- Gradient Wallpaper -->
  <circle cx="200" cy="150" r="45" fill="#8B5CF6" opacity="0.35" />
  <circle cx="180" cy="170" r="35" fill="#EC4899" opacity="0.3" />
  <!-- Bottom Pill Indicator -->
  <rect x="180" y="255" width="40" height="3" rx="1.5" fill="#D4D4D8" />
  <rect x="14" y="14" width="108" height="22" rx="11" fill="#E0F2FE" />
  <text x="68" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">GALAXY S22 · 5G</text>
</svg>
`);

// 8. Apple iPad Air 4
writeSvg('ipad-air-4.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- iPad Chassis (Space Grey) -->
  <rect x="105" y="25" width="190" height="250" rx="18" fill="#1F2937" stroke="#4B5563" stroke-width="2" />
  <!-- Liquid Retina Screen with symmetrical bezels -->
  <rect x="114" y="34" width="172" height="232" rx="12" fill="#030712" />
  <!-- Fluid iPadOS Wallpaper Rings -->
  <ellipse cx="200" cy="150" rx="60" ry="80" fill="#3B82F6" opacity="0.3" />
  <ellipse cx="180" cy="130" rx="40" ry="60" fill="#10B981" opacity="0.3" />
  <!-- Front Camera on top bezel -->
  <circle cx="200" cy="29" r="1.8" fill="#4B5563" />
  <!-- Home Indicator -->
  <rect x="175" y="258" width="50" height="3" rx="1.5" fill="#FFFFFF" opacity="0.7" />
  <rect x="14" y="14" width="112" height="22" rx="11" fill="#EBFBEE" />
  <text x="70" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#16804A">IPAD AIR · 10.9"</text>
</svg>
`);

// 9. Sony WH-1000XM4
writeSvg('sony-wh1000xm4.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Headband Arc -->
  <path d="M120 180 C110 80, 290 80, 280 180" stroke="#1E293B" stroke-width="22" stroke-linecap="round" fill="none" />
  <path d="M120 180 C110 80, 290 80, 280 180" stroke="#0F172A" stroke-width="16" stroke-linecap="round" fill="none" />
  <!-- Headband Cushion Underneath -->
  <path d="M140 145 C150 95, 250 95, 260 145" stroke="#334155" stroke-width="6" stroke-linecap="round" fill="none" />
  <!-- Left Earcup Assembly -->
  <ellipse cx="115" cy="190" rx="30" ry="46" fill="#0F172A" stroke="#B45309" stroke-width="2" />
  <ellipse cx="115" cy="190" rx="20" ry="34" fill="#1E293B" />
  <!-- Right Earcup Assembly -->
  <ellipse cx="285" cy="190" rx="30" ry="46" fill="#0F172A" stroke="#B45309" stroke-width="2" />
  <ellipse cx="285" cy="190" rx="20" ry="34" fill="#1E293B" />
  <!-- Sony Gold Logo accent line -->
  <rect x="105" y="155" width="20" height="3" rx="1.5" fill="#D97706" />
  <rect x="275" y="155" width="20" height="3" rx="1.5" fill="#D97706" />
  <rect x="14" y="14" width="124" height="22" rx="11" fill="#FEF3C7" />
  <text x="76" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#B45309">SONY ANC HEADPHONES</text>
</svg>
`);

// 10. NVIDIA RTX 3070 Ti
writeSvg('rtx-3070-ti.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Dual Slot Shroud Body -->
  <rect x="55" y="85" width="290" height="130" rx="10" fill="#18181B" stroke="#3F3F46" stroke-width="3" />
  <!-- Metal Fin Array Texture -->
  <line x1="65" y1="100" x2="335" y2="100" stroke="#27272A" stroke-width="4" stroke-dasharray="2,3" />
  <line x1="65" y1="200" x2="335" y2="200" stroke="#27272A" stroke-width="4" stroke-dasharray="2,3" />
  <!-- Fan 1 (Left) -->
  <circle cx="135" cy="150" r="44" fill="#09090B" stroke="#52525B" stroke-width="2" />
  <circle cx="135" cy="150" r="14" fill="#27272A" />
  <!-- Fan 1 Blades -->
  <path d="M135 110 Q140 135 135 150 Q130 135 135 110" fill="#71717A" />
  <path d="M135 190 Q140 165 135 150 Q130 165 135 190" fill="#71717A" />
  <path d="M95 150 Q120 155 135 150 Q120 145 95 150" fill="#71717A" />
  <path d="M175 150 Q150 155 135 150 Q150 145 175 150" fill="#71717A" />
  <!-- Fan 2 (Right) -->
  <circle cx="265" cy="150" r="44" fill="#09090B" stroke="#52525B" stroke-width="2" />
  <circle cx="265" cy="150" r="14" fill="#27272A" />
  <!-- Fan 2 Blades -->
  <path d="M265 110 Q270 135 265 150 Q260 135 265 110" fill="#71717A" />
  <path d="M265 190 Q270 165 265 150 Q260 165 265 190" fill="#71717A" />
  <path d="M225 150 Q250 155 265 150 Q250 145 225 150" fill="#71717A" />
  <path d="M305 150 Q280 155 265 150 Q280 145 305 150" fill="#71717A" />
  <!-- PCIe Gold Connector -->
  <rect x="100" y="215" width="120" height="6" fill="#EAB308" rx="1" />
  <!-- Top GEFORCE RTX Badge -->
  <text x="200" y="105" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#22C55E">GEFORCE RTX 3070 Ti</text>
  <rect x="14" y="14" width="122" height="22" rx="11" fill="#DCFCE7" />
  <text x="75" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#15803D">8GB GDDR6X · GPU</text>
</svg>
`);

// 11. Apple Watch Series 7 (Wearables)
writeSvg('apple-watch-7.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Sport Band Top -->
  <path d="M165 15 L165 75 L235 75 L235 15 Z" fill="#334155" />
  <!-- Sport Band Bottom -->
  <path d="M165 225 L165 285 L235 285 L235 225 Z" fill="#334155" />
  <!-- Watch Case (Curved 45mm Midnight) -->
  <rect x="145" y="70" width="110" height="160" rx="34" fill="#0F172A" stroke="#334155" stroke-width="2.5" />
  <!-- OLED Display -->
  <rect x="151" y="76" width="98" height="148" rx="28" fill="#000000" />
  <!-- Activity Rings -->
  <circle cx="200" cy="150" r="38" stroke="#EF4444" stroke-width="6" fill="none" stroke-dasharray="180,60" />
  <circle cx="200" cy="150" r="28" stroke="#22C55E" stroke-width="6" fill="none" stroke-dasharray="140,50" />
  <circle cx="200" cy="150" r="18" stroke="#06B6D4" stroke-width="6" fill="none" stroke-dasharray="90,40" />
  <!-- Digital Crown (Right side) with Red Ring -->
  <rect x="255" y="95" width="8" height="28" rx="3" fill="#334155" stroke="#DC2626" stroke-width="1.5" />
  <!-- Side Button -->
  <rect x="255" y="145" width="5" height="36" rx="2" fill="#1E293B" />
  <rect x="14" y="14" width="116" height="22" rx="11" fill="#EBFBEE" />
  <text x="72" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#16804A">APPLE WATCH S7 · 45MM</text>
</svg>
`);

// 12. Samsung Galaxy Watch 4 (Wearables)
writeSvg('galaxy-watch-4.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Band Top -->
  <rect x="175" y="15" width="50" height="70" fill="#1E293B" />
  <!-- Band Bottom -->
  <rect x="175" y="215" width="50" height="70" fill="#1E293B" />
  <!-- Circular Watch Case -->
  <circle cx="200" cy="150" r="70" fill="#0F172A" stroke="#475569" stroke-width="3" />
  <!-- Circular AMOLED Screen -->
  <circle cx="200" cy="150" r="62" fill="#000000" />
  <!-- Clock Hands & Heart Rate -->
  <circle cx="200" cy="150" r="4" fill="#22C55E" />
  <line x1="200" y1="150" x2="200" y2="105" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round" />
  <line x1="200" y1="150" x2="235" y2="150" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round" />
  <text x="200" y="185" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#22C55E">♥ 72 BPM</text>
  <!-- Dual Side Buttons -->
  <rect x="268" y="115" width="5" height="22" rx="2" fill="#334155" />
  <rect x="268" y="160" width="5" height="22" rx="2" fill="#334155" />
  <rect x="14" y="14" width="116" height="22" rx="11" fill="#E0F2FE" />
  <text x="72" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">GALAXY WATCH 4 · 44MM</text>
</svg>
`);

// 13. Sony PlayStation 5 Digital (Gaming)
writeSvg('ps5-digital.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- PS5 Outer White Curved Wing Shell -->
  <path d="M170 30 Q160 140 165 255 L190 260 Q180 140 185 30 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" />
  <!-- Black Glossy Center Monolith -->
  <rect x="185" y="35" width="30" height="225" rx="3" fill="#090D14" />
  <!-- Blue LED Accent Line -->
  <line x1="185" y1="40" x2="185" y2="255" stroke="#38BDF8" stroke-width="2" opacity="0.9" />
  <!-- Right White Curved Wing Shell -->
  <path d="M215 30 Q225 140 220 255 L245 260 Q250 140 240 30 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" />
  <!-- Base Stand -->
  <ellipse cx="205" cy="265" rx="45" ry="10" fill="#0F172A" />
  <!-- DualSense Controller Beside Console -->
  <g transform="translate(250, 160) scale(0.65)">
    <path d="M30 30 C15 70, 0 110, 20 120 C35 125, 55 90, 70 80 L110 80 C125 90, 145 125, 160 120 C180 110, 165 70, 150 30 C130 15, 50 15, 30 30 Z" fill="#FFFFFF" stroke="#64748B" stroke-width="3" />
    <circle cx="65" cy="70" r="14" fill="#0F172A" />
    <circle cx="115" cy="70" r="14" fill="#0F172A" />
  </g>
  <rect x="14" y="14" width="116" height="22" rx="11" fill="#EDE9FE" />
  <text x="72" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#7C3AED">PS5 DIGITAL EDITION</text>
</svg>
`);

// 14. Nintendo Switch OLED (Gaming)
writeSvg('nintendo-switch-oled.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Left White Joy-Con -->
  <path d="M85 75 L85 225 Q55 225 55 195 L55 105 Q55 75 85 75 Z" fill="#F8FAFC" stroke="#64748B" stroke-width="2" />
  <circle cx="70" cy="115" r="9" fill="#0F172A" />
  <circle cx="70" cy="165" r="4" fill="#334155" />
  <!-- Right White Joy-Con -->
  <path d="M315 75 L315 225 Q345 225 345 195 L345 105 Q345 75 315 75 Z" fill="#F8FAFC" stroke="#64748B" stroke-width="2" />
  <circle cx="330" cy="180" r="9" fill="#0F172A" />
  <circle cx="330" cy="130" r="4" fill="#334155" />
  <!-- Center OLED Screen Console -->
  <rect x="85" y="70" width="230" height="160" rx="6" fill="#0F172A" stroke="#334155" stroke-width="2" />
  <rect x="95" y="78" width="210" height="144" rx="3" fill="#000000" />
  <!-- Game display artwork -->
  <rect x="100" y="82" width="200" height="136" fill="#0284C7" opacity="0.6" />
  <circle cx="200" cy="150" r="28" fill="#F59E0B" opacity="0.8" />
  <text x="200" y="155" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#FFFFFF">OLED 7"</text>
  <rect x="14" y="14" width="124" height="22" rx="11" fill="#FEF3C7" />
  <text x="76" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#D97706">SWITCH OLED CONSOLE</text>
</svg>
`);

// 15. Sony Alpha A6400 Mirrorless (Cameras)
writeSvg('sony-a6400.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Camera Body -->
  <rect x="80" y="90" width="240" height="135" rx="8" fill="#18181B" stroke="#3F3F46" stroke-width="2" />
  <!-- Grip on right side -->
  <rect x="270" y="90" width="50" height="135" rx="8" fill="#09090B" />
  <!-- Texture on grip -->
  <line x1="275" y1="100" x2="315" y2="100" stroke="#27272A" stroke-width="2" stroke-dasharray="2,2" />
  <line x1="275" y1="210" x2="315" y2="210" stroke="#27272A" stroke-width="2" stroke-dasharray="2,2" />
  <!-- Viewfinder hump (Left side for rangefinder) -->
  <rect x="95" y="78" width="30" height="14" rx="3" fill="#18181B" />
  <rect x="100" y="82" width="16" height="8" rx="1" fill="#0284C7" />
  <!-- Shutter Button & Dial -->
  <circle cx="295" cy="86" r="8" fill="#71717A" />
  <circle cx="250" cy="86" r="9" fill="#27272A" stroke="#52525B" stroke-width="1.5" />
  <!-- E-mount Lens Barrel (Center-Left) -->
  <circle cx="180" cy="158" r="54" fill="#09090B" stroke="#52525B" stroke-width="4" />
  <circle cx="180" cy="158" r="42" fill="#18181B" stroke="#B45309" stroke-width="1.5" />
  <circle cx="180" cy="158" r="30" fill="#030712" />
  <!-- Lens Glass Optical Reflection -->
  <path d="M165 140 A 20 20 0 0 1 195 140" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8" />
  <!-- Alpha Orange ring -->
  <circle cx="180" cy="158" r="45" stroke="#EA580C" stroke-width="1.5" fill="none" />
  <rect x="14" y="14" width="124" height="22" rx="11" fill="#FFEDD5" />
  <text x="76" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#C2410C">SONY ALPHA A6400 · 4K</text>
</svg>
`);

// 16. Canon EOS R50 (Cameras)
writeSvg('canon-eos-r50.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Center Prism Hump -->
  <polygon points="170,95 230,95 245,68 155,68" fill="#18181B" stroke="#3F3F46" stroke-width="2" />
  <!-- Camera Body -->
  <rect x="85" y="92" width="230" height="135" rx="10" fill="#18181B" stroke="#3F3F46" stroke-width="2" />
  <!-- Deep Grip -->
  <rect x="265" y="92" width="50" height="135" rx="8" fill="#09090B" />
  <!-- Lens Barrel -->
  <circle cx="180" cy="160" r="55" fill="#09090B" stroke="#52525B" stroke-width="3" />
  <circle cx="180" cy="160" r="42" fill="#18181B" stroke="#71717A" stroke-width="1.5" />
  <circle cx="180" cy="160" r="30" fill="#020617" />
  <!-- Lens Reflection -->
  <ellipse cx="170" cy="148" rx="14" ry="7" fill="#06B6D4" opacity="0.6" />
  <rect x="14" y="14" width="120" height="22" rx="11" fill="#FEE2E2" />
  <text x="74" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#DC2626">CANON EOS R50 · 24MP</text>
</svg>
`);

// 17. Google Pixel 7 (Smartphones)
writeSvg('pixel-7.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="135" y="30" width="130" height="240" rx="20" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
  <!-- Pixel Visor Bar -->
  <rect x="135" y="70" width="130" height="36" fill="#1E293B" />
  <!-- Dual camera cutouts -->
  <circle cx="165" cy="88" r="9" fill="#020617" stroke="#64748B" stroke-width="1.5" />
  <circle cx="195" cy="88" r="9" fill="#020617" stroke="#64748B" stroke-width="1.5" />
  <circle cx="240" cy="88" r="4" fill="#F8FAFC" />
  <!-- G logo on back -->
  <circle cx="200" cy="180" r="12" fill="none" stroke="#64748B" stroke-width="4" stroke-dasharray="60 20" />
  <rect x="14" y="14" width="130" height="22" rx="11" fill="#E0F2FE" />
  <text x="79" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">GOOGLE PIXEL 7 · 5G</text>
</svg>
`);

// 18. OnePlus 10 Pro (Smartphones)
writeSvg('oneplus-10-pro.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="135" y="30" width="130" height="240" rx="20" fill="#0F172A" stroke="#334155" stroke-width="2" />
  <!-- Wrapped ceramic camera module on left edge -->
  <path d="M135 60 L210 60 C218 60 224 66 224 74 L224 140 C224 148 218 154 210 154 L135 154 Z" fill="#1E293B" stroke="#475569" stroke-width="1.5" />
  <circle cx="165" cy="85" r="12" fill="#020617" stroke="#94A3B8" stroke-width="1.5" />
  <circle cx="195" cy="85" r="12" fill="#020617" stroke="#94A3B8" stroke-width="1.5" />
  <circle cx="165" cy="125" r="12" fill="#020617" stroke="#94A3B8" stroke-width="1.5" />
  <circle cx="195" cy="125" r="8" fill="#F59E0B" />
  <rect x="14" y="14" width="140" height="22" rx="11" fill="#FEE2E2" />
  <text x="84" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#DC2626">ONEPLUS 10 PRO · 5G</text>
</svg>
`);

// 19. Samsung Galaxy Tab S8 (Tablets)
writeSvg('galaxy-tab-s8.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="80" y="45" width="240" height="210" rx="14" fill="#334155" stroke="#64748B" stroke-width="2" />
  <rect x="90" y="55" width="220" height="190" rx="8" fill="#0F172A" />
  <circle cx="200" cy="150" r="30" fill="#38BDF8" opacity="0.3" />
  <!-- S Pen magnetic charging strip on side -->
  <rect x="295" y="80" width="6" height="80" rx="3" fill="#1E293B" stroke="#94A3B8" stroke-width="1" />
  <rect x="14" y="14" width="144" height="22" rx="11" fill="#EDE9FE" />
  <text x="86" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#7C3AED">GALAXY TAB S8 · 11"</text>
</svg>
`);

// 20. Apple iPad Pro 11-inch (Tablets)
writeSvg('ipad-pro-11.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="85" y="40" width="230" height="220" rx="18" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
  <rect x="95" y="50" width="210" height="200" rx="12" fill="#020617" />
  <path d="M120 70 L280 230" stroke="#06B6D4" stroke-width="12" stroke-linecap="round" opacity="0.8" />
  <path d="M160 70 L240 230" stroke="#8B5CF6" stroke-width="8" stroke-linecap="round" opacity="0.7" />
  <rect x="14" y="14" width="136" height="22" rx="11" fill="#E0F2FE" />
  <text x="82" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">IPAD PRO 11" · M1 CHIP</text>
</svg>
`);

// 21. Apple AirPods Pro 2 (Audio)
writeSvg('airpods-pro-2.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Charging Case -->
  <rect x="130" y="90" width="140" height="110" rx="35" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5" />
  <line x1="130" y1="125" x2="270" y2="125" stroke="#E2E8F0" stroke-width="1.5" />
  <circle cx="200" cy="145" r="2.5" fill="#22C55E" />
  <!-- Earbud Left -->
  <circle cx="110" cy="80" r="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
  <rect x="105" y="90" width="8" height="28" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
  <!-- Earbud Right -->
  <circle cx="290" cy="80" r="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
  <rect x="287" y="90" width="8" height="28" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
  <rect x="14" y="14" width="134" height="22" rx="11" fill="#EBFBEE" />
  <text x="81" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#16804A">AIRPODS PRO · GEN 2</text>
</svg>
`);

// 22. Bose Noise Cancelling 700 (Audio)
writeSvg('bose-700.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Headband Arch -->
  <path d="M125 170 C125 70 275 70 275 170" fill="none" stroke="#475569" stroke-width="7" stroke-linecap="round" />
  <!-- Earcups -->
  <ellipse cx="120" cy="175" rx="32" ry="46" fill="#1E293B" stroke="#64748B" stroke-width="2" />
  <ellipse cx="280" cy="175" rx="32" ry="46" fill="#1E293B" stroke="#64748B" stroke-width="2" />
  <line x1="120" y1="130" x2="120" y2="210" stroke="#94A3B8" stroke-width="3" stroke-linecap="round" />
  <line x1="280" y1="130" x2="280" y2="210" stroke="#94A3B8" stroke-width="3" stroke-linecap="round" />
  <rect x="14" y="14" width="126" height="22" rx="11" fill="#FEF3C7" />
  <text x="77" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#D97706">BOSE NC 700 · LUXE</text>
</svg>
`);

// 23. JBL Charge 5 (Audio)
writeSvg('jbl-charge-5.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Cylindrical Speaker Body -->
  <rect x="90" y="100" width="220" height="100" rx="35" fill="#18181B" stroke="#DC2626" stroke-width="2.5" />
  <ellipse cx="100" cy="150" rx="14" ry="40" fill="#09090B" stroke="#EF4444" stroke-width="2" />
  <ellipse cx="300" cy="150" rx="14" ry="40" fill="#09090B" stroke="#EF4444" stroke-width="2" />
  <!-- JBL Bold Center Badge -->
  <rect x="165" y="130" width="70" height="40" rx="6" fill="#EF4444" />
  <text x="200" y="157" text-anchor="middle" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF">JBL</text>
  <rect x="14" y="14" width="128" height="22" rx="11" fill="#FEE2E2" />
  <text x="78" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#DC2626">JBL CHARGE 5 · IP67</text>
</svg>
`);

// 24. Garmin Forerunner 255 (Wearables)
writeSvg('garmin-forerunner.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Sports Silicone Strap -->
  <rect x="175" y="20" width="50" height="260" rx="10" fill="#0284C7" />
  <!-- Circular Bezel -->
  <circle cx="200" cy="150" r="62" fill="#0F172A" stroke="#38BDF8" stroke-width="3" />
  <!-- Dial Display -->
  <circle cx="200" cy="150" r="48" fill="#020617" />
  <!-- Metric Rings -->
  <circle cx="200" cy="150" r="38" fill="none" stroke="#22C55E" stroke-width="3" stroke-dasharray="140 60" />
  <text x="200" y="156" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">14.2 KM</text>
  <rect x="14" y="14" width="142" height="22" rx="11" fill="#E0F2FE" />
  <text x="85" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">GARMIN FORERUNNER</text>
</svg>
`);

// 25. Microsoft Xbox Series X (Gaming)
writeSvg('xbox-series-x.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Monolithic Tower -->
  <rect x="145" y="50" width="110" height="200" rx="6" fill="#18181B" stroke="#27272A" stroke-width="2" />
  <!-- Top Concave Ventilation with Green Glow -->
  <ellipse cx="200" cy="50" rx="55" ry="12" fill="#09090B" stroke="#22C55E" stroke-width="2" />
  <ellipse cx="200" cy="50" rx="35" ry="7" fill="#15803D" opacity="0.8" />
  <!-- Disc Drive Slot -->
  <line x1="160" y1="120" x2="160" y2="180" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
  <!-- Power Button -->
  <circle cx="160" cy="80" r="6" fill="#FFFFFF" />
  <rect x="14" y="14" width="138" height="22" rx="11" fill="#EBFBEE" />
  <text x="83" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#16804A">XBOX SERIES X · 1TB</text>
</svg>
`);

// 26. Valve Steam Deck (Gaming)
writeSvg('steam-deck.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Handheld Console Body -->
  <rect x="40" y="80" width="320" height="140" rx="28" fill="#1E293B" stroke="#334155" stroke-width="2" />
  <!-- Central 7-inch Display -->
  <rect x="125" y="95" width="150" height="110" rx="6" fill="#020617" stroke="#475569" stroke-width="1.5" />
  <!-- Dual Trackpads -->
  <rect x="85" y="140" width="28" height="28" rx="4" fill="#0F172A" stroke="#64748B" stroke-width="1" />
  <rect x="287" y="140" width="28" height="28" rx="4" fill="#0F172A" stroke="#64748B" stroke-width="1" />
  <!-- Thumbsticks -->
  <circle cx="99" cy="115" r="14" fill="#0F172A" stroke="#38BDF8" stroke-width="2" />
  <circle cx="301" cy="115" r="14" fill="#0F172A" stroke="#38BDF8" stroke-width="2" />
  <rect x="14" y="14" width="138" height="22" rx="11" fill="#EDE9FE" />
  <text x="83" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#7C3AED">STEAM DECK · 512GB</text>
</svg>
`);

// 27. Fujifilm X-S10 (Cameras)
writeSvg('fujifilm-xs10.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <rect x="80" y="85" width="240" height="145" rx="10" fill="#27272A" stroke="#52525B" stroke-width="2" />
  <!-- Vintage Metal Top Plate -->
  <rect x="80" y="70" width="240" height="20" rx="4" fill="#71717A" />
  <!-- Mode Dial -->
  <rect x="100" y="60" width="26" height="12" rx="2" fill="#D4D4D8" stroke="#3F3F46" stroke-width="1" />
  <!-- Lens Barrel -->
  <circle cx="185" cy="160" r="56" fill="#18181B" stroke="#3F3F46" stroke-width="3" />
  <circle cx="185" cy="160" r="38" fill="#020617" />
  <ellipse cx="178" cy="150" rx="15" ry="8" fill="#22C55E" opacity="0.6" />
  <rect x="14" y="14" width="136" height="22" rx="11" fill="#F1F5F9" />
  <text x="82" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#334155">FUJIFILM X-S10 · IBIS</text>
</svg>
`);

// 28. GoPro HERO11 Black (Cameras)
writeSvg('gopro-hero11.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Rugged Action Camera Body -->
  <rect x="120" y="75" width="160" height="150" rx="18" fill="#18181B" stroke="#0284C7" stroke-width="2.5" />
  <!-- Front LCD Screen -->
  <rect x="135" y="105" width="55" height="55" rx="6" fill="#0284C7" opacity="0.9" />
  <text x="162" y="137" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">5.3K</text>
  <!-- Lens Housing Square -->
  <rect x="205" y="95" width="65" height="65" rx="10" fill="#09090B" stroke="#38BDF8" stroke-width="2" />
  <circle cx="237" cy="127" r="24" fill="#020617" />
  <circle cx="237" cy="127" r="14" fill="#082F49" />
  <rect x="14" y="14" width="138" height="22" rx="11" fill="#E0F2FE" />
  <text x="83" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0284C7">GOPRO HERO11 · 5.3K</text>
</svg>
`);

// 29. AMD Ryzen 7 5800X (PC Components)
writeSvg('ryzen-7-5800x.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Green PCB Substrate -->
  <rect x="120" y="70" width="160" height="160" rx="8" fill="#14532D" stroke="#166534" stroke-width="3" />
  <!-- Integrated Heatspreader (IHS) -->
  <rect x="135" y="85" width="130" height="130" rx="4" fill="#CBD5E1" stroke="#94A3B8" stroke-width="2" />
  <!-- Laser engraved branding -->
  <text x="200" y="130" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="900" fill="#EA580C">AMD RYZEN</text>
  <text x="200" y="155" text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#334155">7 · 5800X</text>
  <text x="200" y="180" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" fill="#64748B">8-CORE · 16-THREAD · 4.7GHz</text>
  <polygon points="123,73 135,73 123,85" fill="#EAB308" />
  <rect x="14" y="14" width="136" height="22" rx="11" fill="#FFEDD5" />
  <text x="82" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#C2410C">RYZEN 7 5800X · AM4</text>
</svg>
`);

// 30. Corsair Vengeance RGB Pro DDR4 (PC Components)
writeSvg('corsair-ddr4.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- RAM Stick Heatsink -->
  <rect x="60" y="100" width="280" height="85" rx="6" fill="#0F172A" stroke="#334155" stroke-width="2" />
  <!-- RGB Light Bar Diffuser -->
  <rect x="60" y="85" width="280" height="18" rx="4" fill="url(#rgbGradient)" />
  <defs>
    <linearGradient id="rgbGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EC4899" />
      <stop offset="25%" stop-color="#8B5CF6" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="75%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <!-- Gold Contact Pins -->
  <rect x="75" y="185" width="250" height="15" fill="#CA8A04" />
  <text x="200" y="150" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#F8FAFC">CORSAIR VENGEANCE · 32GB</text>
  <rect x="14" y="14" width="146" height="22" rx="11" fill="#EDE9FE" />
  <text x="87" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#7C3AED">32GB DDR4 · 3600MHz</text>
</svg>
`);

// 31. Samsung 980 Pro 2TB NVMe SSD (PC Components)
writeSvg('samsung-980pro.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- M.2 2280 PCB Stick -->
  <rect x="70" y="115" width="260" height="70" rx="4" fill="#022C22" stroke="#065F46" stroke-width="2" />
  <!-- Gold M.2 Notch & Pins -->
  <rect x="60" y="125" width="12" height="50" fill="#EAB308" />
  <!-- Label with Thermal Foil -->
  <rect x="85" y="123" width="220" height="54" rx="3" fill="#0F172A" />
  <text x="195" y="145" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#FFFFFF">SAMSUNG 980 PRO</text>
  <text x="195" y="165" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#EF4444">PCIe 4.0 NVMe M.2 · 2TB</text>
  <rect x="14" y="14" width="138" height="22" rx="11" fill="#FEF3C7" />
  <text x="83" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#D97706">SAMSUNG 980 PRO 2TB</text>
</svg>
`);

// 32. ASUS ROG Zephyrus G14 (Laptops)
writeSvg('asus-zephyrus-g14.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#F8FAFC" rx="12" />
  <!-- Display Lid with AniMe Matrix dots pattern -->
  <rect x="75" y="45" width="250" height="155" rx="8" fill="#18181B" stroke="#3F3F46" stroke-width="2" />
  <rect x="85" y="55" width="230" height="135" rx="3" fill="#09090B" />
  <!-- Matrix Dots (diagonal) -->
  <circle cx="120" cy="80" r="2" fill="#E11D48" />
  <circle cx="140" cy="100" r="2" fill="#E11D48" />
  <circle cx="160" cy="120" r="2" fill="#E11D48" />
  <circle cx="180" cy="140" r="2" fill="#E11D48" />
  <text x="200" y="130" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="900" fill="#E11D48">ROG</text>
  <!-- Base Keyboard Deck -->
  <polygon points="50,235 350,235 330,204 70,204" fill="#27272A" stroke="#52525B" stroke-width="1.5" />
  <polygon points="90,224 310,224 300,207 100,207" fill="#09090B" />
  <rect x="14" y="14" width="144" height="22" rx="11" fill="#FFE4E6" />
  <text x="86" y="29" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#E11D48">ROG ZEPHYRUS · G14</text>
</svg>
`);

console.log('All 32 high-fidelity product SVGs created successfully in client/public/images/products!');

