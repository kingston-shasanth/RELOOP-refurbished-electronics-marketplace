# RELOOP — Acceptance Test Checklist & Evaluation Guide

**Refurbished Electronics E-Commerce Platform**  
*Quality renewed. Value restored.*  
**Target Milestone**: University Full Stack Development IA III Assessment  
**Document Version**: 1.0.0 (Planning Stage)

---

## 1. Quality Assurance Strategy & Evaluator Overview

This document provides a verifiable, reproducible testing matrix for RELOOP. It is organized into three sections:
1. **Six-Criterion Faculty Evaluation Matrix**: Observable verification items mapped to the IA III grading criteria.
2. **Acceptance Test Cases (TC-01 through TC-25)**: Granular test procedures covering core customer workflows, administrator CRUD, security constraints, and innovative features.
3. **10-Minute Faculty Demonstration Walkthrough**: A scripted, step-by-step showcase designed to demonstrate full-stack mastery without hitches.

---

## 2. Six-Criterion Faculty Evaluation Matrix

| Criterion | Target Quality Standard | Specific Verification Check | Observable Evidence |
|---|---|---|---|
| **1. Frontend Design** | Premium light theme, responsive layout, clear visual hierarchy, accessible contrast. | - Inspect CSS design tokens in `client/src/styles/index.css`.<br>- Resize browser window or toggle Chrome DevTools device mode (iPhone 14, iPad, 1080p Desktop).<br>- Check for empty states (empty cart, no search results), loading skeletons, and interactive hover effects. | - Palette strictly uses Navy `#102A43`, Green `#16804A`, and Light Canvas `#F8FAFC`.<br>- Zero layout breakage or horizontal scrollbars at 375px.<br>- Buttons provide visual feedback; condition grade pills use color-coded badges. |
| **2. Backend Integration** | Robust Node/Express REST API, MongoDB Mongoose models, proper HTTP status codes, structured error handling. | - Query `/api/products` via browser or Postman.<br>- Inspect MongoDB collections (`users`, `products`, `orders`, `digitalpassports`, `tradeinrequests`).<br>- Trigger a deliberate bad request (e.g. invalid login) and verify JSON response. | - API returns structured `{ success: true, data: ... }` or `{ success: false, message: ... }`.<br>- Error handler intercepts unhandled rejections without crashing Node.js.<br>- Mongoose text indexes actively accelerate product searches. |
| **3. Functionality** | 100% complete customer purchase lifecycle and administrative product & order management. | - Complete end-to-end checkout: browse -> add to cart -> checkout -> simulated card payment -> order confirmation receipt.<br>- Check database to verify order record creation.<br>- Perform Admin product edit and verify immediate storefront update. | - Cart updates subtotal automatically.<br>- Product stock decrements atomically in MongoDB upon order placement.<br>- Order status transitions (Placed -> Dispatched) are reflected on the customer order tracking page. |
| **4. Presentation** | Professional live demo readiness, realistic seed data, zero console errors, pre-seeded accounts. | - Run the automated database seeder (`npm run seed`).<br>- Log in with demo credentials (`admin@reloop.com` and `customer@reloop.com`).<br>- Check browser developer console for zero unhandled runtime exceptions. | - 20+ realistic refurbished tech items (MacBooks, ThinkPads, iPhones, GPUs) loaded with authentic specs, battery health, and high-res imagery.<br>- Smooth navigation transitions without broken links or blank screens. |
| **5. Innovation** | Meaningful features addressing refurbished domain problems. | - Launch the **Digital Product Passport (DPP)** on any product page.<br>- Execute the **Trade-In Valuation Calculator** questionnaire.<br>- Add 2 or 3 items to the **Refurbished Device Comparison Tray**.<br>- Review transparent condition grading and diagnostic disclaimers. | - Interactive modal shows 50-point diagnostic scorecard, battery health %, and parts replaced.<br>- Real-time valuation breakdown explains deductions mathematically.<br>- Comparison matrix highlights warranty, condition grade, and savings. |
| **6. Documentation** | Complete, clear, professional architecture, setup guide, and rubric mappings. | - Review `docs/PROJECT_PLAN.md`, `docs/ARCHITECTURE.md`, and `docs/TEST_CHECKLIST.md`.<br>- Review `README.md` for clear single-command setup instructions. | - Clickable markdown links to all files.<br>- Clear diagrams, schema definitions, and REST endpoint tables. |

---

## 3. Detailed Acceptance Test Cases

### 3.1 Authentication & Role-Based Access Control (RBAC)

| Test ID | Feature / Action | Preconditions | Execution Steps | Expected Outcome | Verification Method |
|---|---|---|---|---|---|
| **TC-01** | Customer Registration | Clean DB or unused email | 1. Navigate to `/register`<br>2. Submit valid name, email, password, and phone | User created in MongoDB with hashed password (`bcrypt`), JWT token issued, redirected to home with user name in navbar. | Inspect DB `users` collection; password must start with `$2a$` or `$2b$`. |
| **TC-02** | Customer Login | Registered user exists | 1. Navigate to `/login`<br>2. Enter customer credentials<br>3. Submit | Successfully logged in, JWT stored in localStorage/state, cart restored. | Inspect Network tab for `200 OK` and `{ token, user }`. |
| **TC-03** | Admin Login & Route Protection | Admin user seeded | 1. Log in with `admin@reloop.com`<br>2. Navigate to `/admin` | Admin dashboard loads with KPI cards and sidebar. | Admin badge visible in navbar. |
| **TC-04** | Unauthorized Admin Access Guard | Logged in as standard customer | 1. Attempt manual navigation to `/admin` or `/admin/products` | System denies access, redirects to home or displays `403 Forbidden` unauthorized alert. | Verify route cannot be bypassed via URL tampering. |

---

### 3.2 Product Catalog, Search & Filtering

| Test ID | Feature / Action | Preconditions | Execution Steps | Expected Outcome | Verification Method |
|---|---|---|---|---|---|
| **TC-05** | Category Filter Navigation | Seeded database | 1. Click "Laptops" category on homepage or catalog | Catalog displays only laptop products; category pill highlighted. | Product count matches category count in DB. |
| **TC-06** | Text Search with MongoDB Index | Seeded database | 1. Enter "MacBook" in top search bar<br>2. Press Enter | Products matching "MacBook" in title/brand appear; non-matching items filtered out. | Inspect Network query `/api/products?search=MacBook`. |
| **TC-07** | Condition Grade Filter | Multiple condition grades in DB | 1. Check "Pristine" condition filter on sidebar | Only devices with conditionGrade "Pristine" remain visible. | Cards display green "Pristine" badge. |
| **TC-08** | Price Range Slider & Sorting | Active catalog | 1. Adjust max price slider to ₹40,000<br>2. Sort by "Price: Low to High" | Products filter to <= ₹40,000 and sort in strictly ascending price order. | Inspect card prices sequence. |
| **TC-09** | Empty Search State | Active catalog | 1. Search for non-existent keyword `XYZNONEXISTENT99` | Clean empty state graphic appears: "No refurbished devices found" with a "Reset Filters" button. | Verify UI does not crash or display a blank container. |

---

### 3.3 Product Details & Innovative Digital Product Passport

| Test ID | Feature / Action | Preconditions | Execution Steps | Expected Outcome | Verification Method |
|---|---|---|---|---|---|
| **TC-10** | Product Detail Page (PDP) View | Seeded database | 1. Click any product card from catalog | PDP loads with image gallery, specs table, condition summary, warranty period, and calculated savings. | Original price struck out, savings percentage clearly highlighted. |
| **TC-11** | Digital Product Passport (DPP) Drawer | On PDP | 1. Click "View Digital Product Passport" button | Interactive modal/drawer opens displaying: 50-point diagnostic summary, measured battery health %, hardware check statuses, and parts replaced history. | Verify diagnostic disclaimer note is clearly readable at the bottom. |
| **TC-12** | Side-by-Side Product Comparison | Catalog view | 1. Click "Compare" on 2 different laptops<br>2. Open Comparison Tray / Page | Matrix displays both items side-by-side comparing Condition Grade, Battery Health, Processor, RAM, Storage, and Price Delta. | Differences highlighted clearly. |
| **TC-13** | Explainable Trade-In Valuation Calculator | On `/trade-in` | 1. Select "Smartphones" -> "Apple iPhone 13"<br>2. Mark "Powers on: Yes", "Screen intact: Yes", "Cosmetic: Good"<br>3. Click "Calculate Valuation" | Instant valuation breakdown appears showing Base Price, Cosmetic Multiplier (0.85), and Deductions. Form explains calculation steps. | Formula matches backend calculator logic. |

---

### 3.4 Shopping Cart & Server-Side Checkout

| Test ID | Feature / Action | Preconditions | Execution Steps | Expected Outcome | Verification Method |
|---|---|---|---|---|---|
| **TC-14** | Cart Add & Quantity Stepper | Product with stock >= 3 | 1. Add product to cart<br>2. Navigate to `/cart`<br>3. Click `+` to increase quantity to 2 | Quantity updates to 2; line item subtotal and cart total recalculate instantly. | Cart state persists across page refreshes (localStorage). |
| **TC-15** | Cart Stock Boundary Enforced | Product with stock = 2 | 1. Attempt to increment quantity beyond available stock (e.g. 3) | Increment button disables or toast alert notifies "Maximum available stock reached (2 units)". | Cannot exceed available stock in cart. |
| **TC-16** | Checkout Navigation & Address Entry | Cart has items, user logged in | 1. Click "Proceed to Checkout"<br>2. Fill in valid shipping address | Checkout wizard advances to Payment step with order summary displayed. | Form validation requires all mandatory address fields. |
| **TC-17** | Server-Side Price Recalculation (Anti-Tamper) | Cart has items | 1. Intercept or tamper client-side total in browser DevTools<br>2. Submit checkout payload to `/api/orders` | Backend ignores client-sent price, queries MongoDB for authoritative `refurbishedPrice`, calculates true subtotal, tax, and shipping. | Saved order in MongoDB reflects true database pricing, not tampered value. |
| **TC-18** | Atomic Stock Decrement & Order Success | Product stock = 5 | 1. Place order for quantity 2 with simulated payment<br>2. Complete checkout | Order is created with status "Order Placed", user redirected to `/order-success/:id`. | Product stock in MongoDB decreases from 5 to 3. |
| **TC-19** | Out of Stock / Concurrency Guard | Product stock = 0 | 1. Attempt to place order for an out-of-stock product | Server rejects with `400 Bad Request` ("Item is out of stock"), preventing negative inventory. | Database stock never drops below 0. |

---

### 3.5 Simulated Payment Gateway

| Test ID | Feature / Action | Preconditions | Execution Steps | Expected Outcome | Verification Method |
|---|---|---|---|---|---|
| **TC-20** | Valid Simulated Card Payment | On Payment step | 1. Enter test card `4242 4242 4242 4242`, exp `12/28`, CVV `123`<br>2. Click "Authorize Simulated Payment" | Button shows loading state, simulates 800ms gateway authorization, succeeds, and records transaction ID. | Zero raw card data saved in database; only `cardLast4: "4242"` stored. |
| **TC-21** | Simulated Payment Rejection Test | On Payment step | 1. Enter failure test card `4000 0000 0000 0002`<br>2. Click "Authorize Simulated Payment" | System displays simulated decline alert: "Simulated Card Declined: Insufficient test funds". Order is NOT placed. | Stock remains unchanged; user remains on checkout page. |

---

### 3.6 Administrator CRUD & Dashboard Metrics

| Test ID | Feature / Action | Preconditions | Execution Steps | Expected Outcome | Verification Method |
|---|---|---|---|---|---|
| **TC-22** | Admin Dynamic Dashboard Metrics | Orders and products exist | 1. Log in as admin<br>2. Navigate to `/admin` | Dashboard displays actual MongoDB-calculated metrics: Total Revenue (₹), Total Orders, Active Catalog Count, and Low Stock Alerts. | Metrics match actual count of documents in MongoDB. |
| **TC-23** | Admin Create New Refurbished Product | Logged in as admin | 1. Click "Add Product" on `/admin/products`<br>2. Fill in title, brand, category, condition grade, specs, and image URL<br>3. Submit | Product is saved to MongoDB and immediately visible in customer catalog. | Search for new product on public storefront; it appears instantly. |
| **TC-24** | Admin Edit Stock & Pricing | Existing product in DB | 1. Edit product price from ₹35,000 to ₹32,000 on admin panel<br>2. Save changes | MongoDB updates; customer-facing PDP shows updated price ₹32,000 immediately. | Confirm price update on public PDP. |
| **TC-25** | Admin Order Fulfillment Stepper | Existing customer order | 1. Go to `/admin/orders`<br>2. Open customer order<br>3. Change status from "Order Placed" to "Dispatched"<br>4. Submit | Order status updates in DB. Customer's `/orders/:id` page immediately shows the timeline stepped forward to "Dispatched". | Verify tracking timeline updates in customer portal. |

---

## 4. Evaluator Demonstration Walkthrough (10-Minute Script)

This scripted flow is designed for a seamless, glitch-free demonstration before university faculty evaluators:

### Pre-Demonstration Setup (T - 2 Minutes)
1. Open terminal in workspace root.
2. Ensure MongoDB is running.
3. Run the database seed script:
   ```bash
   npm run seed
   ```
4. Start both backend and frontend servers:
   ```bash
   npm run dev
   ```
5. Open browser at `http://localhost:5173`.

---

### Phase 1: Brand & Storefront Tour (Minutes 0 - 2)
- **Action**: Highlight the RELOOP brand aesthetic: Navy (`#102A43`), Green (`#16804A`), and Light background (`#F8FAFC`).
- **Showcase**:
  - Show the hero section: *"Quality renewed. Value restored."*
  - Point out the 4 category cards: Laptops, Smartphones, Tablets, PC Components.
  - Show the environmental impact widget (e.g., *"1,420 kg of e-waste prevented"*).
  - Use the responsive toggle in Chrome DevTools to demonstrate clean mobile rendering.

### Phase 2: Live Search, Multi-Filter & Comparison (Minutes 2 - 4)
- **Action**: Click "Laptops" in navigation bar.
- **Showcase**:
  - Filter by condition grade: Click **"Pristine"** to show high-tier renewed MacBooks and ThinkPads.
  - Type *"M1"* into the live search bar to show instant text search.
  - Select 2 laptops and click **"Add to Compare"**.
  - Open the **Comparison Tray** to showcase the side-by-side matrix: comparing battery health %, warranty, and price savings.

### Phase 3: The Innovation Highlight — Digital Product Passport (Minutes 4 - 6)
- **Action**: Open a product page (e.g., *Apple MacBook Air M1 - Pristine*).
- **Showcase**:
  - Show the price block with calculated savings (e.g., Save 42% vs retail).
  - Click **"View Digital Product Passport"**.
  - Walk the evaluator through the 50-point inspection checklist:
    - Battery Health Meter (e.g., 96% original capacity).
    - Display, Logic Board, Ports, and Chassis condition.
    - Parts replaced log (e.g., OEM battery replacement).
    - Point out the ethical disclosure statement: *"All diagnostic records are lab-verified."*

### Phase 4: Trade-In Valuation Calculator (Minutes 6 - 7)
- **Action**: Click **"Trade-In"** in the top navigation.
- **Showcase**:
  - Select an older iPhone or laptop.
  - Step through the 4-step wizard: Functional tests (powers on, screen responsive) and cosmetic wear.
  - Show the instant explainable valuation breakdown (Base value - Deductions = Estimated Store Credit).

### Phase 5: End-to-End Purchase & Order Lifecycle (Minutes 7 - 9)
- **Action**: Add an item to cart and click **"Proceed to Checkout"**.
- **Showcase**:
  - Log in with the pre-seeded customer account (`customer@reloop.com` / `password123`).
  - Demonstrate address autofill.
  - Enter the test simulated card (`4242 4242 4242 4242`).
  - Place order: highlight the receipt page, generated order number, and active order timeline stepper.
  - Highlight security: Show that MongoDB stock count has decremented atomically and no raw card data was stored.

### Phase 6: Administrator Operations & Dynamic Analytics (Minutes 9 - 10)
- **Action**: Log in with the admin account (`admin@reloop.com` / `admin123`).
- **Showcase**:
  - Show the **Admin Dashboard**: Live revenue, order count, and low-stock alert badges computed dynamically from MongoDB.
  - Go to **Product Management**: Edit the stock count or price of a device.
  - Go to **Order Management**: Transition the newly placed customer order from *"Order Placed"* to *"Dispatched"*.
  - Switch back to customer view: Show the customer's order tracking page updated in real time.
- **Conclusion**: Emphasize how all six assessment criteria have been demonstrably satisfied with live code, database persistence, and documentation.
