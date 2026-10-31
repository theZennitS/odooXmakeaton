import { BrightloopState, Subscription, Invoice, Payment, DiscountRule } from "@/types";
import { fmtCurr } from "./utils";

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function addPeriod(dateStr: string, freq: string): string {
  const d = new Date(dateStr);
  if (freq === "Daily") d.setDate(d.getDate() + 1);
  else if (freq === "Weekly") d.setDate(d.getDate() + 7);
  else if (freq === "Monthly") d.setMonth(d.getMonth() + 1);
  else if (freq === "Yearly") d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

export function evaluateDiscount(sub: Subscription, rules: DiscountRule[], todayStr: string): { totalDiscount: number; updatedRules: DiscountRule[] } {
  let totalDisc = 0.0;
  const today = new Date(todayStr);
  const updatedRules = rules.map(rule => ({ ...rule }));

  updatedRules.forEach(rule => {
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
    if (applied) {
      rule.current_usage_count++;
    }
  });

  return {
    totalDiscount: Math.min(totalDisc, sub.subtotal),
    updatedRules
  };
}

export function runBillingDay(
  state: BrightloopState,
  todayStr: string = "2026-10-31"
): {
  count: number;
  latency: string;
  generated: Invoice[];
  newState: BrightloopState;
} {
  const startTime = performance.now();
  const today = new Date(todayStr);
  const generated: Invoice[] = [];

  const newState: BrightloopState = {
    ...state,
    subscriptions: state.subscriptions.map(s => ({ ...s, items: [...s.items], timeline: [...(s.timeline || [])] })),
    invoices: [...state.invoices],
    discount_rules: [...state.discount_rules],
    counters: { ...state.counters }
  };

  newState.subscriptions.forEach(sub => {
    if (sub.status !== "Active") return;
    const nextDue = new Date(sub.next_billing_date);
    if (nextDue > today) return;

    const periodStart = sub.next_billing_date;
    const periodEnd = addPeriod(periodStart, sub.frequency);

    // STRICT IDEMPOTENCY GUARD:
    // Check if an invoice for this exact subscription and billing period already exists
    const alreadyBilled = newState.invoices.some(
      inv => inv.subscription_id === sub.id &&
             inv.billing_period_start === periodStart &&
             inv.status !== "Cancelled"
    );
    if (alreadyBilled) return;

    // Evaluate discounts
    const { totalDiscount, updatedRules } = evaluateDiscount(sub, newState.discount_rules, todayStr);
    newState.discount_rules = updatedRules;

    const subtotal = sub.subtotal;
    const tax = ((subtotal - totalDiscount) * 18.0) / 100.0;
    const grand = (subtotal - totalDiscount) + tax;

    const invCounter = newState.counters.INV || 1;
    const invId = `INV-2026-${String(invCounter).padStart(5, "0")}`;
    newState.counters.INV = invCounter + 1;

    const inv: Invoice = {
      id: invId,
      subscription_id: sub.id,
      customer_id: sub.customer_id,
      customer_name: sub.customer_name,
      invoice_date: todayStr,
      due_date: addDays(todayStr, 15),
      billing_period_start: periodStart,
      billing_period_end: periodEnd,
      subtotal: subtotal,
      discount_amount: totalDiscount,
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

    newState.invoices.unshift(inv);
    generated.push(inv);

    // Advance subscription
    sub.next_billing_date = periodEnd;
    if (!sub.timeline) sub.timeline = [];
    sub.timeline.unshift({
      text: `Automated Invoice ${inv.id} generated (${fmtCurr(grand)})`,
      meta: `Scheduled Cron • Just now`
    });
  });

  const elapsed = (performance.now() - startTime).toFixed(2);
  return {
    count: generated.length,
    latency: elapsed,
    generated,
    newState
  };
}

export function recordPayment(
  state: BrightloopState,
  invId: string,
  amount: number,
  method: string,
  note: string,
  dateStr: string = "2026-10-31"
): { success: boolean; error?: string; newState?: BrightloopState; payment?: Payment } {
  const inv = state.invoices.find(i => i.id === invId);
  if (!inv) return { success: false, error: "Invoice not found" };

  if (isNaN(amount) || amount <= 0) return { success: false, error: "Invalid payment amount" };
  if (amount > (inv.outstanding_amount + 0.01)) {
    return { success: false, error: `Payment exceeds outstanding balance of ${fmtCurr(inv.outstanding_amount)}` };
  }

  const payCounter = state.counters.PAY || 1;
  const payId = `PAY-2026-${String(payCounter).padStart(5, "0")}`;

  const payment: Payment = {
    id: payId,
    invoice_id: inv.id,
    customer_name: inv.customer_name,
    amount: amount,
    payment_method: method,
    payment_date: dateStr,
    note: note || `Payment entry via ${method}`
  };

  const updatedInvoices = state.invoices.map(i => {
    if (i.id !== invId) return i;
    const newPaid = i.paid_amount + amount;
    const newOutstanding = Math.max(0.00, Math.round((i.grand_total - newPaid) * 100) / 100);
    return {
      ...i,
      paid_amount: newPaid,
      outstanding_amount: newOutstanding,
      status: (newOutstanding <= 0.005 ? "Paid" : "Confirmed") as any
    };
  });

  const updatedSubs = state.subscriptions.map(s => {
    if (s.id !== inv.subscription_id) return s;
    return {
      ...s,
      timeline: [
        {
          text: `Payment ${payment.id} received (${fmtCurr(amount)}) for ${inv.id}`,
          meta: `Finance Desk • Just now`
        },
        ...(s.timeline || [])
      ]
    };
  });

  const newState: BrightloopState = {
    ...state,
    invoices: updatedInvoices,
    subscriptions: updatedSubs,
    payments: [payment, ...state.payments],
    counters: {
      ...state.counters,
      PAY: payCounter + 1
    }
  };

  return { success: true, newState, payment };
}
