<div align="center">

# RELOOP — Refurbished Electronics Marketplace

**Quality renewed. Value restored.**

A modern, full-stack circular commerce platform engineered to resolve the refurbished electronics trust deficit through verified condition grading, device-specific Digital Product Passports (DPP), transparent trade-in valuations, and end-to-end order lifecycle management.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.9.5-880000?style=flat-square&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-087F5B?style=flat-square)](LICENSE)

---

[Overview](#overview) •
[Core Features](#core-features) •
[Architecture](#architecture) •
[Project Structure](#project-structure) •
[Technology Stack](#technology-stack) •
[Getting Started](#getting-started) •
[Configuration](#configuration) •
[Testing & Verification](#testing--verification) •
[Security & Isolation](#security--isolation) •
[Project Scope](#project-scope)

---

</div>

## Overview

The refurbished consumer electronics market frequently suffers from an information asymmetry problem: buyers are uncertain about component degradation, battery wear, and cosmetic authenticity, while sellers lack standardized tools to prove device integrity.

**RELOOP** addresses this trust gap by combining:
1. **Cryptographic Digital Product Passports (DPP)** that provide serial-numbered hardware diagnostic reports, battery cycle health, and component repair histories for every listed device.
2. **Standardized Condition Grading** (*Pristine*, *Excellent*, *Good*, *Fair*) with explicit hardware and cosmetic disclosures.
3. **An Explainable Trade-In Valuation Engine** allowing users to calculate the salvage value of their existing devices using mathematical condition and defect deductions.
4. **Isolated Dual-Portal Architecture** providing a frictionless customer marketplace alongside a protected administrative management dashboard for orders, catalog curation, and trade-in inspection.

---

## Core Features

### Customer Storefront & Catalog
- **Multi-Category Browsing**: Dedicated filtering across 8 electronics categories (Laptops, Smartphones, Audio, Tablets, PC Components, Wearables, Gaming, Cameras) with category badges and active counters.
- **MongoDB Full-Text Search**: Instant search matching device titles, brands, specifications, and condition summaries.
- **Condition Tiers**: Clear cosmetic and functional grading badges (*Pristine*, *Excellent*, *Good*, *Fair*) with explicit pricing discounts against original retail benchmarks.
- **Authentic Photographic Assets**: Catalog displays curated, authentic device photography with automatic SVG fallbacks when custom assets are unassigned.
- **Live Side-by-Side Comparison**: Interactive floating comparison tray to evaluate specifications, pricing, battery health, and warranty coverage across up to 4 devices simultaneously.

### Digital Product Passports (DPP)
- **Serial-Tracked Hardware Provenance**: Every certified unit carries a distinct cryptographic identifier (e.g., `RLP-2026-APPLE-4912`).
- **Comprehensive Diagnostic Reports**: 100-point inspection score, battery cycle count, battery capacity percentage, screen integrity, logic board verification, and genuine component audit.
- **Lifecycle & Refurbishment History**: Timestamped refurbishment logs indicating sanitization date, component replacements, and grading certification.
- **Ecological Impact Tracking**: Estimated e-waste diverted (kg) and avoided carbon footprint ($\text{CO}_2\text{e}$) calculated per device purchase.

### Cart, Wishlist & Checkout Workflows
- **Reactive State Management**: Synchronized shopping cart and wishlist backed by local storage and cross-tab synchronization.
- **Anti-Tampering Price Enforcement**: Server-side checkout calculation that strictly validates product existence, stock availability, and catalog pricing against the database, ignoring client-side price overrides.
- **Atomic Inventory Decrements**: MongoDB conditional operators decrement available unit stock upon successful checkout to prevent overselling.
- **Simulated Payment Sandbox**: Full support for Cash on Delivery (COD), simulated UPI payments, and test Credit/Debit card simulation with card validation and instant confirmation.
- **Order Confirmation Celebration**: Dynamic full-screen confetti animation and celebration dialog upon order placement with immediate routing to order tracking.

### Trade-In Valuation Workflow
- **Explainable Valuation Calculator**: Real-time trade-in estimation model factoring device age, cosmetic wear, screen scratches, battery degradation, and functional defects.
- **Transparent Deduction Breakdown**: Customers receive an itemized deduction ledger explaining exactly how their preliminary quote was computed.
- **Direct Submission & Tracking**: Logged-in users can submit trade-in requests for administrative review and track status directly from their account dashboard.

### Administrator Operations Dashboard
- **Real-Time Database KPIs**: Live metrics tracking total catalog products, order counts, gross revenue, and pending trade-in inspections.
- **Comprehensive Product Management**: Full CRUD modal for creating and updating devices, assigning condition grades, uploading authentic images, and mutating linked Digital Product Passports.
- **Order Fulfillment Stepper**: Multi-stage state machine transition (*Pending* $\rightarrow$ *Processing* $\rightarrow$ *Dispatched* $\rightarrow$ *Delivered* $\rightarrow$ *Cancelled*) with payment collection controls for COD orders.
- **Trade-In Inspection & Voucher Approval**: Administrative workflow to inspect customer trade-in submissions, approve or adjust valuations, and issue redemption voucher codes.

---

## Architecture

RELOOP is architected as a decoupled Single-Page Application (SPA) powered by React and Vite, communicating via a RESTful API with an Express.js backend and a MongoDB persistence tier.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (React 18 + Vite)"]
        Browser["Customer & Admin Browser"]
        Router["React Router DOM (Protected Routes)"]
        Contexts["State Contexts (Auth, Cart, Wishlist, Compare)"]
        Sync["BroadcastChannel (Cross-Tab Sync)"]
        AxiosClient["Axios HTTP Service (/api)"]

        Browser --> Router
        Router --> Contexts
        Contexts <--> Sync
        Contexts --> AxiosClient
    end

    subgraph ServerLayer ["Backend Layer (Node.js + Express.js)"]
        ExpressApp["Express API Server (:5000)"]
        SecurityMW["Security Middleware (Helmet, CORS)"]
        AuthMW["Authentication Middleware (JWT & RBAC)"]
        Controllers["Controllers (Product, Order, TradeIn, Admin, Auth)"]
        MulterStorage["Multipart File Storage (/client/public/images/products)"]

        AxiosClient --> ExpressApp
        ExpressApp --> SecurityMW
        SecurityMW --> AuthMW
        AuthMW --> Controllers
        Controllers --> MulterStorage
    end

    subgraph DataLayer ["Persistence Tier (MongoDB 6+)"]
        MongooseODM["Mongoose 8.9 ODM"]
        DBProducts[("Products Collection")]
        DBPassports[("Digital Passports Collection")]
        DBOrders[("Orders Collection")]
        DBUsers[("Users Collection (Bcrypt Hashes)")]
        DBTradeIns[("Trade-In Requests Collection")]

        Controllers --> MongooseODM
        MongooseODM --> DBProducts
        MongooseODM --> DBPassports
        MongooseODM --> DBOrders
        MongooseODM --> DBUsers
        MongooseODM --> DBTradeIns
    end
```

### Key Architectural Patterns
- **Role-Based Access Control (RBAC)**: Distinct authorization gates for `customer` and `admin` roles. Customer tokens are blocked from `/api/admin/*` endpoints with explicit `403 Forbidden` responses.
- **Cross-Tab Synchronization**: Client state modifications (cart additions, wishlist updates, session logouts) broadcast across active browser tabs via the HTML5 `BroadcastChannel` API without requiring full page reloads.
- **Cache-Busting Middleware**: Dynamic `/api/*` endpoints enforce `Cache-Control: no-store, no-cache, must-revalidate` to prevent stale administrative or customer order records from browser memory.
- **Atomic Stock Integrity**: Product checkout uses transactional atomic decrement queries (`$inc: { stockCount: -quantity }`) guarded by stock precondition checks (`stockCount: { $gte: quantity }`).

---

## Project Structure

```
RELOOP/
├── client/                               # Frontend Single-Page Application
│   ├── public/                           # Static assets served directly
│   │   └── images/
│   │       ├── campaigns/                # Hero campaign banners
│   │       └── products/                 # Authentic device photos & SVG fallbacks
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                    # Admin layout, sidebar, product mutation modal
│   │   │   ├── common/                   # Navbar, footer, category bar, modals, loaders
│   │   │   ├── compare/                  # Floating device comparison tray & drawer
│   │   │   ├── home/                     # Hero carousel, featured categories, trust grid
│   │   │   ├── passport/                 # Digital Product Passport modal & diagnostics
│   │   │   └── product/                  # Product cards, badges, filter controls
│   │   ├── context/                      # React Context providers (Auth, Cart, Wishlist, Compare)
│   │   ├── pages/                        # Storefront, PDP, Cart, Checkout, Profile, Admin pages
│   │   ├── services/                     # Axios API instance and BroadcastChannel bridge
│   │   └── styles/                       # Global CSS tokens, animations, and micro-interactions
│   ├── index.html                        # SPA HTML entry point
│   ├── package.json                      # Client dependencies and build scripts
│   └── vite.config.js                    # Vite bundler configuration
│
├── server/                               # Backend REST API
│   ├── config/                           # MongoDB connection and schema index initialization
│   ├── controllers/                      # Business logic handlers for all endpoints
│   ├── middleware/                       # JWT authentication, role guards, error handlers
│   ├── models/                           # Mongoose schemas (Product, DigitalPassport, Order, User, etc.)
│   ├── routes/                           # Modular route definitions (/auth, /products, /orders, etc.)
│   ├── test/                             # Automated test suites (health, compliance, regression, e2e)
│   ├── utils/                            # Token generator and helper functions
│   ├── .env.example                      # Environment blueprint template (no secrets)
│   ├── package.json                      # Server dependencies and test scripts
│   └── server.js                         # Application entry point and middleware assembly
│
├── docs/                                 # Architectural specifications and provenance logs
│   ├── ARCHITECTURE.md                   # In-depth architectural documentation
│   ├── PRODUCT_IMAGES_PROVENANCE.md      # Image licensing, sources, and public domain attributions
│   ├── PROJECT_PLAN.md                   # Milestones and project delivery specifications
│   ├── TEST_CHECKLIST.md                 # Test matrices and verification criteria
│   └── UI_REFERENCE_AUDIT.md             # Design system and UI compliance notes
│
├── scripts/                              # Maintenance and operational utilities
│   ├── acquire-real-images.js            # Image synchronization utility with Wikimedia Commons
│   ├── backup_db.js                      # MongoDB JSON snapshot creation tool
│   ├── expand-catalog-31.js              # Catalog fixture expansion tool
│   └── launcher.js                       # Cross-process supervisor with port collision handling
│
├── .gitignore                            # Root ignore rules for node_modules, .env, and local data
├── OPEN_DATABASE_GUI.bat                 # One-click Windows launcher for MongoDB Compass
├── START_RELOOP.bat                      # One-click Windows application launcher
├── STOP_RELOOP.bat                       # One-click Windows clean shutdown utility
└── package.json                          # Monorepo root scripts
```

### Directory Responsibilities

| Directory | Core Purpose |
| :--- | :--- |
| `client/src/components/` | Modular, reusable UI components split by domain (admin, storefront, passport, compare). |
| `client/src/context/` | Centralized state management for authentication sessions, shopping cart, and comparison trays. |
| `client/src/pages/` | Top-level routed views for customer catalog, product details, checkout, and admin dashboard. |
| `server/controllers/` | Request processing, input validation, and database orchestration. |
| `server/middleware/` | JWT token validation, administrative role checks, error normalization, and cache control. |
| `server/models/` | Strictly typed Mongoose schemas with compound indexes and validation rules. |
| `server/test/` | Automated test suites executing live API verification and regression protection. |
| `docs/` | Comprehensive technical documentation covering architecture, testing, and asset licensing. |
| `scripts/` | Process orchestration, port collision resolution, and database snapshot utilities. |

---

## Technology Stack

### Frontend
- **Framework**: [React 18.3.1](https://react.dev/) (Single-Page Application)
- **Build Tool**: [Vite 5.4.11](https://vitejs.dev/) with Fast Refresh
- **Routing**: [React Router DOM 6.28.0](https://reactrouter.com/)
- **UI Framework & Grid**: [Bootstrap 5.3.3](https://getbootstrap.com/)
- **Iconography**: [Lucide React 0.460.0](https://lucide.dev/)
- **HTTP Client**: [Axios 1.7.9](https://axios-http.com/)
- **Styling**: Custom Scoped CSS Design System with dark navy (`#0B132B`) and emerald green (`#087F5B`) accents

### Backend & API
- **Runtime**: [Node.js 18+](https://nodejs.org/) (ES6+ / CommonJS)
- **Web Framework**: [Express 4.21.2](https://expressjs.com/)
- **Security Headers**: [Helmet 8.0.0](https://helmetjs.github.io/)
- **CORS Management**: [CORS 2.8.5](https://www.npmjs.com/package/cors)
- **Authentication**: Stateless [jsonwebtoken 9.0.3](https://github.com/auth0/node-jsonwebtoken)
- **Password Hashing**: Salted [bcryptjs 3.0.3](https://www.npmjs.com/package/bcryptjs)
- **Environment Management**: [dotenv 16.4.7](https://www.npmjs.com/package/dotenv)

### Database & Persistence
- **Database Engine**: [MongoDB 6.0+](https://www.mongodb.com/) Community Server
- **Object Data Modeling**: [Mongoose 8.9.5](https://mongoosejs.com/)
- **Indexing**: Text search indexes on product title/brand/specs, compound unique indexes on user email.

---

## Getting Started

### Prerequisites

1. **Node.js**: Version 18.0.0 or higher ([Download Node.js](https://nodejs.org/))
   ```bash
   node --version
   npm --version
   ```
2. **MongoDB Community Server**: Active locally on default port `27017` ([Download MongoDB](https://www.mongodb.com/try/download/community))
   ```bash
   # Verify MongoDB is running
   mongosh --eval "db.adminCommand('ping')"
   ```

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kingston-shasanth/RELOOP-refurbished-electronics-marketplace.git
   cd RELOOP-refurbished-electronics-marketplace
   ```

2. **Configure Environment Variables**:
   Copy the example environment template in `server/`:
   ```bash
   # Windows Command Prompt
   copy server\.env.example server\.env

   # PowerShell / Bash
   cp server/.env.example server/.env
   ```

3. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install

   # Return to root
   cd ..
   ```

---

### Starting the Application

#### Option A: One-Click Windows Launcher (Recommended)
Double-click [`START_RELOOP.bat`](file:///D:/RELOOP/START_RELOOP.bat) from Windows Explorer or run from terminal:
```bat
START_RELOOP.bat
```
*The launcher automatically probes MongoDB on port 27017, checks for port conflicts, starts the Express API and Vite client concurrently, streams prefixed logs, and opens the application in your default web browser.*

To cleanly terminate all running services without leaving orphaned processes:
```bat
STOP_RELOOP.bat
```

To launch MongoDB Compass connected to the local database:
```bat
OPEN_DATABASE_GUI.bat
```

#### Option B: Manual Startup via npm Scripts
You can run services from the project root using two terminal windows:

```bash
# Terminal 1 — Backend Express Server (Port 5000)
npm run server

# Terminal 2 — Frontend Vite Client (Port 5173)
npm run client
```

#### Application URLs
| Service | URL | Description |
| :--- | :--- | :--- |
| **Storefront & Admin UI** | `http://localhost:5173` | React/Vite customer marketplace & admin portal |
| **API Health Endpoint** | `http://localhost:5000/api/health` | Service uptime and status probe |
| **Database Health Probe** | `http://localhost:5000/api/health/db` | MongoDB connection state verification |
| **Base API Route** | `http://localhost:5000/` | Service metadata and version banner |

---

## Configuration

Server environment configuration is loaded from `server/.env`. A sanitized blueprint is provided at [`server/.env.example`](file:///D:/RELOOP/server/.env.example).

### Configuration Blueprint (`server/.env.example`)
```ini
# RELOOP Server Environment Configuration Blueprint
# Copy this file to .env and configure for your local environment

NODE_ENV=development
PORT=5000

# Local MongoDB Connection URI
MONGO_URI=mongodb://127.0.0.1:27017/reloop

# Frontend Client Origin for CORS
CLIENT_URL=http://localhost:5173

# JWT Secret for Session Token Signing
JWT_SECRET=reloop_secure_jwt_secret_development_key
```

> [!IMPORTANT]
> The active `.env` file contains sensitive secrets and connection details. It is strictly excluded by `.gitignore` and must never be committed to source control.

---

## Testing & Verification

The repository includes a comprehensive, multi-tiered test suite verifying health endpoints, API compliance, image upload persistence, defect resolutions, regression prevention, and complete end-to-end commerce workflows.

All test suites execute against the live local database and cleanly purge their disposable test records, ensuring **100% zero database pollution**.

### Verified Test Results

| Command | Test Suite | Scope & Coverage | Verified Outcome |
| :--- | :--- | :--- | :---: |
| `npm run test:health` | **Health & DB Check** | Validates base route, `/api/health`, `/api/health/db`, CORS headers, 404 handler, and Mongoose schema compilation. | `6 / 6 PASSED` |
| `npm run test:audit` | **Compliance Audit** | Full-stack audit of customer auth, product filtering, text search, DPP retrieval, trade-in calculations, and admin RBAC. | `18 / 18 PASSED` |
| `npm run test:upload` | **Asset Upload & Sync** | Validates multipart product photo upload (`POST /api/upload`), disk persistence, database linking, and storefront retrieval. | `5 / 5 PASSED` |
| `npm run test:defects` | **Defect Resolution** | Targeted verification of session isolation, cache-control headers, DPP mutation persistence, and atomic inventory decrements. | `12 / 12 PASSED` |
| `npm run test:regression` | **15-Point Regression** | Validates pricing calculations, atomic stock decrements, image fallbacks, order state machines, and sticky positioning. | `15 / 15 PASSED` |
| `npm run test:e2e` | **Master E2E Lifecycle** | Complete commerce lifecycle: registration, catalog browsing, cart operations, checkout, order history, and admin fulfillment. | `35 / 35 PASSED` |
| `npm run build` | **Production Bundle** | Vite client production build with gzip size computation and chunk optimization. | `SUCCESS (0 errors)` |

### Running the Tests

Execute any test suite directly from the project root:

```bash
# Verify API and Database Connectivity
npm run test:health

# Run the 18-point Compliance Audit
npm run test:audit

# Run the Multipart Asset Upload Test
npm run test:upload

# Run the Targeted Defect Verification Suite
npm run test:defects

# Run the 15-Point Regression Suite
npm run test:regression

# Run the Master 35-point End-to-End Suite
npm run test:e2e

# Compile Frontend Production Bundle
npm run build
```

---

## Security & Isolation

### Role-Based Access Control (RBAC)
- **Token Claims**: JSON Web Tokens carry explicit user identity and role claims (`role: "customer"` or `role: "admin"`).
- **Endpoint Protection**: Administrative endpoints are protected by `authMiddleware` and `adminOnly` guards. Customer tokens attempting to invoke `/api/admin/*` are immediately rejected with `403 Forbidden`.
- **Session Isolation**: Admin and customer authentication states are isolated. Logging in as an administrator does not pollute or compromise active customer sessions in other browser contexts.

### Anti-Tamper Commerce Logic
- **Server-Side Pricing Authority**: The checkout controller queries the MongoDB catalog directly to compute item pricing, taxes, and order totals. Client-supplied price modifications are completely discarded.
- **Atomic Stock Guard**: Product stock is decremented atomically during order placement using MongoDB conditional operators, eliminating race conditions and preventing overselling.

### Cache Invalidation
- All dynamic `/api/*` routes send explicit anti-caching headers (`Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`) to guarantee that sensitive customer orders and administrative inventory counts are never cached by intermediaries or browser caches.

---

## Project Scope

### Implemented & Verified Capabilities
- Full-stack customer shopping journey: product discovery, filtering, search, condition inspection, Digital Product Passport review, cart management, wishlist, and simulated checkout.
- Full administrative management portal: real-time KPI metrics, catalog CRUD, image upload, order fulfillment stepper, and trade-in review.
- Simulated payment sandbox: Cash on Delivery (COD), UPI simulation, and Credit/Debit Card validation.
- Responsive design with subtle micro-interactions, page transition animations, and order confirmation celebrations.

### Project Limitations & Future Roadmap
- **Payment Processing**: The current checkout uses a simulated payment sandbox. Integration with production payment gateways (e.g., Stripe, Razorpay) would be required for live commercial deployment.
- **Logistics Integration**: Delivery tracking stages are managed via the administrative fulfillment stepper rather than live carrier webhooks (e.g., FedEx, Delhivery).
- **Blockchain Storage**: Digital Product Passports use cryptographic SHA-256 ledger references stored within MongoDB; integration with a public or consortium blockchain (e.g., Polygon) represents a future extension.
- **Email/SMS Notifications**: Order confirmation and dispatch notifications are presented in-app rather than transmitted via SMTP or SMS gateway.

---

## License

This project is licensed under the **ISC License**. Developed as an engineering portfolio implementation demonstrating circular commerce, full-stack state synchronization, and digital product passport verification.
