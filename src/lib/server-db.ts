import fs from "fs";
import path from "path";
import {
  Product,
  Plan,
  Subscription,
  Invoice,
  Payment,
  DiscountRule,
  SubscriptionItem,
} from "@/types";
import { CompanyProfile, SubsidiaryEntity } from "@/types/company";
import { AuthUser } from "@/types/auth";
import { AuditLedgerRecord, NotificationCenterItem } from "@/types/overall";
import { addDays, addPeriod, evaluateDiscount } from "./engine";
import { fmtCurr } from "./utils";

const DB_FILE_PATH = path.join(process.cwd(), "data", "brightloop-db.json");

export interface DatabaseSchema {
  users: (AuthUser & { passwordHash: string })[];
  company: CompanyProfile;
  products: Product[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discount_rules: DiscountRule[];
  auditLedger: AuditLedgerRecord[];
  notifications: NotificationCenterItem[];
  counters: {
    SUB: number;
    INV: number;
    PAY: number;
    AUD: number;
  };
}

const INITIAL_DATABASE: DatabaseSchema = {
  users: [
    {
      id: "usr-admin-01",
      name: "NITHEESH R",
      email: "admin@brightloop.io",
      role: "Admin",
      avatar: "NR",
      department: "Executive Management",
      lastLoginAt: new Date().toISOString(),
      passwordHash: "admin123",
    },
    {
      id: "usr-staff-01",
      name: "Sarah Jenkins",
      email: "staff@brightloop.io",
      role: "Staff",
      avatar: "SJ",
      department: "Billing Operations",
      lastLoginAt: new Date().toISOString(),
      passwordHash: "staff123",
    },
    {
      id: "usr-cust-01",
      name: "Brooklyn Zoe",
      email: "brooklyn@zoe.io",
      role: "Customer",
      avatar: "BZ",
      department: "Client / Subscriber",
      lastLoginAt: new Date().toISOString(),
      passwordHash: "client123",
    },
  ],
  company: {
    id: "comp-brightloop-parent",
    name: "Brightloop Software Inc.",
    legalName: "Brightloop Software Incorporated",
    avatarInitials: "BL",
    logoUrl: "",
    jurisdiction: "Delaware, USA",
    taxId: "US-EIN-9482104",
    currency: "USD",
    currencySymbol: "$",
    headquartersAddress: {
      street: "1209 North Orange Street",
      city: "Wilmington",
      state: "DE",
      country: "United States",
      postalCode: "19801",
    },
    email: "finance@brightloop.io",
    phone: "+1 (415) 890-5200",
    website: "https://brightloop.io",
    taxRegistrations: [
      {
        id: "tax-us-fed",
        taxIdType: "EIN",
        taxNumber: "US-EIN-9482104",
        jurisdiction: "United States (Federal IRS)",
        isPrimary: true,
        defaultRate: 18,
      },
    ],
    fiscalSettings: {
      fiscalYearStart: "Jan 1",
      fiscalYearEnd: "Dec 31",
      defaultPaymentTerms: "Net 15",
      defaultTaxRate: 18,
      currency: "USD",
      currencySymbol: "$",
      multiCurrencyEnabled: true,
    },
    bankCoordinates: {
      bankName: "Silicon Valley Bank",
      accountName: "Brightloop Software Inc. Operating Treasury",
      accountNumber: "948210492810",
      routingNumber: "121140399",
      swiftBic: "SVBKUS6S",
      iban: "US33SVBK1211403990001",
      currency: "USD",
      wireInstructions: "Include invoice ID (INV-2026-XXXX) on the remittance note.",
    },
    subsidiaries: [
      {
        id: "sub-odoo-layer",
        name: "Odoo Compatibility Layer LLC",
        legalName: "Odoo Compatibility Layer LLC",
        code: "OCL-TX",
        jurisdiction: "Austin, TX, USA",
        taxId: "TX-849201",
        currency: "USD",
        currencySymbol: "$",
        licenseShares: 35,
        primaryStack: "ERP Connectors & Odoo Bridge",
        status: "Active",
        address: {
          street: "500 West 2nd St, Suite 1900",
          city: "Austin",
          state: "TX",
          country: "United States",
          postalCode: "78701",
        },
        isConsolidated: true,
        contactEmail: "connectors@brightloop-layer.io",
      },
      {
        id: "sub-emea-cloud",
        name: "Brightloop EMEA Cloud Ltd",
        legalName: "Brightloop EMEA Cloud Limited",
        code: "BL-EMEA",
        jurisdiction: "Dublin, Ireland",
        taxId: "IE9482014",
        currency: "EUR",
        currencySymbol: "€",
        licenseShares: 45,
        primaryStack: "Cloud Hosting & EU GDPR Gateway",
        status: "Active",
        address: {
          street: "1 Grants Row, Grand Canal Dock",
          city: "Dublin 2",
          state: "Leinster",
          country: "Ireland",
          postalCode: "D02 HX96",
        },
        isConsolidated: true,
        contactEmail: "emea-billing@brightloop.eu",
      },
    ],
  },
  products: [
    {
      id: "PROD-01",
      name: "Brightloop Core ERP",
      type: "Software License",
      cost_price: 150.0,
      sales_price: 350.0,
      notes: "Main business operating suite with inventory and CRM.",
      has_variants: true,
      variants: [
        { name: "Standard Edition", price_surcharge: 0.0 },
        { name: "Brand: Odoo Compatibility Layer", price_surcharge: 560.0 },
        { name: "Enterprise Multi-Company", price_surcharge: 300.0 },
      ],
    },
    {
      id: "PROD-02",
      name: "Advanced Analytics & BI Add-on",
      type: "Add-on",
      cost_price: 40.0,
      sales_price: 120.0,
      notes: "Executive reporting and real-time query dashboards.",
      has_variants: false,
      variants: [],
    },
    {
      id: "PROD-03",
      name: "Automated Bank Reconciliation Connector",
      type: "Add-on",
      cost_price: 25.0,
      sales_price: 75.0,
      notes: "Direct live sync with 14,000+ banks worldwide.",
      has_variants: false,
      variants: [],
    },
  ],
  plans: [
    {
      id: "PLAN-STARTER",
      name: "Starter Business",
      frequency: "Monthly",
      base_price: 99.0,
      minimum_quantity: 1,
      available_from: "2026-01-01",
      available_to: "2027-12-31",
      auto_close_on_end: true,
      allow_pause: true,
      allow_early_close: true,
      allow_renew: true,
    },
    {
      id: "PLAN-PRO-ODOO",
      name: "Professional (Odoo Powered)",
      frequency: "Monthly",
      base_price: 350.0,
      minimum_quantity: 1,
      available_from: "2026-01-01",
      available_to: "2027-12-31",
      auto_close_on_end: false,
      allow_pause: true,
      allow_early_close: true,
      allow_renew: true,
    },
    {
      id: "PLAN-ENTERPRISE",
      name: "Enterprise Annual Contract",
      frequency: "Yearly",
      base_price: 4500.0,
      minimum_quantity: 5,
      available_from: "2026-01-01",
      available_to: "2028-12-31",
      auto_close_on_end: true,
      allow_pause: false,
      allow_early_close: false,
      allow_renew: true,
    },
  ],
  subscriptions: [],
  invoices: [],
  payments: [],
  discount_rules: [
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
      current_usage_count: 0,
      applicable_product_ids: [],
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
      current_usage_count: 0,
      applicable_product_ids: ["PROD-01"],
    },
  ],
  auditLedger: [
    {
      id: "AUD-001",
      timestamp: new Date().toISOString(),
      actor: "System Engine",
      action: "Config Update",
      entity: "SYSTEM-INIT",
      status: "Success",
      details: "Persistent database initialized with zero mock data. Real API engine active.",
      ipAddress: "127.0.0.1",
    },
  ],
  notifications: [
    {
      id: "notif-init",
      title: "Real API & Database Connected",
      message: "Mock data removed. All user actions now persist to server database and reflect in Company Portal.",
      category: "system",
      categoryLabel: "All",
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
      read: false,
      severity: "success",
    },
  ],
  counters: {
    SUB: 1,
    INV: 1,
    PAY: 1,
    AUD: 2,
  },
};

export function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      saveDatabase(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading database file, resetting to clean init:", e);
    saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write database file:", e);
  }
}

export function recordAudit(
  actor: string,
  action: "Invoice Gen" | "Payment" | "Status Change" | "Config Update",
  entity: string,
  status: "Success" | "Warning" | "Failure",
  details: string,
  ip: string = "127.0.0.1"
): AuditLedgerRecord {
  const db = getDatabase();
  const idNum = db.counters.AUD || 1;
  db.counters.AUD = idNum + 1;

  const log: AuditLedgerRecord = {
    id: `AUD-${String(idNum).padStart(4, "0")}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    actor,
    action,
    entity,
    status,
    details,
    ipAddress: ip,
  };

  db.auditLedger.unshift(log);

  // Also add notification for relevant actions
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `${action}: ${entity}`,
    message: `${actor}: ${details}`,
    category: action === "Payment" ? "billing" : action === "Invoice Gen" ? "cron" : "system",
    categoryLabel: action === "Payment" ? "Billing" : "All",
    timestamp: new Date().toISOString(),
    relativeTime: "Just now",
    read: false,
    severity: status === "Success" ? "success" : "info",
    actionLabel: "Inspect",
  });

  saveDatabase(db);
  return log;
}
