# RELOOP — Project Plan & Assessment Strategy

**Refurbished Electronics E-Commerce Platform**  
*Quality renewed. Value restored.*  
**Target Milestone**: University Full Stack Development IA III Assessment  
**Document Version**: 1.0.0 (Planning Stage)

---

## 1. Executive Summary & Brand Identity

### 1.1 Project Objective
RELOOP is a modern, production-minded e-commerce web platform engineered for refurbished consumer electronics: laptops, smartphones, tablets, and computer components. 

The primary business problem RELOOP solves is the **"refurbished trust deficit"** — consumers hesitate to buy renewed tech due to opaque cosmetic grading, uncertain battery health, unknown repair histories, and misleading warranty claims. RELOOP addresses this through transparency-first features: an interactive **Digital Product Passport (DPP)**, an explainable **Condition Grading System**, an instant **Trade-in Valuation Calculator**, and an objective **Side-by-Side Product Comparison Matrix**.

For the Full Stack Development IA III assessment, RELOOP demonstrates comprehensive mastery across:
1. **Frontend Design**: Curated light-theme design system, responsive layouts, micro-animations, accessible UI components.
2. **Backend Integration**: Clean RESTful architecture, layered MVC pattern, schema indexing, and middleware-driven pipelines.
3. **Functionality**: End-to-end commerce lifecycle from browsing to server-validated checkout, atomic stock updates, and admin CRUD.
4. **Presentation**: Production-ready seed data, realistic demonstration scripts, and faculty inspection verification points.
5. **Innovation**: Digital Product Passports, transparent grading checklists, explainable trade-in pricing rules, and comparison tools.
6. **Documentation**: Thorough project plans, architecture diagrams, API contracts, and test acceptance criteria.

### 1.2 Brand & Visual Identity
- **Brand Name**: RELOOP
- **Tagline**: *Quality renewed. Value restored.*
- **Core Aesthetic**: Clean, high-trust, modern LIGHT-THEME commerce experience.
- **Design Palette**:
  - **Primary Navy Blue**: `#102A43` (Deep, authoritative header, primary buttons, headings)
  - **Secondary Brand Green**: `#16804A` (Sustainability, verified condition badges, success states, buy actions)
  - **Off-White / Light Canvas**: `#F8FAFC` (Warm, non-fatiguing backdrop)
  - **Surface & Cards**: `#FFFFFF` with subtle slate borders (`#E2E8F0`) and soft elevation shadows (`rgba(16, 42, 69, 0.06)`)
  - **Muted Text**: `#486581` / `#627D98`
  - **Dark Text**: `#0F172A`
  - **Accent Amber/Warning**: `#D97706` (Fair/Good condition tiers, pending status)
  - **Accent Red/Danger**: `#DC2626` (Out of stock, cancelled orders, error alerts)
- **Design Tokens**: Standardized CSS variables for typography, spacing, border-radius (8px cards, 6px buttons), and transitions (0.2s ease-in-out).
- **Usability Reference**: Adopts familiar e-commerce navigation patterns (Amazon/Flipkart-inspired layout hierarchy with persistent search, quick category bar, sticky cart summary, filter sidebar) while retaining bespoke visual identity and brand accents.

---

## 2. Project Scope & System Boundaries

### 2.1 In-Scope Capabilities

```
+---------------------------------------------------------------------------------+
|                                 RELOOP PLATFORM                                 |
+---------------------------------------+-----------------------------------------+
|           CUSTOMER STOREFRONT         |           ADMINISTRATOR PORTAL          |
+---------------------------------------+-----------------------------------------+
| - Hero Banner & Category Showcase     | - Secure Admin Authentication (RBAC)    |
| - Live Catalog Search & Auto-filter   | - Real-time Database-backed Dashboard   |
| - Multi-facet Filtering (Grade/Brand) | - Product Catalog CRUD & Image Mgmt     |
| - Detailed Product Page (PDP)         | - Digital Product Passport Editor       |
| - Digital Product Passport Modal/Tab  | - Order Lifecycle Management            |
| - Refurbished Condition Transparency  | - Inventory & Low-Stock Alerts          |
| - Side-by-Side Product Comparison     | - Trade-In Application Review Workflow  |
| - Trade-In Valuation Calculator       | - Customer Registry & Role Management   |
| - Dynamic Shopping Cart & Wishlist    | - Category & Warranty Configurator      |
| - Server-Validated Checkout           |                                         |
| - Simulated Payment Gateway           |                                         |
| - Real-time Order Tracking & History  |                                         |
| - User Authentication & Profiles      |                                         |
+---------------------------------------+-----------------------------------------+
```

### 2.2 Explicit Out-of-Scope Items (Realistic IA III Boundaries)
To ensure zero broken features during the assessment presentation and maintain code quality:
1. **Real Payment Gateway Contracts**: No live Stripe/Razorpay merchant account keys requiring bank approvals. A robust, clearly labelled **Simulated Payment Gateway** is implemented with card validation algorithms (Luhn algorithm check, CVV validation, simulated network latency, failure test cards).
2. **Third-Party Logistics (3PL) Webhooks**: Real courier API webhooks (e.g., FedEx, BlueDart) are omitted in favor of an **Internal Express Order Status Transition Engine** that can be manually or chronologically stepped through.
3. **Multi-Vendor Marketplace Complexity**: RELOOP acts as a direct certified refurbisher/retailer rather than an open unvetted multi-vendor marketplace, preserving quality assurance and realistic architectural scope.

---

## 3. User Roles & Access Control Matrix

| Capability / Resource | Guest User | Registered Customer | Administrator | Refurbishment Inspector |
|---|:---:|:---:|:---:|:---:|
| Browse Catalog, Search & Filter | Yes | Yes | Yes | Yes |
| View Product Details & Digital Passport | Yes | Yes | Yes | Yes |
| Compare Products (up to 4 items) | Yes | Yes | Yes | Yes |
| Calculate Trade-in Estimate | Yes | Yes | Yes | Yes |
| Add to Cart & Wishlist | Yes (Local) | Yes (DB/Synced) | Yes | Yes |
| Checkout & Place Orders | Prompt Login | Yes | Blocked (Admin Role) | Blocked |
| View Personal Order Tracking & Receipts | No | Yes (Own Orders) | Yes (All Orders) | Read-only |
| Submit Trade-in Request with Evidence | Prompt Login | Yes | View All | Inspect & Verify |
| Create / Edit / Delete Products | No | No | Yes | Read/Edit Passport |
| Modify Stock Levels & Pricing | No | No | Yes | No |
| Change Order Status (e.g., Dispatched) | No | No | Yes | No |
| View Executive Revenue & Sales Metrics | No | No | Yes | No |

---

## 4. Page & View Inventory

### 4.1 Customer Storefront Pages
1. **Homepage (`/`)**:
   - Hero banner communicating the brand promise ("Quality renewed. Value restored.").
   - Value pillars: 50-point diagnostic check, minimum 6-month warranty, 7-day hassle-free returns, verified carbon savings.
   - Quick Category Grid: Laptops, Smartphones, Tablets, PC Components.
   - Featured Refurbished Deals (carousel/grid with condition badges).
   - "Why Refurbished?" educational section with estimated electronic waste saved counter.
2. **Catalog / Search Results (`/products`)**:
   - Sticky top bar with search query, active chips, and sort dropdown (Price: Low to High, High to Low, Condition Grade, Newest).
   - Sidebar filters: Category, Brand, Condition Grade (Pristine, Excellent, Good, Fair), Price Range Slider, Warranty Duration, In-Stock only.
   - Product grid with responsive card design (image, condition pill, specs snippet, price, original retail price with strike-through, instant "Add to Cart" and "Compare" triggers).
   - Server-side pagination controls (items per page, page numbers).
3. **Product Detail Page (`/products/:slug`)**:
   - Multi-image gallery with zoom/preview.
   - Price block: Refurbished price, calculated savings percentage, stock alert pill ("Only 2 left!").
   - Condition & Grade explanation box explaining exactly why the unit earned its rating.
   - **Interactive Digital Product Passport (DPP)** tab/drawer:
     - Verified diagnostic battery health percentage (e.g., 94% original capacity).
     - Component test breakdown: Display, Chassis, Cameras, Ports, Logic Board, Audio.
     - Refurbishment history log: Parts replaced (e.g., OEM Battery replaced 12/2025).
     - Technicians' inspection sign-off badge and warranty certificate details.
     - Clear diagnostic verification disclaimer.
   - Technical specifications table.
   - Action buttons: Add to Cart, Buy Now, Add to Wishlist, Add to Compare.
4. **Product Comparison View (`/compare`)**:
   - Matrix comparison of up to 4 selected items side-by-side.
   - Compares: Price, Condition Grade, Battery Health %, Processor, RAM, Storage, Screen Condition, Warranty, Included Accessories.
5. **Trade-In Valuation Page (`/trade-in`)**:
   - Interactive 4-step wizard:
     1. Select Device Type & Brand.
     2. Specify Model & Specifications.
     3. Functional Assessment Checklist (Does it turn on? Screen intact? Cameras working?).
     4. Cosmetic Assessment (Flawless, Light scratches, Heavy wear).
   - Real-time explainable estimate breakdown.
   - Claim voucher trigger with submission to admin queue.
6. **Cart View (`/cart`)**:
   - Item list with quantity steppers (`+` / `-`), condition tag, unit price, item subtotal.
   - Live summary card: Items Subtotal, Shipping (Free over ₹999), Estimated Tax, Total.
   - Empty cart state with "Start Shopping" call to action.
7. **Checkout View (`/checkout`)**:
   - Step 1: Shipping Address form with validation.
   - Step 2: Delivery Speed selection.
   - Step 3: Order Review with explicit server-side price validation check.
   - Step 4: Simulated Payment Portal (Card number, expiry, CVV, OTP simulation toggle).
8. **Order Confirmation & Tracking (`/order-success/:orderId` & `/orders/:orderId`)**:
   - Visual progress stepper: Order Placed -> Inspected & Packed -> Dispatched -> Out for Delivery -> Delivered.
   - Itemized invoice with downloadable/printable view.
   - Direct link to each product's Digital Passport.
9. **Customer Account Portal (`/account`)**:
   - Profile management, saved addresses, order history, active trade-in requests, wishlist.
10. **Authentication Pages (`/login`, `/register`)**:
    - Clean forms with real-time field validation, password visibility toggle, role redirection.

### 4.2 Administrator Portal Views
1. **Admin Dashboard (`/admin`)**:
   - Live KPI Cards: Gross Sales (₹), Total Orders, Refurbished Units in Stock, Pending Trade-in Requests.
   - Order Status Distribution chart/progress bars.
   - Low-stock inventory alert table.
   - Quick actions: Add New Product, View Pending Orders.
2. **Product Management (`/admin/products`)**:
   - Data table of all products with search, category filter, stock count, and condition grade.
   - Action modals for Add Product and Edit Product.
   - Multi-tab form: Basic Info, Pricing & Stock, Technical Specs, Digital Passport & Inspection Log, Image URLs with live preview.
   - Delete confirmation dialog with safety checks.
3. **Order Management (`/admin/orders`)**:
   - Master order list with customer details, order value, payment status, and fulfillment stage.
   - Order Details view with status transition dropdown (e.g., change from "Confirmed" to "Dispatched").
4. **Trade-In Management (`/admin/trade-ins`)**:
   - Inspection queue of customer trade-in submissions.
   - Approve, modify estimated value, or reject with evaluator feedback notes.
5. **Customer Registry (`/admin/users`)**:
   - View registered customers, order counts, joined date.

---

## 5. Innovative Features Breakdown

### 5.1 Digital Product Passport (DPP)
- **Concept**: Physical electronics in the circular economy need an immutable identity. The RELOOP DPP gives every refurbished item a dedicated digital record.
- **Data Encapsulated**:
  - Unique Device Identification (Internal UUID / Refurb Serial).
  - Diagnostic Scorecard: 50-point inspection results across 7 hardware subsystems.
  - Battery Health Metrics: Measured vs. factory capacity percentage.
  - Cosmetic Score & Flaw Disclosures: Transparent notation of any hairline scratch or casing scuff.
  - Refurbishment Ledger: Timestamped entries of replaced components (e.g., new thermal paste, OEM grade-A display).
  - Warranty Passport: Duration, coverage boundaries, easy claims procedure.
- **Ethical Transparency & Disclaimers**: Explicit notice stating whether diagnostics were internally certified by RELOOP technicians or self-reported, ensuring regulatory compliance.

### 5.2 Explainable Trade-In Valuation Engine
- **Concept**: Transparent pricing algorithm replacing black-box trade-in systems.
- **Formulaic Rule Engine**:
  $$\text{Estimated Value} = \text{Base Value}(\text{Model}) \times C_{\text{cosmetic}} \times F_{\text{functional}} - D_{\text{defect}}$$
  - $C_{\text{cosmetic}}$: Pristine ($1.0$), Good ($0.85$), Fair ($0.70$).
  - $F_{\text{functional}}$: Display intact ($1.0$ vs $0.5$), Battery healthy ($1.0$ vs $0.8$), Ports functioning ($1.0$ vs $0.85$).
- **Explainability**: The customer UI shows itemized deductions so users see exactly how their device was valued.

### 5.3 Refurbished Device Comparison Matrix
- **Concept**: Traditional comparison engines only compare factory spec sheets. RELOOP compares *refurbishment variables*.
- **Comparative Fields**:
  - Factory Specs (CPU, RAM, Storage, Screen Size).
  - Condition Grade (Pristine vs. Good).
  - Battery Health Metric (98% vs. 86%).
  - Refurbished Price vs. Original Launch Price (Calculated Savings ₹).
  - Warranty Guarantee (12 Months vs. 6 Months).
  - Included Accessories (Original box, Certified charger, etc.).

---

## 6. Six-Criterion Assessment Rubric Mapping

| Criterion | Key University Assessment Requirements | RELOOP Architectural & Design Strategy | Observable Evidence for Evaluator |
|---|---|---|---|
| **1. Frontend Design** | Visual appeal, responsive design, color harmony, typography, UI consistency, micro-animations, loading/empty states. | - Bespoke light-theme palette (`#102A43`, `#16804A`, `#F8FAFC`).<br>- Bootstrap 5 layout grid + CSS Design Tokens.<br>- Fully responsive on Mobile (375px), Tablet (768px), and Desktop (1280px+).<br>- Polished skeleton loaders, clear empty carts, animated modals, condition grade badges. | - Inspect design tokens in `index.css`.<br>- Test Chrome DevTools responsive device toggle across 3 screen sizes.<br>- Observe loading spinners and empty search states. |
| **2. Backend Integration** | RESTful routing, MVC architecture, MongoDB connection, indexing, request validation, error handling, auth middleware. | - Express.js REST API with clean separation: `routes/`, `controllers/`, `models/`, `middleware/`.<br>- MongoDB Atlas / Local with Mongoose ODM.<br>- Compound and text indexes for search.<br>- Centralized error handling returning structured JSON `{ success, message, error }`. | - Review Postman/REST API routes table.<br>- Check server logs for structured error responses.<br>- Inspect MongoDB schemas and text index on product title/brand. |
| **3. Functionality** | End-to-end customer purchasing workflow, admin CRUD operations, inventory synchronization, authentication, session safety. | - Complete customer flow: Registration -> Catalog -> Detail -> Cart -> Checkout -> Simulated Payment -> Order Tracking.<br>- Server-side price recalculation (tamper-proof).<br>- Atomic inventory decrement (`$inc: -qty`) with `$gte` stock guard.<br>- Complete Admin CRUD with real-time storefront reflection. | - Execute purchase flow from start to finish.<br>- Try modifying client-side cart price in dev tools; confirm backend rejects or overrides with true DB price.<br>- Observe stock count decrease in DB and admin UI. |
| **4. Presentation** | Professional live demonstration readiness, realistic seed data, clear narrative, zero runtime crashes, evaluator accounts. | - Seed script with 20+ realistic electronics (MacBooks, ThinkPads, iPhones, Galaxy tabs, GPUs) with high-res images and complete passports.<br>- Pre-configured test accounts (`admin@reloop.com`, `customer@reloop.com`).<br>- Step-by-step evaluator demo guide. | - Run `npm run seed` to populate rich data instantly.<br>- Log in with one-click test credentials.<br>- Walk through the 10-minute evaluator script without errors. |
| **5. Innovation** | Novel features going beyond standard e-commerce clones, domain-specific problem solving. | - Digital Product Passport (DPP) with 50-point diagnostic history.<br>- Explainable, rule-based Trade-in Valuation calculator.<br>- Condition Grade transparency with explicit diagnostic disclaimers.<br>- Side-by-side Refurbished comparison tray. | - Open any Product Page and launch the Digital Product Passport.<br>- Run the Trade-in wizard and inspect the explainable deduction summary.<br>- Add 2 items to the comparison tray. |
| **6. Documentation** | Complete, clear, professional documentation covering architecture, setup, testing, and decisions. | - Comprehensive `PROJECT_PLAN.md`.<br>- Rigorous `ARCHITECTURE.md` with schema diagrams and API tables.<br>- `TEST_CHECKLIST.md` with 25+ test cases.<br>- Step-by-step `README.md` for zero-friction setup. | - Clickable markdown links to all files.<br>- Review schema dictionaries, REST tables, and test cases. |

---

## 7. Milestone Roadmap & Completion Criteria

```
+-----------------------------------------------------------------------------------+
|                           RELOOP IMPLEMENTATION MILESTONES                        |
+-----------------------------------------------------------------------------------+
|  M0: Planning & Architecture [CURRENT STAGE]                                      |
|  - System architecture, database models, API specs, rubric mapping, test cases.   |
+-----------------------------------------------------------------------------------+
|  M1: Environment Setup, Express Server & MongoDB Schemas                          |
|  - Express server, DB connection, Mongoose models, data seeder with 20+ items.   |
+-----------------------------------------------------------------------------------+
|  M2: REST APIs & Role-Based Authentication                                        |
|  - JWT auth (login/register), protected routes, product catalog & passport APIs.  |
+-----------------------------------------------------------------------------------+
|  M3: Frontend Foundation & Customer Storefront Core                               |
|  - React/Vite/Bootstrap scaffold, theme tokens, Navbar, Footer, Catalog & PDP.     |
+-----------------------------------------------------------------------------------+
|  M4: Cart, Checkout & Simulated Payment Flow                                      |
|  - Persistent cart, server-validated checkout, atomic stock updates, tracking.    |
+-----------------------------------------------------------------------------------+
|  M5: Admin Portal & Inventory Management                                          |
|  - Admin dashboard metrics, product CRUD with live previews, order status tools.  |
+-----------------------------------------------------------------------------------+
|  M6: Innovative Modules (Passport, Trade-In & Comparison)                         |
|  - Digital Passport visual scorecard, Trade-in calculator wizard, Compare tray.   |
+-----------------------------------------------------------------------------------+
|  M7: End-to-End Verification, Documentation & Demo Polish                         |
|  - Acceptance test checklist execution, responsiveness audit, final demo script.  |
+-----------------------------------------------------------------------------------+
```

### Milestone Completion Verification Gates
- **Gate 1 (Backend Core)**: `curl http://localhost:5000/api/products` returns seeded products; DB index queries execute under 20ms.
- **Gate 2 (Storefront)**: Customer can search, filter by condition grade, view PDP, and inspect the Digital Product Passport without console errors.
- **Gate 3 (Transaction Integrity)**: Customer can complete checkout; DB records new order; product stock decrements atomically; cart clears.
- **Gate 4 (Admin Control)**: Admin can update product stock/price; change shows instantly on public PDP; admin can change order status to "Dispatched".
- **Gate 5 (Faculty Inspection Ready)**: Clean git repo, zero warnings, seed data ready, all test cases passing in `TEST_CHECKLIST.md`.
