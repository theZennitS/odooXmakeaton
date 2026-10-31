import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";
import { addDays, addPeriod, evaluateDiscount } from "@/lib/engine";
import { Invoice } from "@/types";
import { fmtCurr } from "@/lib/utils";

export async function POST(request: Request) {
  const startTime = performance.now();
  try {
    let todayStr = new Date().toISOString().split("T")[0];
    try {
      const body = await request.json();
      if (body.date) todayStr = body.date;
    } catch {
      // no body, use today
    }

    const today = new Date(todayStr);
    const db = getDatabase();
    const generated: Invoice[] = [];

    db.subscriptions.forEach((sub) => {
      if (sub.status !== "Active") return;
      const nextDue = new Date(sub.next_billing_date);
      if (nextDue > today) return;

      const periodStart = sub.next_billing_date;
      const periodEnd = addPeriod(periodStart, sub.frequency);

      // Strict Idempotency Lock:
      const alreadyBilled = db.invoices.some(
        (inv) =>
          inv.subscription_id === sub.id &&
          inv.billing_period_start === periodStart &&
          inv.status !== "Cancelled"
      );
      if (alreadyBilled) return;

      // Evaluate discounts
      const { totalDiscount, updatedRules } = evaluateDiscount(
        sub,
        db.discount_rules,
        todayStr
      );
      db.discount_rules = updatedRules;

      const subtotal = sub.subtotal;
      const tax = Math.round(((subtotal - totalDiscount) * 18.0) / 100.0 * 100) / 100;
      const grand = Math.round((subtotal - totalDiscount + tax) * 100) / 100;

      const invNum = db.counters.INV || 1;
      const invId = `INV-2026-${String(invNum).padStart(5, "0")}`;
      db.counters.INV = invNum + 1;

      const inv: Invoice = {
        id: invId,
        subscription_id: sub.id,
        customer_id: sub.customer_id,
        customer_name: sub.customer_name,
        invoice_date: todayStr,
        due_date: addDays(todayStr, 15),
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        subtotal,
        discount_amount: totalDiscount,
        tax_total: tax,
        grand_total: grand,
        paid_amount: 0.0,
        outstanding_amount: grand,
        status: "Confirmed",
        items: sub.items.map((it) => ({
          product_name: `${it.product_name} ${it.variant_name ? "(" + it.variant_name + ")" : ""}`,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: it.subtotal,
        })),
      };

      db.invoices.unshift(inv);
      generated.push(inv);

      // Advance subscription
      sub.next_billing_date = periodEnd;
      if (!sub.timeline) sub.timeline = [];
      sub.timeline.unshift({
        text: `Automated Invoice ${inv.id} generated (${fmtCurr(grand)})`,
        meta: `Scheduled Cron • Just now`,
      });

      recordAudit(
        "Cron Scheduler (hooks.py)",
        "Invoice Gen",
        inv.id,
        "Success",
        `Recurring cycle invoice generated for ${sub.customer_name} (${fmtCurr(grand)})`
      );
    });

    saveDatabase(db);
    const latency = (performance.now() - startTime).toFixed(2);

    return NextResponse.json({
      success: true,
      count: generated.length,
      latencyMs: latency,
      generatedInvoices: generated,
      message:
        generated.length > 0
          ? `Billing Day generated ${generated.length} invoice(s) in ${latency} ms.`
          : `Idempotency Verified: 0 new invoices (all cycles up to date, zero double-billing).`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
