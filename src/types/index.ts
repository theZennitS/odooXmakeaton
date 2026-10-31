export type Role = "Admin" | "Staff" | "Customer";

export type WorkspaceId =
  | "subscriptions"
  | "billing"
  | "products"
  | "discounts"
  | "analytics"
  | "portal";

export interface Variant {
  name: string;
  price_surcharge: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  cost_price: number;
  sales_price: number;
  notes: string;
  has_variants: boolean;
  variants: Variant[];
}

export interface Plan {
  id: string;
  name: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
  base_price: number;
  minimum_quantity: number;
  available_from: string;
  available_to: string;
  auto_close_on_end: boolean;
  allow_pause: boolean;
  allow_early_close: boolean;
  allow_renew: boolean;
}

export interface DiscountRule {
  id: string;
  name: string;
  discount_type: "Percentage" | "Fixed Amount";
  value: number;
  scope: "Whole Subscription" | "Specific Products";
  min_purchase_amount: number;
  min_quantity: number;
  start_date: string;
  end_date: string;
  max_usage_limit: number;
  current_usage_count: number;
  applicable_product_ids: string[];
}

export interface SubscriptionItem {
  product_id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface TimelineEntry {
  text: string;
  meta: string;
}

export type SubscriptionStatus =
  | "Draft"
  | "Quotation"
  | "Confirmed"
  | "Active"
  | "Paused"
  | "Closed"
  | "Overdue";

export interface Subscription {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_address: string;
  plan_id: string;
  plan_name: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
  start_date: string;
  expiry_date: string;
  next_billing_date: string;
  payment_terms: string;
  status: SubscriptionStatus;
  items: SubscriptionItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  timeline: TimelineEntry[];
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export type InvoiceStatus = "Confirmed" | "Paid" | "Overdue" | "Cancelled";

export interface Invoice {
  id: string;
  subscription_id: string;
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  subtotal: number;
  discount_amount: number;
  tax_total: number;
  grand_total: number;
  paid_amount: number;
  outstanding_amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  note: string;
}

export interface BrightloopState {
  products: Product[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discount_rules: DiscountRule[];
  counters: {
    SUB: number;
    INV: number;
    PAY: number;
  };
}
