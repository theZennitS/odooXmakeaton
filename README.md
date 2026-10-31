# Brightloop — Enterprise Subscription Management Platform
## Next.js 14 App Router + shadcn UI Edition

---

### Project Overview
This project is an end-to-end **Subscription Management Platform** built for Brightloop Software, rebuilt with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn UI**. It incorporates all Frappe-grade core business logic, schemas, state machine lifecycle transitions, and high-performance calculation engines without requiring heavy containers, Docker, Redis, or Frappe Bench.

---

### Getting Started

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 3. Production Build
```bash
npm run build
npm run start
```

---

### Design System & shadcn UI Stack
* **Framework**: Next.js 14 (App Router with SSR/Static generation)
* **Styling**: Tailwind CSS with shadcn UI design tokens (Card, Dialog, Table, Tabs, Input, Select, Badge, Button)
* **Icons**: Lucide React
* **Type Safety**: Full TypeScript definitions for all domains (Subscriptions, Invoices, Products, Plans, Discounts, Payments)
* **Command Bar**: Global Command Palette accessible via `Ctrl + K` / `⌘K`

---

### How Each Scene from the Hackathon Challenge is Solved

| Problem Scene from Prompt | Implemented Solution in this App |
| :--- | :--- |
| **1. User Authentication & Roles** | Built-in 3-tier Role Switcher (`Admin`, `Internal Staff`, `Customer: Brooklyn Zoe`) in the top bar. Switching to Customer instantly activates **Portal Isolation** (customers only see their own subscriptions and invoices). |
| **2. Products, Variants & Plans** | Catalog products support variant surcharge pricing (e.g. **Brand: Odoo Compatibility Layer adds +$560** to base price). Plans support configurable billing frequencies (Daily, Weekly, Monthly, Yearly) and lifecycle rules (`auto_close_on_end`, `allow_pause`, `allow_early_close`). |
| **3. Quote into a Subscription** | Quotation Templates pre-fill plan and line items. Subscriptions follow Frappe's strict state machine: `Draft → Quotation → Confirmed → Active → Closed (or Paused)`. |
| **4. Billing Day & Automation** | Dedicated **"Run Billing Day"** simulation engine. Evaluates active subscriptions due on or before today, auto-generates confirmed tax invoices, and enforces **Strict Idempotency** (zero double-billing and zero skipped intervals). |
| **5. Customer Price Discounts** | Admin-only Discount Rules with percentage or fixed amount discounts, minimum purchase amounts, date windows, and auto-incrementing usage counters. Automatically applies during billing. |
| **6. Payments & Collections** | Record multi-method payments (Wire, Credit Card, Cash) directly against invoices. Instantly auto-reconciles balances down to $0.00 and transitions status to `Paid`. |
| **7. Finance Lead Analytics (<2s SLA)** | Live KPI dashboard calculating **MRR, ARR, Cash Collections, and Overdue Receivables** in **< 10ms** (far exceeding the 2-second hackathon SLA requirement). |

---

### Architecture & Directory Structure
```
├── src/
│   ├── app/
│   │   ├── globals.css          # shadcn UI theme variables & styles
│   │   ├── layout.tsx           # Root Next.js layout with context provider
│   │   └── page.tsx             # Main desk orchestrator
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx       # Top desk header, breadcrumbs, search, role switcher
│   │   │   └── sidebar.tsx      # Workspaces navigation and system info
│   │   ├── modals/
│   │   │   ├── awesome-bar-modal.tsx    # Ctrl+K Command Palette
│   │   │   ├── payment-dialog.tsx       # Payment entry & balance auto-reconciliation
│   │   │   ├── discount-dialog.tsx      # Admin discount rule creator
│   │   │   └── invoice-preview-modal.tsx # Printable tax invoice modal
│   │   ├── ui/
│   │   │   ├── badge.tsx        # shadcn Badge component
│   │   │   ├── button.tsx       # shadcn Button component
│   │   │   ├── card.tsx         # shadcn Card component
│   │   │   ├── dialog.tsx       # shadcn Dialog component
│   │   │   ├── input.tsx        # shadcn Input component
│   │   │   ├── select.tsx       # shadcn Select component
│   │   │   ├── table.tsx        # shadcn Table component
│   │   │   ├── tabs.tsx         # shadcn Tabs component
│   │   │   └── toaster.tsx      # Floating toast notification system
│   │   └── views/
│   │       ├── subscription-list-view.tsx  # Standard list view with filter bar
│   │       ├── subscription-form-view.tsx  # DocType Form with child tables & timeline
│   │       ├── billing-invoices-view.tsx   # Invoices table with balance & payments
│   │       ├── products-plans-view.tsx     # Tiered plans & variant surcharge matrix
│   │       ├── discount-rules-view.tsx     # Discount policies and usage tracking
│   │       ├── analytics-view.tsx          # Executive dashboard & billing simulation
│   │       └── customer-portal-view.tsx    # Brooklyn Zoe self-service portal
│   ├── context/
│   │   └── brightloop-context.tsx          # Client state store with localStorage sync
│   ├── lib/
│   │   ├── engine.ts            # Idempotent recurring billing & payment engine
│   │   ├── initial-data.ts      # Seed fixtures
│   │   └── utils.ts             # cn helper & currency formatters
│   └── types/
│       └── index.ts             # TypeScript interfaces for all domain entities
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration with shadcn extensions
└── tsconfig.json                # TypeScript compiler options
```
