/**
 * Brightloop Subscription Management System
 * Frappe Desk / Frappe UI Engine & Core Business Logic
 */

// =============================================================================
// 1. DATA FIXTURES & STATE MANAGER
// =============================================================================

const STORAGE_KEY = "brightloop_frappe_desk_v2";

const DEFAULT_PRODUCTS = [
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

const DEFAULT_PLANS = [
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

const DEFAULT_DISCOUNT_RULES = [
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

const DEFAULT_SUBSCRIPTIONS = [
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
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: "Brand: Odoo Compatibility Layer", quantity: 1, unit_price: 910.00, subtotal: 910.00 }
    ],
    subtotal: 910.00,
    discount_amount: 136.50,
    tax_amount: 139.23,
    grand_total: 912.73,
    timeline: [
      { text: "Subscription activated on 2026-08-01", meta: "System &bull; 2 months ago" },
      { text: "Converted from Quotation to Confirmed", meta: "Sarah Jenkins &bull; 2 months ago" }
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
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: "Standard Edition", quantity: 1, unit_price: 350.00, subtotal: 350.00 },
      { product_id: "PROD-03", product_name: "Automated Bank Reconciliation Connector", variant_name: "", quantity: 1, unit_price: 75.00, subtotal: 75.00 }
    ],
    subtotal: 425.00,
    discount_amount: 0.00,
    tax_amount: 76.50,
    grand_total: 501.50,
    timeline: [
      { text: "Subscription activated on 2026-09-01", meta: "System &bull; 1 month ago" }
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
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: "Enterprise Multi-Company", quantity: 5, unit_price: 650.00, subtotal: 3250.00 },
      { product_id: "PROD-02", product_name: "Advanced Analytics & BI Add-on", variant_name: "", quantity: 5, unit_price: 120.00, subtotal: 600.00 }
    ],
    subtotal: 3850.00,
    discount_amount: 577.50,
    tax_amount: 589.05,
    grand_total: 3861.55,
    timeline: [
      { text: "Enterprise Contract Signed (5 Licenses)", meta: "Admin Lead &bull; 5 months ago" }
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
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: "Standard Edition", quantity: 1, unit_price: 350.00, subtotal: 350.00 }
    ],
    subtotal: 350.00,
    discount_amount: 0.00,
    tax_amount: 63.00,
    grand_total: 413.00,
    timeline: [
      { text: "Quotation generated from Starter Template", meta: "Sarah Jenkins &bull; 15 days ago" }
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
    next_billing_date: "2026-10-01", // Overdue billing!
    payment_terms: "Net 15",
    status: "Active",
    items: [
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: "Brand: Odoo Compatibility Layer", quantity: 1, unit_price: 910.00, subtotal: 910.00 }
    ],
    subtotal: 910.00,
    discount_amount: 0.00,
    tax_amount: 163.80,
    grand_total: 1073.80,
    timeline: [
      { text: "Subscription Active", meta: "System &bull; 3 months ago" }
    ]
  }
];

const DEFAULT_INVOICES = [
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
      { product_name: "Brightloop Core ERP (Brand: Odoo)", quantity: 1, unit_price: 910.00, amount: 910.00 }
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
      { product_name: "Brightloop Core ERP (Brand: Odoo)", quantity: 1, unit_price: 910.00, amount: 910.00 }
    ]
  }
];

const DEFAULT_PAYMENTS = [
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

class DeskState {
  constructor() {
    this.data = this.load();
    this.currentWorkspace = "subscriptions";
    this.currentViewMode = "list"; // 'list' | 'form'
    this.activeDocId = null; // Currently opened subscription in Form View
    this.currentRole = "Admin"; // Admin | Staff | Customer
  }

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Storage corrupted, fallback to seed", e);
      }
    }
    return {
      products: DEFAULT_PRODUCTS,
      plans: DEFAULT_PLANS,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
      invoices: DEFAULT_INVOICES,
      payments: DEFAULT_PAYMENTS,
      discount_rules: DEFAULT_DISCOUNT_RULES,
      counters: { SUB: 6, INV: 3, PAY: 2 }
    };
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
    this.save();
  }

  getNextId(prefix) {
    const current = (this.data.counters[prefix] || 1);
    this.data.counters[prefix] = current + 1;
    this.save();
    return `${prefix}-2026-${String(current).padStart(5, "0")}`;
  }
}

const state = new DeskState();

// =============================================================================
// 2. FRAPPE CORE BUSINESS LOGIC ENGINES
// =============================================================================

const FrappeEngine = {
  // Idempotent Automated Recurring Billing Cron
  runBillingDay(todayStr = "2026-10-31") {
    const startTime = performance.now();
    const today = new Date(todayStr);
    const generated = [];

    state.data.subscriptions.forEach(sub => {
      if (sub.status !== "Active") return;
      const nextDue = new Date(sub.next_billing_date);
      if (nextDue > today) return;

      const periodStart = sub.next_billing_date;
      const periodEnd = FrappeEngine.addPeriod(periodStart, sub.frequency);

      // STRICT IDEMPOTENCY GUARD:
      const alreadyBilled = state.data.invoices.some(inv => 
        inv.subscription_id === sub.id && 
        inv.billing_period_start === periodStart && 
        inv.status !== "Cancelled"
      );
      if (alreadyBilled) return;

      // Calculate discounts
      const discount = FrappeEngine.evaluateDiscount(sub, todayStr);
      const subtotal = sub.subtotal;
      const tax = ((subtotal - discount) * 18.0) / 100.0;
      const grand = (subtotal - discount) + tax;

      const inv = {
        id: state.getNextId("INV"),
        subscription_id: sub.id,
        customer_id: sub.customer_id,
        customer_name: sub.customer_name,
        invoice_date: todayStr,
        due_date: FrappeEngine.addDays(todayStr, 15),
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        subtotal: subtotal,
        discount_amount: discount,
        tax_total: tax,
        grand_total: grand,
        paid_amount: 0.00,
        outstanding_amount: grand,
        status: "Confirmed",
        items: sub.items.map(it => ({
          product_name: `${it.product_name} ${it.variant_name ? '(' + it.variant_name + ')' : ''}`,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: it.subtotal
        }))
      };

      state.data.invoices.unshift(inv);
      generated.push(inv);

      // Advance subscription
      sub.next_billing_date = periodEnd;
      if (!sub.timeline) sub.timeline = [];
      sub.timeline.unshift({
        text: `Automated Invoice ${inv.id} generated (${fmtCurr(grand)})`,
        meta: `Scheduled Cron &bull; Just now`
      });
    });

    state.save();
    const elapsed = (performance.now() - startTime).toFixed(2);
    return { count: generated.length, latency: elapsed, generated };
  },

  // Evaluate Discounts
  evaluateDiscount(sub, todayStr) {
    let totalDisc = 0.0;
    const today = new Date(todayStr);

    state.data.discount_rules.forEach(rule => {
      if (new Date(rule.start_date) > today || new Date(rule.end_date) < today) return;
      if (rule.max_usage_limit > 0 && rule.current_usage_count >= rule.max_usage_limit) return;
      if (sub.subtotal < rule.min_purchase_amount) return;

      let applied = false;
      if (rule.scope === "Whole Subscription") {
        totalDisc += rule.discount_type === "Percentage" ? (sub.subtotal * rule.value) / 100 : rule.value;
        applied = true;
      } else if (rule.scope === "Specific Products") {
        const eligible = sub.items
          .filter(i => rule.applicable_product_ids.includes(i.product_id))
          .reduce((sum, i) => sum + i.subtotal, 0);
        if (eligible > 0) {
          totalDisc += rule.discount_type === "Percentage" ? (eligible * rule.value) / 100 : Math.min(rule.value, eligible);
          applied = true;
        }
      }
      if (applied) rule.current_usage_count++;
    });

    return Math.min(totalDisc, sub.subtotal);
  },

  // Record Payment Entry & Auto-Reconcile
  recordPayment(invId, amount, method, note) {
    const inv = state.data.invoices.find(i => i.id === invId);
    if (!inv) return { error: "Invoice not found" };

    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) return { error: "Invalid payment amount" };
    if (payAmt > (inv.outstanding_amount + 0.01)) return { error: `Payment exceeds outstanding balance of $${inv.outstanding_amount.toFixed(2)}` };

    const payment = {
      id: state.getNextId("PAY"),
      invoice_id: inv.id,
      customer_name: inv.customer_name,
      amount: payAmt,
      payment_method: method,
      payment_date: "2026-10-31",
      note: note || `Payment entry via ${method}`
    };

    inv.paid_amount += payAmt;
    inv.outstanding_amount = Math.max(0.00, inv.grand_total - inv.paid_amount);
    inv.status = inv.outstanding_amount === 0.00 ? "Paid" : "Confirmed";

    state.data.payments.unshift(payment);

    // Update parent subscription timeline
    const sub = state.data.subscriptions.find(s => s.id === inv.subscription_id);
    if (sub && sub.timeline) {
      sub.timeline.unshift({
        text: `Payment ${payment.id} received (${fmtCurr(payAmt)}) for ${inv.id}`,
        meta: `Finance Desk &bull; Just now`
      });
    }

    state.save();
    return { success: true, payment, invoice: inv };
  },

  addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  },

  addPeriod(dateStr, freq) {
    const d = new Date(dateStr);
    if (freq === "Daily") d.setDate(d.getDate() + 1);
    else if (freq === "Weekly") d.setDate(d.getDate() + 7);
    else if (freq === "Monthly") d.setMonth(d.getMonth() + 1);
    else if (freq === "Yearly") d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  }
};

function fmtCurr(n) {
  return "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(msg, type = "info") {
  const container = document.getElementById("frappe-toasts");
  const el = document.createElement("div");
  el.className = `frappe-toast ${type}`;
  el.innerHTML = `<span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, 3500);
}

// Indicator dot class helper
function getIndicatorClass(status) {
  switch ((status || "").toLowerCase()) {
    case "active":
    case "paid":
      return "green";
    case "quotation":
      return "orange";
    case "confirmed":
      return "blue";
    case "overdue":
      return "red";
    default:
      return "gray";
  }
}

// =============================================================================
// 3. FRAPPE DESK NAVIGATION & ROUTING
// =============================================================================

function navigateTo(workspace, viewMode = "list", docId = null) {
  state.currentWorkspace = workspace;
  state.currentViewMode = viewMode;
  state.activeDocId = docId;

  // Update Sidebar active state
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.classList.toggle("active", item.dataset.workspace === workspace);
  });

  // Hide all view containers
  document.querySelectorAll(".frappe-view").forEach(v => v.classList.remove("active"));

  // Header & Breadcrumb references
  const bcModule = document.getElementById("bc-module");
  const bcCurrent = document.getElementById("bc-current");
  const pageTitle = document.getElementById("page-title");
  const actionsContainer = document.getElementById("page-actions-container");
  const statusBadge = document.getElementById("page-status-badge");

  statusBadge.style.display = "none";
  actionsContainer.innerHTML = "";

  if (workspace === "subscriptions") {
    bcModule.textContent = "Subscriptions";

    if (viewMode === "list") {
      document.getElementById("view-subscription-list").classList.add("active");
      bcCurrent.textContent = "Customer Subscription";
      pageTitle.textContent = "Customer Subscription";

      actionsContainer.innerHTML = `
        <button class="frappe-btn frappe-btn-primary" id="btn-add-subscription">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Customer Subscription</span>
        </button>
      `;
      document.getElementById("btn-add-subscription").addEventListener("click", () => openNewSubscriptionForm());
      renderSubscriptionList();

    } else if (viewMode === "form") {
      document.getElementById("view-subscription-form").classList.add("active");
      bcCurrent.textContent = docId;
      pageTitle.textContent = docId;

      const sub = state.data.subscriptions.find(s => s.id === docId);
      const isNew = !sub;

      actionsContainer.innerHTML = `
        <button class="frappe-btn frappe-btn-subtle" id="btn-form-back">&larr; Back to List</button>
        <button class="frappe-btn frappe-btn-primary" id="btn-form-save">Save</button>
        ${!isNew ? `
          <select class="frappe-select-filter" id="form-actions-dropdown">
            <option value="">Actions ▾</option>
            ${sub.status === 'Draft' ? '<option value="Quotation">Submit Quotation</option>' : ''}
            ${sub.status === 'Quotation' ? '<option value="Confirmed">Confirm Contract</option>' : ''}
            ${sub.status === 'Confirmed' ? '<option value="Active">Activate</option>' : ''}
            ${sub.status === 'Active' ? '<option value="Paused">Pause Subscription</option><option value="Closed">Cancel / Close</option><option value="BillNow">Bill Immediately</option>' : ''}
            ${sub.status === 'Paused' ? '<option value="Active">Resume Active</option>' : ''}
          </select>
        ` : ''}
      `;

      document.getElementById("btn-form-back").addEventListener("click", () => navigateTo("subscriptions", "list"));
      document.getElementById("btn-form-save").addEventListener("click", () => saveSubscriptionForm());

      const actDrop = document.getElementById("form-actions-dropdown");
      if (actDrop) {
        actDrop.addEventListener("change", (e) => {
          handleFormAction(e.target.value);
          e.target.value = "";
        });
      }

      loadSubscriptionForm(docId);
    }

  } else if (workspace === "billing") {
    bcModule.textContent = "Accounting";
    bcCurrent.textContent = "Subscription Invoice";
    pageTitle.textContent = "Subscription Invoices";
    document.getElementById("view-billing").classList.add("active");
    renderInvoicesList();

  } else if (workspace === "analytics") {
    bcModule.textContent = "Analytics";
    bcCurrent.textContent = "Executive Dashboard";
    pageTitle.textContent = "Finance Analytics";
    document.getElementById("view-analytics").classList.add("active");
    renderAnalyticsWorkspace();

  } else if (workspace === "products") {
    bcModule.textContent = "Catalog";
    bcCurrent.textContent = "Products & Plans";
    pageTitle.textContent = "Subscription Plans & Products";
    document.getElementById("view-products").classList.add("active");
    renderProductsWorkspace();

  } else if (workspace === "discounts") {
    bcModule.textContent = "Pricing";
    bcCurrent.textContent = "Discount Rules";
    pageTitle.textContent = "Admin Discount Rules";
    document.getElementById("view-discounts").classList.add("active");
    renderDiscountsWorkspace();

  } else if (workspace === "portal") {
    bcModule.textContent = "Portal";
    bcCurrent.textContent = "My Account";
    pageTitle.textContent = "Customer Portal";
    document.getElementById("view-portal").classList.add("active");
    renderCustomerPortalWorkspace();
  }
}

// =============================================================================
// 4. FRAPPE LIST VIEW RENDERER
// =============================================================================

function renderSubscriptionList() {
  const tbody = document.getElementById("subscriptions-list-tbody");
  if (!tbody) return;

  let list = state.data.subscriptions;

  // Customer role restriction
  if (state.currentRole === "Customer") {
    list = list.filter(s => s.customer_name.toLowerCase().includes("brooklyn"));
  }

  // Filters
  const statusFilter = document.getElementById("filter-sub-status").value;
  if (statusFilter !== "all") {
    list = list.filter(s => s.status.toLowerCase() === statusFilter.toLowerCase());
  }

  const planFilter = document.getElementById("filter-sub-plan").value;
  if (planFilter !== "all") {
    list = list.filter(s => s.plan_id === planFilter);
  }

  const search = (document.getElementById("sub-list-search").value || "").toLowerCase().trim();
  if (search) {
    list = list.filter(s => 
      s.id.toLowerCase().includes(search) || 
      s.customer_name.toLowerCase().includes(search) || 
      s.plan_name.toLowerCase().includes(search)
    );
  }

  document.getElementById("list-count-display").textContent = `Showing ${list.length} records`;
  document.getElementById("sub-pagination-info").textContent = `1 - ${list.length} of ${list.length}`;

  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-light);">No documents found.</td></tr>`;
    return;
  }

  list.forEach(sub => {
    const tr = document.createElement("tr");
    const indColor = getIndicatorClass(sub.status);

    tr.innerHTML = `
      <td><input type="checkbox" class="sub-checkbox" value="${sub.id}"></td>
      <td><a href="#" class="doc-link" data-id="${sub.id}">${sub.id}</a></td>
      <td>
        <span class="frappe-indicator">
          <span class="indicator-dot ${indColor}"></span>
          <span>${sub.status}</span>
        </span>
      </td>
      <td><strong>${sub.customer_name}</strong></td>
      <td>${sub.plan_name}</td>
      <td><span style="font-size:11px; color:var(--text-muted);">${sub.frequency}</span></td>
      <td>${sub.next_billing_date || '-'}</td>
      <td class="text-right"><strong>${fmtCurr(sub.grand_total)}</strong></td>
      <td class="text-right">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="stroke:var(--text-light);"><polyline points="9 18 15 12 9 6"/></svg>
      </td>
    `;

    // Clicking anywhere on row opens the Frappe Form View!
    tr.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      navigateTo("subscriptions", "form", sub.id);
    });

    tbody.appendChild(tr);
  });
}

// =============================================================================
// 5. FRAPPE FORM VIEW CONTROLLER (DocType Form)
// =============================================================================

function loadSubscriptionForm(docId) {
  const sub = state.data.subscriptions.find(s => s.id === docId);
  if (!sub) return;

  // Title & Status
  document.getElementById("form-doc-title").textContent = sub.id;
  const indDot = document.getElementById("form-doc-indicator-dot");
  const indLbl = document.getElementById("form-doc-indicator-label");
  indDot.className = `indicator-dot ${getIndicatorClass(sub.status)}`;
  indLbl.textContent = sub.status;

  // Fields
  document.getElementById("form-sub-id").value = sub.id;
  document.getElementById("form-sub-customer").value = sub.customer_name;

  // Populate plan options
  const planSelect = document.getElementById("form-sub-plan");
  planSelect.innerHTML = state.data.plans.map(p => `
    <option value="${p.id}" ${p.id === sub.plan_id ? 'selected' : ''}>${p.name} (${p.frequency})</option>
  `).join("");

  document.getElementById("form-sub-start-date").value = sub.start_date || "2026-10-31";
  document.getElementById("form-sub-expiry-date").value = sub.expiry_date || "2027-10-31";
  document.getElementById("form-sub-terms").value = sub.payment_terms || "Net 15";
  document.getElementById("form-sub-frequency").value = sub.frequency;
  document.getElementById("form-sub-next-billing").value = sub.next_billing_date || "2026-10-31";

  // Child table line items
  renderFormItemsTable(sub.items || []);

  // Totals
  updateFormTotals(sub);

  // Timeline
  renderFormTimeline(sub.timeline || []);
}

function openNewSubscriptionForm() {
  const newId = state.getNextId("SUB");
  const newDoc = {
    id: newId,
    customer_id: "CUST-" + Math.floor(100 + Math.random() * 900),
    customer_name: "",
    customer_address: "742 Evergreen Terrace",
    plan_id: "PLAN-PRO-ODOO",
    plan_name: "Professional (Odoo Powered)",
    frequency: "Monthly",
    start_date: "2026-11-01",
    expiry_date: "2027-11-01",
    next_billing_date: "2026-11-01",
    payment_terms: "Net 15",
    status: "Draft",
    items: [
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: "Brand: Odoo Compatibility Layer", quantity: 1, unit_price: 910.00, subtotal: 910.00 }
    ],
    subtotal: 910.00,
    discount_amount: 0.00,
    tax_amount: 163.80,
    grand_total: 1073.80,
    timeline: [
      { text: "Draft created", meta: "Admin Lead &bull; Just now" }
    ]
  };

  state.data.subscriptions.unshift(newDoc);
  state.save();
  navigateTo("subscriptions", "form", newId);
  showToast(`New Document ${newId} initialized in Draft state.`, "info");
}

function renderFormItemsTable(items) {
  const tbody = document.getElementById("form-items-tbody");
  tbody.innerHTML = "";

  items.forEach((it, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>
        <select class="child-prod-select" data-idx="${idx}">
          ${state.data.products.map(p => `<option value="${p.id}" ${p.id === it.product_id ? 'selected' : ''}>${p.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <select class="child-variant-select" data-idx="${idx}">
          <option value="Standard Edition">Standard Edition (+$0.00)</option>
          <option value="Brand: Odoo Compatibility Layer" ${it.variant_name && it.variant_name.includes("Odoo") ? 'selected' : ''}>Brand: Odoo Compatibility Layer (+$560.00)</option>
          <option value="Enterprise Multi-Company" ${it.variant_name && it.variant_name.includes("Multi") ? 'selected' : ''}>Enterprise Multi-Company (+$300.00)</option>
        </select>
      </td>
      <td><input type="number" class="child-qty-input" data-idx="${idx}" value="${it.quantity || 1}" min="1"></td>
      <td><input type="number" class="child-rate-input" data-idx="${idx}" value="${it.unit_price || 350.00}" readonly></td>
      <td><strong>${fmtCurr(it.subtotal)}</strong></td>
      <td>
        <button class="frappe-btn frappe-btn-subtle btn-sm" onclick="removeFormLineRow(${idx})" title="Remove Row">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach child row change listeners
  tbody.querySelectorAll(".child-variant-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const idx = e.target.dataset.idx;
      const sub = state.data.subscriptions.find(s => s.id === state.activeDocId);
      if (sub && sub.items[idx]) {
        const val = e.target.value;
        sub.items[idx].variant_name = val;
        let surcharge = 0;
        if (val.includes("Odoo")) surcharge = 560;
        if (val.includes("Multi")) surcharge = 300;
        sub.items[idx].unit_price = 350 + surcharge;
        sub.items[idx].subtotal = sub.items[idx].unit_price * sub.items[idx].quantity;
        recalculateFormDoc(sub);
      }
    });
  });

  tbody.querySelectorAll(".child-qty-input").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = e.target.dataset.idx;
      const sub = state.data.subscriptions.find(s => s.id === state.activeDocId);
      if (sub && sub.items[idx]) {
        sub.items[idx].quantity = parseInt(e.target.value) || 1;
        sub.items[idx].subtotal = sub.items[idx].unit_price * sub.items[idx].quantity;
        recalculateFormDoc(sub);
      }
    });
  });
}

function recalculateFormDoc(sub) {
  const subtotal = sub.items.reduce((sum, i) => sum + i.subtotal, 0);
  const tax = subtotal * 0.18;
  sub.subtotal = subtotal;
  sub.tax_amount = tax;
  sub.grand_total = subtotal + tax;
  state.save();
  loadSubscriptionForm(sub.id);
}

function removeFormLineRow(idx) {
  const sub = state.data.subscriptions.find(s => s.id === state.activeDocId);
  if (sub && sub.items.length > 1) {
    sub.items.splice(idx, 1);
    recalculateFormDoc(sub);
  } else {
    showToast("A subscription must contain at least one line item.", "warning");
  }
}

function updateFormTotals(sub) {
  document.getElementById("form-tot-subtotal").textContent = fmtCurr(sub.subtotal);
  document.getElementById("form-tot-discount").textContent = `-${fmtCurr(sub.discount_amount)}`;
  document.getElementById("form-tot-tax").textContent = fmtCurr(sub.tax_amount);
  document.getElementById("form-tot-grand").textContent = fmtCurr(sub.grand_total);
}

function renderFormTimeline(timeline) {
  const list = document.getElementById("form-timeline-list");
  list.innerHTML = timeline.map(t => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div><strong>${t.text}</strong></div>
        <div class="timeline-meta">${t.meta}</div>
      </div>
    </div>
  `).join("");
}

function saveSubscriptionForm() {
  const sub = state.data.subscriptions.find(s => s.id === state.activeDocId);
  if (!sub) return;

  sub.customer_name = document.getElementById("form-sub-customer").value;
  sub.start_date = document.getElementById("form-sub-start-date").value;
  sub.expiry_date = document.getElementById("form-sub-expiry-date").value;
  sub.payment_terms = document.getElementById("form-sub-terms").value;

  state.save();
  showToast(`Document ${sub.id} saved successfully.`, "success");
}

function handleFormAction(action) {
  const sub = state.data.subscriptions.find(s => s.id === state.activeDocId);
  if (!sub) return;

  if (action === "BillNow") {
    const res = FrappeEngine.runBillingDay(sub.next_billing_date);
    showToast(`Invoice generated successfully!`, "success");
    loadSubscriptionForm(sub.id);
    return;
  }

  sub.status = action;
  if (!sub.timeline) sub.timeline = [];
  sub.timeline.unshift({
    text: `Status changed to ${action}`,
    meta: `Admin Lead &bull; Just now`
  });

  state.save();
  showToast(`Document moved to ${action}!`, "success");
  navigateTo("subscriptions", "form", sub.id);
}

// =============================================================================
// 6. ANALYTICS & DASHBOARD WORKSPACE (Frappe Number Cards)
// =============================================================================

function renderAnalyticsWorkspace() {
  const startTime = performance.now();
  const activeSubs = state.data.subscriptions.filter(s => s.status === "Active");

  // MRR
  let mrr = 0.0;
  activeSubs.forEach(s => {
    if (s.frequency === "Daily") mrr += (s.grand_total * 30);
    else if (s.frequency === "Weekly") mrr += (s.grand_total * 4.33);
    else if (s.frequency === "Monthly") mrr += s.grand_total;
    else if (s.frequency === "Yearly") mrr += (s.grand_total / 12.0);
  });

  const totalCollected = state.data.payments.reduce((sum, p) => sum + p.amount, 0);
  const overdueInvoices = state.data.invoices.filter(i => i.status === "Overdue" || (new Date(i.due_date) < new Date("2026-10-31") && i.outstanding_amount > 0));
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.outstanding_amount, 0);

  // Set card numbers
  document.getElementById("kpi-frappe-mrr").textContent = fmtCurr(mrr);
  document.getElementById("kpi-frappe-active").textContent = activeSubs.length;
  document.getElementById("kpi-frappe-collections").textContent = fmtCurr(totalCollected);
  document.getElementById("kpi-frappe-overdue").textContent = fmtCurr(overdueAmount);
  document.getElementById("kpi-frappe-overdue-count").textContent = `${overdueInvoices.length} overdue invoices`;

  const elapsed = (performance.now() - startTime).toFixed(2);
  document.getElementById("kpi-perf-latency").textContent = `${elapsed} ms`;

  // Mini table
  const tbody = document.querySelector("#analytics-invoices-table tbody");
  tbody.innerHTML = state.data.invoices.slice(0, 5).map(i => `
    <tr>
      <td><strong>${i.id}</strong></td>
      <td>${i.customer_name}</td>
      <td>${fmtCurr(i.grand_total)}</td>
      <td>
        <span class="frappe-indicator">
          <span class="indicator-dot ${getIndicatorClass(i.status)}"></span>
          <span>${i.status}</span>
        </span>
      </td>
    </tr>
  `).join("");

  // Plans breakdown
  const planContainer = document.getElementById("analytics-plans-breakdown");
  planContainer.innerHTML = state.data.plans.map(p => {
    const count = activeSubs.filter(s => s.plan_id === p.id).length;
    return `
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-subtle); font-size:12px;">
        <span><strong>${p.name}</strong> <span style="color:var(--text-light);">(${p.frequency})</span></span>
        <span><strong>${count} active</strong></span>
      </div>
    `;
  }).join("");
}

// =============================================================================
// 7. INVOICES, PRODUCTS & DISCOUNTS WORKSPACES
// =============================================================================

function renderInvoicesList() {
  const tbody = document.getElementById("invoices-list-tbody");
  tbody.innerHTML = state.data.invoices.map(inv => `
    <tr>
      <td><a href="#" class="doc-link" onclick="previewInvoice('${inv.id}')">${inv.id}</a></td>
      <td>
        <span class="frappe-indicator">
          <span class="indicator-dot ${getIndicatorClass(inv.status)}"></span>
          <span>${inv.status}</span>
        </span>
      </td>
      <td>${inv.subscription_id}</td>
      <td><strong>${inv.customer_name}</strong></td>
      <td><span style="font-size:11px; color:var(--text-muted);">${inv.billing_period_start} to ${inv.billing_period_end}</span></td>
      <td>${inv.due_date}</td>
      <td><strong>${fmtCurr(inv.grand_total)}</strong></td>
      <td style="color:${inv.outstanding_amount > 0 ? '#EF4444' : '#10B981'}; font-weight:700;">${fmtCurr(inv.outstanding_amount)}</td>
      <td class="text-right">
        <button class="frappe-btn frappe-btn-subtle btn-sm" onclick="previewInvoice('${inv.id}')">View / Print</button>
      </td>
    </tr>
  `).join("");
}

function renderProductsWorkspace() {
  const container = document.getElementById("plans-container");
  container.innerHTML = state.data.plans.map(p => `
    <div class="frappe-plan-card ${p.id === 'PLAN-PRO-ODOO' ? 'featured' : ''}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:15px;">${p.name}</h3>
        ${p.id === 'PLAN-PRO-ODOO' ? '<span class="frappe-pill-badge blue">Odoo Stack</span>' : ''}
      </div>
      <div style="font-size:22px; font-weight:700; color:var(--frappe-blue);">${fmtCurr(p.base_price)} <span style="font-size:12px; font-weight:400; color:var(--text-muted);">/ ${p.frequency.toLowerCase()}</span></div>
      <div style="font-size:12px; color:var(--text-muted);">
        &bull; Min Quantity: <strong>${p.minimum_quantity} license(s)</strong><br>
        &bull; Auto-close on expiry: <strong>${p.auto_close_on_end ? 'Yes' : 'No'}</strong><br>
        &bull; Customer Pause: <strong>${p.allow_pause ? 'Allowed' : 'Disabled'}</strong><br>
        &bull; Early Close: <strong>${p.allow_early_close ? 'Allowed' : 'Locked contract'}</strong>
      </div>
      <button class="frappe-btn frappe-btn-subtle btn-sm" style="margin-top:auto;" onclick="quickCreateWithPlan('${p.id}')">Create Quote With Plan</button>
    </div>
  `).join("");

  const prodTbody = document.getElementById("products-matrix-tbody");
  prodTbody.innerHTML = state.data.products.map(pr => `
    <tr>
      <td><strong>${pr.name}</strong><br><span style="font-size:11px; color:var(--text-light);">${pr.notes}</span></td>
      <td>${pr.type}</td>
      <td>${fmtCurr(pr.cost_price)}</td>
      <td><strong>${fmtCurr(pr.sales_price)}</strong></td>
      <td>
        ${pr.variants.length > 0 ? pr.variants.map(v => `<span class="frappe-pill-badge" style="margin-right:4px;">${v.name}: <strong>+${fmtCurr(v.price_surcharge)}</strong></span>`).join("") : '<span style="color:var(--text-light);">No variant</span>'}
      </td>
    </tr>
  `).join("");
}

function renderDiscountsWorkspace() {
  const container = document.getElementById("discounts-cards-container");
  container.innerHTML = state.data.discount_rules.map(d => `
    <div class="frappe-box">
      <div class="frappe-box-header">
        <h4>${d.name}</h4>
        <span class="frappe-pill-badge green">${d.discount_type === 'Percentage' ? d.value + '%' : '$' + d.value} OFF</span>
      </div>
      <div style="font-size:12px; color:var(--text-regular); display:flex; flex-direction:column; gap:6px;">
        <div>Scope: <strong>${d.scope}</strong></div>
        <div>Active Window: <strong>${d.start_date} to ${d.end_date}</strong></div>
        <div>Usage Limit: <strong>${d.current_usage_count}</strong> of ${d.max_usage_limit > 0 ? d.max_usage_limit : '∞'} used</div>
        <div>Min Purchase: <strong>${fmtCurr(d.min_purchase_amount)}</strong></div>
      </div>
    </div>
  `).join("");
}

function renderCustomerPortalWorkspace() {
  const mySubs = state.data.subscriptions.filter(s => s.customer_name.toLowerCase().includes("brooklyn"));
  const myInvs = state.data.invoices.filter(i => i.customer_name.toLowerCase().includes("brooklyn"));

  const subsBox = document.getElementById("portal-subs-container");
  subsBox.innerHTML = mySubs.map(s => `
    <div style="background:#F8F9FA; border:1px solid var(--border-color); border-radius:6px; padding:12px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <strong>${s.plan_name} (${s.id})</strong>
        <span class="frappe-indicator"><span class="indicator-dot ${getIndicatorClass(s.status)}"></span>${s.status}</span>
      </div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">
        Next Billing: <strong>${s.next_billing_date}</strong> &bull; Amount: <strong>${fmtCurr(s.grand_total)} / ${s.frequency}</strong>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="frappe-btn frappe-btn-subtle btn-sm" onclick="portalTogglePause('${s.id}')">${s.status === 'Active' ? 'Pause Plan' : 'Resume Plan'}</button>
        <button class="frappe-btn frappe-btn-subtle btn-sm" onclick="portalCancelPlan('${s.id}')">Cancel Plan</button>
      </div>
    </div>
  `).join("");

  const invsBox = document.getElementById("portal-invs-container");
  invsBox.innerHTML = myInvs.map(i => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#F8F9FA; border-radius:6px; margin-bottom:8px;">
      <div>
        <strong>${i.id}</strong> &bull; <span style="font-size:11px; color:var(--text-muted);">${i.invoice_date}</span>
        <div style="font-size:11px; color:${i.outstanding_amount > 0 ? '#EF4444' : '#10B981'}; font-weight:600;">
          ${i.outstanding_amount > 0 ? 'Balance: ' + fmtCurr(i.outstanding_amount) : 'Paid in Full'}
        </div>
      </div>
      <button class="frappe-btn frappe-btn-subtle btn-sm" onclick="previewInvoice('${i.id}')">Download PDF</button>
    </div>
  `).join("");
}

function portalTogglePause(subId) {
  const sub = state.data.subscriptions.find(s => s.id === subId);
  if (!sub) return;
  sub.status = sub.status === "Active" ? "Paused" : "Active";
  state.save();
  showToast(`Subscription ${sub.id} is now ${sub.status}`, "success");
  renderCustomerPortalWorkspace();
}

function portalCancelPlan(subId) {
  if (confirm("Are you sure you want to cancel this plan?")) {
    const sub = state.data.subscriptions.find(s => s.id === subId);
    if (!sub) return;
    sub.status = "Closed";
    state.save();
    showToast(`Subscription ${sub.id} has been closed.`, "info");
    renderCustomerPortalWorkspace();
  }
}

// Quick Create from Plan
function quickCreateWithPlan(planId) {
  const newId = state.getNextId("SUB");
  const plan = state.data.plans.find(p => p.id === planId);
  const isOdoo = planId === "PLAN-PRO-ODOO";
  const unitPrice = 350 + (isOdoo ? 560 : 0);

  const newDoc = {
    id: newId,
    customer_id: "CUST-" + Math.floor(100 + Math.random() * 900),
    customer_name: "Brightloop Client",
    plan_id: planId,
    plan_name: plan.name,
    frequency: plan.frequency,
    start_date: "2026-11-01",
    expiry_date: "2027-11-01",
    next_billing_date: "2026-11-01",
    payment_terms: "Net 15",
    status: "Quotation",
    items: [
      { product_id: "PROD-01", product_name: "Brightloop Core ERP", variant_name: isOdoo ? "Brand: Odoo Compatibility Layer" : "Standard Edition", quantity: 1, unit_price: unitPrice, subtotal: unitPrice }
    ],
    subtotal: unitPrice,
    discount_amount: 0.00,
    tax_amount: unitPrice * 0.18,
    grand_total: unitPrice * 1.18,
    timeline: [{ text: `Quote initialized with ${plan.name}`, meta: "Sales Staff &bull; Just now" }]
  };

  state.data.subscriptions.unshift(newDoc);
  state.save();
  navigateTo("subscriptions", "form", newId);
}

// Invoice Printable Preview
function previewInvoice(invId) {
  const inv = state.data.invoices.find(i => i.id === invId);
  if (!inv) return;

  const container = document.getElementById("invoice-preview-container");
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; border-bottom:2px solid #1F272E; padding-bottom:14px; margin-bottom:18px;">
      <div>
        <h2 style="font-size:18px; color:#1F272E;">Brightloop Software Inc.</h2>
        <div style="font-size:11px; color:#64748B;">742 Evergreen Terrace, Suite 400 &bull; billing@brightloop.io</div>
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:20px; font-weight:800;">TAX INVOICE</h1>
        <div style="font-size:13px; font-weight:700; color:#2490EF;">${inv.id}</div>
        <div style="font-size:11px; color:#64748B;">Date: ${inv.invoice_date}</div>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:12px;">
      <div>
        <span style="font-size:10px; text-transform:uppercase; color:#94A3B8; font-weight:700;">CUSTOMER:</span>
        <h3 style="font-size:14px; margin-top:2px;">${inv.customer_name}</h3>
        <div style="color:#64748B;">Linked Subscription: <strong>${inv.subscription_id}</strong><br>Period: ${inv.billing_period_start} to ${inv.billing_period_end}</div>
      </div>
      <div style="text-align:right;">
        <span style="font-size:10px; text-transform:uppercase; color:#94A3B8; font-weight:700;">PAYMENT STATUS:</span>
        <div style="margin-top:2px;"><span class="frappe-indicator"><span class="indicator-dot ${getIndicatorClass(inv.status)}"></span><strong>${inv.status}</strong></span></div>
        <div style="color:#64748B; margin-top:4px;">Due Date: <strong>${inv.due_date}</strong></div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px;">
      <thead>
        <tr style="background:#F8F9FA; border-bottom:1px solid #E2E8F0;">
          <th style="padding:8px; text-align:left;">Item</th>
          <th style="padding:8px; text-align:center;">Qty</th>
          <th style="padding:8px; text-align:right;">Rate</th>
          <th style="padding:8px; text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${inv.items.map(it => `
          <tr style="border-bottom:1px solid #EDF2F7;">
            <td style="padding:10px 8px;">${it.product_name}</td>
            <td style="padding:10px 8px; text-align:center;">${it.quantity}</td>
            <td style="padding:10px 8px; text-align:right;">${fmtCurr(it.unit_price)}</td>
            <td style="padding:10px 8px; text-align:right; font-weight:600;">${fmtCurr(it.amount)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div style="display:flex; justify-content:flex-end;">
      <div style="width:280px; display:flex; flex-direction:column; gap:6px; font-size:12px;">
        <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <strong>${fmtCurr(inv.subtotal)}</strong></div>
        <div style="display:flex; justify-content:space-between; color:#D97706;"><span>Discount:</span> <strong>-${fmtCurr(inv.discount_amount)}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>VAT (18%):</span> <strong>${fmtCurr(inv.tax_total)}</strong></div>
        <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; border-top:1px solid #CBD5E1; padding-top:6px;"><span>Grand Total:</span> <strong>${fmtCurr(inv.grand_total)}</strong></div>
        <div style="display:flex; justify-content:space-between; color:#10B981;"><span>Paid:</span> <strong>${fmtCurr(inv.paid_amount)}</strong></div>
        <div style="display:flex; justify-content:space-between; font-weight:700; color:${inv.outstanding_amount > 0 ? '#EF4444' : '#10B981'};"><span>Balance Due:</span> <strong>${fmtCurr(inv.outstanding_amount)}</strong></div>
      </div>
    </div>
  `;

  document.getElementById("modal-invoice-preview").classList.add("open");
}

// =============================================================================
// 8. AWESOME-BAR COMMAND PALETTE (CTRL + K)
// =============================================================================

function setupAwesomebar() {
  const modal = document.getElementById("awesomebar-modal");
  const input = document.getElementById("awesomebar-input");
  const results = document.getElementById("awesomebar-results");
  const trigger = document.getElementById("awesomebar-trigger");

  const openAwesomebar = () => {
    modal.classList.add("open");
    input.value = "";
    input.focus();
    renderAwesomeResults("");
  };

  const closeAwesomebar = () => {
    modal.classList.remove("open");
  };

  trigger.addEventListener("click", openAwesomebar);

  // Keyboard shortcut Ctrl + K / Cmd + K
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      modal.classList.contains("open") ? closeAwesomebar() : openAwesomebar();
    }
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeAwesomebar();
    }
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAwesomebar();
  });

  input.addEventListener("input", (e) => {
    renderAwesomeResults(e.target.value);
  });

  function renderAwesomeResults(query) {
    const q = query.toLowerCase().trim();
    const actions = [
      { label: "New Customer Subscription", category: "Action", run: () => openNewSubscriptionForm() },
      { label: "Run Billing Day Cron", category: "Cron Scheduler", run: () => triggerBillingCron() },
      { label: "Go to Subscriptions List", category: "Workspace", run: () => navigateTo("subscriptions", "list") },
      { label: "Go to Finance Analytics", category: "Workspace", run: () => navigateTo("analytics") },
      { label: "Go to Subscription Invoices", category: "Workspace", run: () => navigateTo("billing") },
      { label: "Go to Products & Plans", category: "Workspace", run: () => navigateTo("products") },
      { label: "Go to Discount Rules", category: "Workspace", run: () => navigateTo("discounts") },
      { label: "Go to Customer Portal", category: "Portal", run: () => navigateTo("portal") },
      { label: "Record Payment Entry", category: "Action", run: () => openPaymentDialog() }
    ];

    // Also match documents
    state.data.subscriptions.forEach(s => {
      actions.push({
        label: `${s.id} - ${s.customer_name} (${s.plan_name})`,
        category: "Subscription Doc",
        run: () => navigateTo("subscriptions", "form", s.id)
      });
    });

    const filtered = actions.filter(a => a.label.toLowerCase().includes(q));

    results.innerHTML = filtered.map(item => `
      <div class="awesome-item" data-action="${item.label}">
        <div class="awesome-item-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
          <span>${item.label}</span>
        </div>
        <span class="frappe-pill-badge">${item.category}</span>
      </div>
    `).join("");

    results.querySelectorAll(".awesome-item").forEach((el, idx) => {
      el.addEventListener("click", () => {
        closeAwesomebar();
        filtered[idx].run();
      });
    });
  }
}

// =============================================================================
// 9. EVENT LISTENERS & INITIALIZATION
// =============================================================================

function triggerBillingCron() {
  const res = FrappeEngine.runBillingDay("2026-10-31");
  if (res.count > 0) {
    showToast(`Billing Day Success: Generated ${res.count} invoices in ${res.latency} ms!`, "success");
  } else {
    showToast(`Idempotency Verified: 0 new invoices (all periods up to date, zero double-billing).`, "info");
  }
  if (state.currentWorkspace === "subscriptions") renderSubscriptionList();
  if (state.currentWorkspace === "billing") renderInvoicesList();
  if (state.currentWorkspace === "analytics") renderAnalyticsWorkspace();
}

function openPaymentDialog() {
  const sel = document.getElementById("dlg-pay-invoice");
  const unpaid = state.data.invoices.filter(i => i.outstanding_amount > 0);
  if (unpaid.length === 0) {
    showToast("All invoices are already paid in full!", "info");
    return;
  }

  sel.innerHTML = unpaid.map(i => `<option value="${i.id}">${i.id} - ${i.customer_name} (Due: ${fmtCurr(i.outstanding_amount)})</option>`).join("");
  document.getElementById("dlg-pay-amount").value = unpaid[0].outstanding_amount;
  document.getElementById("modal-payment-dialog").classList.add("open");
}

document.addEventListener("DOMContentLoaded", () => {
  // Sidebar navigation
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => navigateTo(item.dataset.workspace));
  });

  // Home Brand Link
  document.getElementById("brand-home-link").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("subscriptions", "list");
  });

  // Awesomebar
  setupAwesomebar();

  // Billing Day Buttons
  document.getElementById("nav-btn-billing-day").addEventListener("click", triggerBillingCron);
  document.getElementById("btn-analytics-bill-now").addEventListener("click", triggerBillingCron);

  // Reset Demo DB
  document.getElementById("btn-reset-db").addEventListener("click", () => {
    if (confirm("Reset Brightloop Frappe database to clean demo state?")) {
      state.reset();
      showToast("Frappe database restored to default seed state.", "success");
      navigateTo(state.currentWorkspace);
    }
  });

  // Modal Closers
  document.querySelectorAll("[data-modal-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.modalClose).classList.remove("open");
    });
  });

  // Role Switcher
  document.getElementById("frappe-role-select").addEventListener("change", (e) => {
    state.currentRole = e.target.value;
    const navAvatar = document.getElementById("nav-avatar");
    if (state.currentRole === "Admin") {
      navAvatar.textContent = "SM";
      showToast("Role: System Manager (Full Admin Privileges)", "info");
    } else if (state.currentRole === "Staff") {
      navAvatar.textContent = "SJ";
      showToast("Role: Sales & Billing Staff", "info");
    } else if (state.currentRole === "Customer") {
      navAvatar.textContent = "BZ";
      showToast("Role: Customer Portal (Brooklyn Zoe - Isolated)", "info");
      navigateTo("portal");
    }
    if (state.currentWorkspace === "subscriptions") renderSubscriptionList();
  });

  // Payment Form submit
  document.getElementById("frappe-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const invId = document.getElementById("dlg-pay-invoice").value;
    const amount = document.getElementById("dlg-pay-amount").value;
    const mode = document.getElementById("dlg-pay-mode").value;
    const note = document.getElementById("dlg-pay-note").value;

    const res = FrappeEngine.recordPayment(invId, amount, mode, note);
    if (res.error) {
      showToast(res.error, "warning");
      return;
    }

    document.getElementById("modal-payment-dialog").classList.remove("open");
    showToast(`Payment ${res.payment.id} reconciled against ${invId}!`, "success");
    if (state.currentWorkspace === "billing") renderInvoicesList();
    if (state.currentWorkspace === "analytics") renderAnalyticsWorkspace();
    if (state.currentWorkspace === "subscriptions") renderSubscriptionList();
  });

  // Open Payment Dialog
  document.getElementById("btn-quick-record-payment").addEventListener("click", openPaymentDialog);

  // New Discount Rule
  document.getElementById("btn-create-discount").addEventListener("click", () => {
    if (state.currentRole !== "Admin") {
      showToast("Permission Denied: Only System Manager can create Discount Rules.", "warning");
      return;
    }
    document.getElementById("dlg-disc-start").value = "2026-11-01";
    document.getElementById("dlg-disc-end").value = "2026-12-31";
    document.getElementById("modal-discount-dialog").classList.add("open");
  });

  document.getElementById("frappe-discount-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const newRule = {
      id: "DISC-" + String(state.data.discount_rules.length + 1).padStart(2, "0"),
      name: document.getElementById("dlg-disc-name").value,
      discount_type: document.getElementById("dlg-disc-type").value,
      value: parseFloat(document.getElementById("dlg-disc-val").value),
      scope: document.getElementById("dlg-disc-scope").value,
      min_purchase_amount: parseFloat(document.getElementById("dlg-disc-min").value) || 0,
      min_quantity: 1,
      start_date: document.getElementById("dlg-disc-start").value,
      end_date: document.getElementById("dlg-disc-end").value,
      max_usage_limit: parseInt(document.getElementById("dlg-disc-limit").value) || 0,
      current_usage_count: 0,
      applicable_product_ids: ["PROD-01"]
    };

    state.data.discount_rules.unshift(newRule);
    state.save();
    document.getElementById("modal-discount-dialog").classList.remove("open");
    showToast(`Discount Rule '${newRule.name}' created!`, "success");
    renderDiscountsWorkspace();
  });

  // Filter listeners
  document.getElementById("filter-sub-status").addEventListener("change", renderSubscriptionList);
  document.getElementById("filter-sub-plan").addEventListener("change", renderSubscriptionList);
  document.getElementById("sub-list-search").addEventListener("input", renderSubscriptionList);
  document.getElementById("btn-refresh-list").addEventListener("click", renderSubscriptionList);

  // Form tab switching
  document.querySelectorAll(".form-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".form-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".form-tab-pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-pane-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // Child table + Add Row
  document.getElementById("btn-add-line-row").addEventListener("click", () => {
    const sub = state.data.subscriptions.find(s => s.id === state.activeDocId);
    if (sub) {
      sub.items.push({
        product_id: "PROD-02",
        product_name: "Advanced Analytics & BI Add-on",
        variant_name: "",
        quantity: 1,
        unit_price: 120.00,
        subtotal: 120.00
      });
      recalculateFormDoc(sub);
    }
  });

  // Link to invoices from dashboard
  document.getElementById("link-goto-invoices").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("billing");
  });

  // Initialize on Subscriptions List View
  navigateTo("subscriptions", "list");
});
