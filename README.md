# 🍕 PizzaHub API

> **The modern, high-performance REST backend powering PizzaHub** — a multi-vendor pizza marketplace where customers discover local pizzerias, vendors manage menus and fulfill orders, and platform administrators oversee operations and financial transactions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.3-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.12-green?logo=mongodb)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-API-blueviolet?logo=stripe)](https://stripe.com/)
[![Zod](https://img.shields.io/badge/Zod-Validation-orange?logo=zod)](https://zod.dev/)

---

## 🌐 Links

- **Live Application:** [https://pizzahub-asgorfaiyaz.vercel.app](https://pizzahub-asgorfaiyaz.vercel.app)
- **Client Repository:** [https://github.com/asgorfaiyaz/pizzahub-client](https://github.com/asgorfaiyaz/pizzahub-client)
- **API Server Repository:** [https://github.com/asgorfaiyaz/pizzahub-api](https://github.com/asgorfaiyaz/pizzahub-api)

---

## 🚀 Key Features

### 1. 🍕 Public Menu Browsing
- **Search & Filtering:** Case-insensitive search by item name, category filtering, and location discovery.
- **Detailed Vendor Profiles:** Every menu item includes rich vendor metadata (`businessName`, `restaurantLocation`, `restaurantOpeningTime`, `restaurantClosingTime`, `restaurantPhone`, `image`).
- **Strict Visibility:** Only `approved` items are visible on the public browse menu.

### 2. 🛍️ Customer Hub
- **Order Placement:** Customers can order approved pizzas with delivery address, date, and custom notes.
- **Order Management:** View order history, track order status (`pending`, `accepted`, `rejected`, `cancelled`), and cancel pending orders.
- **Customer Overview:** Dedicated metrics for total, pending, and completed orders.

### 3. 👨‍🍳 Vendor Control Center
- **Menu Management:** Create, edit, and archive menu items with category assignments and multi-image uploads.
- **Free vs. Premium Quotas:** Free vendors are capped at 3 active items. Upgrading to Premium unlocks unlimited item listings.
- **Order Lifecycle:** Review incoming customer orders and accept or reject with real-time state validation.
- **Vendor Overview:** Instant snapshot of active menu items, pending orders, and subscription status.

### 4. 💳 Stripe Checkout & Webhook Security
- **One-Time Premium Upgrade:** Creates server-side hosted Stripe Checkout sessions.
- **Cryptographic Webhook Verification:** Verifies raw payload bytes (`stripe-signature`) using Stripe HMAC-SHA256 signatures to prevent fraudulent activations.
- **Idempotency Protection:** Checks existing transactions to safely handle duplicate webhook deliveries.
- **Zero Frontend Trust:** Account upgrades and transaction records are fulfilled solely through verified server-to-server webhooks.

### 5. 👑 Admin Dashboard & Moderation
- **System Overview:** Top-level metrics counting registered users, vendors, customers, menu items, pending reviews, and transactions.
- **User Management:** Search users by name/email, filter by role, inspect user details, and toggle account bans (`isBlocked`).
- **Instant Revocation:** Blocking a user immediately purges active sessions and blocks protected access across the platform.
- **Menu Item Moderation:** Review pending submissions to approve, reject, or delete inappropriate items.
- **Financial Audit Ledger:** Strictly read-only transaction history linking payments to vendor details.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules) | High-throughput async runtime |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | Strict static typing and compile-time safety |
| **Framework** | [Express 5.3](https://expressjs.com/) | Modern routing, error handling, and middleware |
| **Database** | [MongoDB Native Driver 6.12](https://www.mongodb.com/) | High-performance document database & aggregations |
| **Validation** | [Zod 4.6](https://zod.dev/) | Strict runtime schema parsing and query coercion |
| **Payments** | [Stripe SDK 23.2](https://stripe.com/) | Hosted Checkout Sessions & Webhook construct |
| **Security** | [CORS](https://www.npmjs.com/package/cors) | Configurable multi-origin resource sharing |
| **Environment** | [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |
| **Dev Tooling** | [tsx](https://github.com/privatenumber/tsx) | Zero-config TypeScript execution and hot reloading |

---

## 🔐 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server Port
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=pizzahub

# Frontend Client URL
CLIENT_URL=http://localhost:5173

# Stripe Payment Secrets
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Local port the Express server listens on | `5000` |
| `MONGODB_URI` | MongoDB connection connection string | `mongodb+srv://...` or `mongodb://localhost:27017` |
| `MONGODB_DB` | Target MongoDB database name | `pizzahub` |
| `CLIENT_URL` | URL of the frontend for CORS and redirects | `http://localhost:5173` |
| `STRIPE_SECRET_KEY` | Secret API key from Stripe Dashboard | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) | `whsec_...` |

---

## 💻 Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (optional, for testing local webhooks)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/asgorfaiyaz/pizzahub-api.git
cd pizzahub-api
npm install
```

### 3. Setup Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your MongoDB connection details and Stripe test keys.

### 4. Run Development Server
Start the server in hot-reload mode using `tsx`:
```bash
npm run dev
```
The API will be live at `http://localhost:5000`. Test the health check:
```bash
curl http://localhost:5000/health
# Response: hello world
```

### 5. Listen to Stripe Webhooks (Local Development)
To test the one-time upgrade payment flow locally:
```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
```
Copy the printed `whsec_...` into your `.env` as `STRIPE_WEBHOOK_SECRET`.

---

## 🏗️ Production Build

To compile TypeScript to standard JavaScript:
```bash
npm run build
npm start
```

---

## 📡 API Endpoint Overview

### Public Routes
- `GET /health` — Health check
- `GET /api/v1/menu-items` — Browse menu (with search, category, location, and pagination)
- `GET /api/v1/menu-items/locations` — Distinct restaurant locations
- `GET /api/v1/menu-items/:id` — Single menu item details with full vendor profile

### Customer Routes (`Authorization: Bearer <token>`)
- `GET /api/v1/customers/overview` — Customer dashboard overview
- `GET /api/v1/customers/orders` — List customer orders
- `POST /api/v1/customers/orders` — Place a new order
- `PATCH /api/v1/customers/orders/:id/cancel` — Cancel pending order

### Vendor Routes (`requireVendor`)
- `GET /api/v1/vendors/overview` — Vendor overview metrics
- `GET /api/v1/vendors/menu-items` — Manage vendor menu items
- `POST /api/v1/vendors/menu-items` — Create item (enforces 3-item free limit)
- `PATCH /api/v1/vendors/menu-items/:id` — Update menu item
- `DELETE /api/v1/vendors/menu-items/:id` — Remove menu item
- `GET /api/v1/vendors/orders` — View incoming customer orders
- `PATCH /api/v1/vendors/orders/:id/status` — Accept or reject customer orders
- `GET /api/v1/vendors/subscription` — Get plan status & active item counts
- `POST /api/v1/vendors/subscription/create-checkout-session` — Initiate Stripe Checkout
- `GET /api/v1/vendors/subscription/confirmation` — Verify payment transaction

### Admin Routes (`requireAdmin`)
- `GET /api/v1/admin/overview` — Platform top-level statistics
- `GET /api/v1/admin/users` — View all users (search by name/email, filter by role, paginate)
- `GET /api/v1/admin/users/:id` — View user details
- `PATCH /api/v1/admin/users/:id/block` — Block or unblock users (with session revocation)
- `GET /api/v1/admin/transactions` — Platform transactions ledger (strictly read-only)
- `GET /api/v1/admin/menu-items` — Moderate submitted menu items
- `PATCH /api/v1/admin/menu-items/:id/status` — Approve, reject, or deactivate menu items
- `DELETE /api/v1/admin/menu-items/:id` — Delete inappropriate items

### Webhooks
- `POST /api/v1/webhooks/stripe` — Cryptographically verified Stripe webhook handler

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
