export type Role = "Admin" | "Staff" | "Customer";

export type WorkspaceId =
  | "subscriptions"
  | "billing"
  | "products"
  | "discounts"
  | "analytics"
  | "portal"
  | "users"
  | "companies";

export type UserStatus = "Active" | "Invited" | "Suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  company_id: string;
  department: string;
  job_title: string;
  phone: string;
  status: UserStatus;
  avatar_initials: string;
  linked_customer_id?: string;
  created_at: string;
  last_login_at: string;
}

export type CompanyStatus = "Active" | "Onboarding" | "Archived";

export interface Company {
  id: string;
  name: string;
  legal_name: string;
  code: string;
  tax_id: string;
  currency: "USD" | "EUR" | "GBP" | "INR";
  tax_rate: number;
  fiscal_year_start: string;
  default_payment_terms: "Immediate" | "Net 15" | "Net 30" | "Net 45" | "Net 60";
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  logo_initials: string;
  status: CompanyStatus;
  created_at: string;
}

export interface AuthSession {
  token: string;
  user_id: string;
  email: string;
  name: string;
  role: Role;
  company_id: string;
  issued_at: string;
  expires_at: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  companyMode: "existing" | "new";
  companyId?: string;
  newCompanyName?: string;
  newCompanyLegalName?: string;
  newCompanyTaxId?: string;
  newCompanyCurrency?: Company["currency"];
  department?: string;
  jobTitle?: string;
  phone?: string;
}

export interface Variant {
  name: string;
  price_surcharge: number;
}

export interface Product {
  id: string;
  company_id?: string;
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
  company_id?: string;
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
  company_id?: string;
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
  company_id?: string;
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
  company_id?: string;
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
  company_id?: string;
  invoice_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  note: string;
  recorded_by?: string;
}

export interface BrightloopState {
  companies: Company[];
  users: User[];
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
    USR?: number;
    COMP?: number;
  };
}
