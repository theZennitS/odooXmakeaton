import { BrightloopState, Product, Plan, DiscountRule, Subscription, Invoice, Payment } from "@/types";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "PROD-01",
    name: "Brightloop Core ERP",
    type: "Software License",
    cost_price: 150.00,
    sales_price: 350.00,
    notes: "Main business operating suite with inventory and CRM.",
    has_variants: true,
    variants: [
      { name: "Standard Edition", price_surcharge: 0.00 },
      { name: "Brand: Odoo Compatibility Layer", price_surcharge: 560.00 },
      { name: "Enterprise Multi-Company", price_surcharge: 300.00 }
    ]
  },
  {
    id: "PROD-02",
    name: "Advanced Analytics & BI Add-on",
    type: "Add-on",
    cost_price: 40.00,
    sales_price: 120.00,
    notes: "Executive reporting and real-time query dashboards.",
    has_variants: false,
    variants: []
  },
  {
    id: "PROD-03",
    name: "Automated Bank Reconciliation Connector",
    type: "Add-on",
    cost_price: 25.00,
    sales_price: 75.00,
    notes: "Direct live sync with 14,000+ banks worldwide.",
    has_variants: false,
    variants: []
  },
  {
    id: "PROD-04",
    name: "Dedicated Cloud Pod Support",
    type: "Service",
    cost_price: 80.00,
    sales_price: 195.00,
    notes: "24/7 dedicated DevOps monitoring and SLAs.",
    has_variants: false,
    variants: []
  }
];

export const DEFAULT_PLANS: Plan[] = [
  {
    id: "PLAN-STARTER",
    name: "Starter Business",
    frequency: "Monthly",
    base_price: 99.00,
    minimum_quantity: 1,
    available_from: "2026-01-01",
    available_to: "2027-12-31",
    auto_close_on_end: true,
    allow_pause: true,
    allow_early_close: true,
    allow_renew: true
  },
  {
    id: "PLAN-PRO-ODOO",
    name: "Professional (Odoo Powered)",
    frequency: "Monthly",
    base_price: 350.00, // + 560 for Odoo brand variant = 910
    minimum_quantity: 1,
    available_from: "2026-01-01",
    available_to: "2027-12-31",
    auto_close_on_end: false,
    allow_pause: true,
    allow_early_close: true,
    allow_renew: true
  },
  {
    id: "PLAN-ENTERPRISE",
    name: "Enterprise Annual Contract",
    frequency: "Yearly",
    base_price: 4500.00,
    minimum_quantity: 5,
    available_from: "2026-01-01",
    available_to: "2028-12-31",
    auto_close_on_end: true,
    allow_pause: false,
    allow_early_close: false,
    allow_renew: true
  }
];

export const DEFAULT_DISCOUNT_RULES: DiscountRule[] = [
  {
    id: "DISC-01",
    name: "High-Volume Seats Discount (15%)",
    discount_type: "Percentage",
    value: 15.0,
    scope: "Whole Subscription",
    min_purchase_amount: 500.0,
    min_quantity: 2,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    max_usage_limit: 100,
    current_usage_count: 24,
    applicable_product_ids: []
  },
  {
    id: "DISC-02",
    name: "Odoo Migration Welcome Voucher ($100 Off)",
    discount_type: "Fixed Amount",
    value: 100.0,
    scope: "Specific Products",
    min_purchase_amount: 200.0,
    min_quantity: 1,
    start_date: "2026-01-01",
    end_date: "2026-11-30",
    max_usage_limit: 50,
    current_usage_count: 38,
    applicable_product_ids: ["PROD-01"]
  }
];

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "SUB-2026-00001",
    customer_id: "CUST-101",
    customer_name: "Brooklyn Zoe",
    customer_address: "302 Snider Street, RUTLAND, VT, 05701",
    plan_id: "PLAN-PRO-ODOO",
    plan_name: "Professional (Odoo Powered)",
    frequency: "Monthly",
    start_date: "2026-08-01",
    expiry_date: "2027-08-01",
    next_billing_date: "2026-10-31", // Due today!
    payment_terms: "Net 15",
    status: "Active",
    items: [
      {
        product_id: "PROD-01",
        product_name: "Brightloop Core ERP",
        variant_name: "Brand: Odoo Compatibility Layer",
        quantity: 1,
        unit_price: 910.00,
        subtotal: 910.00
      }
    ],
    subtotal: 910.00,
    discount_amount: 136.50,
    tax_amount: 139.23,
    grand_total: 912.73,
    timeline: [
      { text: "Subscription activated on 2026-08-01", meta: "System • 2 months ago" },
      { text: "Converted from Quotation to Confirmed", meta: "Sarah Jenkins • 2 months ago" }
    ]
  },
  {
    id: "SUB-2026-00002",
    customer_id: "CUST-102",
    customer_name: "John McCormick",
    customer_address: "1096 Wiseman Street, CALMAR, IA, 52132",
    plan_id: "PLAN-STARTER",
    plan_name: "Starter Business",
    frequency: "Monthly",
    start_date: "2026-09-01",
    expiry_date: "2027-09-01",
    next_billing_date: "2026-11-01",
    payment_terms: "Net 15",
    status: "Active",
    items: [
      {
        product_id: "PROD-01",
        product_name: "Brightloop Core ERP",
        variant_name: "Standard Edition",
        quantity: 1,
        unit_price: 350.00,
        subtotal: 350.00
      },
      {
        product_id: "PROD-03",
        product_name: "Automated Bank Reconciliation Connector",
        variant_name: "",
        quantity: 1,
        unit_price: 75.00,
        subtotal: 75.00
      }
    ],
    subtotal: 425.00,
    discount_amount: 0.00,
    tax_amount: 76.50,
    grand_total: 501.50,
    timeline: [
      { text: "Subscription activated on 2026-09-01", meta: "System • 1 month ago" }
    ]
  },
  {
    id: "SUB-2026-00003",
    customer_id: "CUST-103",
    customer_name: "Sandra Pugh",
    customer_address: "1640 Thorn Street, SALE CITY, GA, 98106",
    plan_id: "PLAN-ENTERPRISE",
    plan_name: "Enterprise Annual Contract",
    frequency: "Yearly",
    start_date: "2026-05-15",
    expiry_date: "2027-05-15",
    next_billing_date: "2027-05-15",
    payment_terms: "Net 30",
    status: "Active",
    items: [
      {
        product_id: "PROD-01",
        product_name: "Brightloop Core ERP",
        variant_name: "Enterprise Multi-Company",
        quantity: 5,
        unit_price: 650.00,
        subtotal: 3250.00
      },
      {
        product_id: "PROD-02",
        product_name: "Advanced Analytics & BI Add-on",
        variant_name: "",
        quantity: 5,
        unit_price: 120.00,
        subtotal: 600.00
      }
    ],
    subtotal: 3850.00,
    discount_amount: 577.50,
    tax_amount: 589.05,
    grand_total: 3861.55,
    timeline: [
      { text: "Enterprise Contract Signed (5 Licenses)", meta: "Admin Lead • 5 months ago" }
    ]
  },
  {
    id: "SUB-2026-00004",
    customer_id: "CUST-104",
    customer_name: "Vernie Hart",
    customer_address: "3898 Oak Drive, DOVER, DE, 19901",
    plan_id: "PLAN-STARTER",
    plan_name: "Starter Business",
    frequency: "Monthly",
    start_date: "2026-10-15",
    expiry_date: "2027-10-15",
    next_billing_date: "2026-11-15",
    payment_terms: "Net 15",
    status: "Quotation",
    items: [
      {
        product_id: "PROD-01",
        product_name: "Brightloop Core ERP",
        variant_name: "Standard Edition",
        quantity: 1,
        unit_price: 350.00,
        subtotal: 350.00
      }
    ],
    subtotal: 350.00,
    discount_amount: 0.00,
    tax_amount: 63.00,
    grand_total: 413.00,
    timeline: [
      { text: "Quotation generated from Starter Template", meta: "Sarah Jenkins • 15 days ago" }
    ]
  },
  {
    id: "SUB-2026-00005",
    customer_id: "CUST-105",
    customer_name: "Mark Clark",
    customer_address: "1915 Augusta Park, NASSAU, NY, 12062",
    plan_id: "PLAN-PRO-ODOO",
    plan_name: "Professional (Odoo Powered)",
    frequency: "Monthly",
    start_date: "2026-07-01",
    expiry_date: "2027-07-01",
    next_billing_date: "2026-10-01", // Overdue billing
    payment_terms: "Net 15",
    status: "Active",
    items: [
      {
        product_id: "PROD-01",
        product_name: "Brightloop Core ERP",
        variant_name: "Brand: Odoo Compatibility Layer",
        quantity: 1,
        unit_price: 910.00,
        subtotal: 910.00
      }
    ],
    subtotal: 910.00,
    discount_amount: 0.00,
    tax_amount: 163.80,
    grand_total: 1073.80,
    timeline: [
      { text: "Subscription Active", meta: "System • 3 months ago" }
    ]
  }
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: "INV-2026-00001",
    subscription_id: "SUB-2026-00001",
    customer_id: "CUST-101",
    customer_name: "Brooklyn Zoe",
    invoice_date: "2026-09-30",
    due_date: "2026-10-15",
    billing_period_start: "2026-09-30",
    billing_period_end: "2026-10-31",
    subtotal: 910.00,
    discount_amount: 136.50,
    tax_total: 139.23,
    grand_total: 912.73,
    paid_amount: 912.73,
    outstanding_amount: 0.00,
    status: "Paid",
    items: [
      {
        product_name: "Brightloop Core ERP (Brand: Odoo Compatibility Layer)",
        quantity: 1,
        unit_price: 910.00,
        amount: 910.00
      }
    ]
  },
  {
    id: "INV-2026-00002",
    subscription_id: "SUB-2026-00005",
    customer_id: "CUST-105",
    customer_name: "Mark Clark",
    invoice_date: "2026-10-01",
    due_date: "2026-10-16",
    billing_period_start: "2026-10-01",
    billing_period_end: "2026-10-31",
    subtotal: 910.00,
    discount_amount: 0.00,
    tax_total: 163.80,
    grand_total: 1073.80,
    paid_amount: 0.00,
    outstanding_amount: 1073.80,
    status: "Overdue",
    items: [
      {
        product_name: "Brightloop Core ERP (Brand: Odoo Compatibility Layer)",
        quantity: 1,
        unit_price: 910.00,
        amount: 910.00
      }
    ]
  }
];

export const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: "PAY-2026-00001",
    invoice_id: "INV-2026-00001",
    customer_name: "Brooklyn Zoe",
    amount: 912.73,
    payment_method: "Credit Card",
    payment_date: "2026-10-05",
    note: "Stripe auto-charge ref: ch_3N84x81"
  }
];

export const INITIAL_STATE: BrightloopState = {
  products: DEFAULT_PRODUCTS,
  plans: DEFAULT_PLANS,
  subscriptions: DEFAULT_SUBSCRIPTIONS,
  invoices: DEFAULT_INVOICES,
  payments: DEFAULT_PAYMENTS,
  discount_rules: DEFAULT_DISCOUNT_RULES,
  counters: { SUB: 6, INV: 3, PAY: 2 }
};

