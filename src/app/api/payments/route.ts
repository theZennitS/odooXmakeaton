import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";
import { Payment } from "@/types";
import { fmtCurr } from "@/lib/utils";

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      payments: db.payments,
      totalCount: db.payments.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { invoice_id, amount, payment_method, note, actorName } = await request.json();

    if (!invoice_id || !amount) {
      return NextResponse.json({ error: "Invoice ID and amount are required" }, { status: 400 });
    }

    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const db = getDatabase();
    const inv = db.invoices.find((i) => i.id === invoice_id);

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (payAmt > inv.outstanding_amount + 0.01) {
      return NextResponse.json(
        { error: `Payment exceeds invoice outstanding balance of ${fmtCurr(inv.outstanding_amount)}` },
        { status: 400 }
      );
    }

    const payNum = db.counters.PAY || 1;
    const payId = `PAY-2026-${String(payNum).padStart(5, "0")}`;
    db.counters.PAY = payNum + 1;

    const payment: Payment = {
      id: payId,
      invoice_id: inv.id,
      customer_name: inv.customer_name,
      amount: payAmt,
      payment_method: payment_method || "Credit Card",
      payment_date: new Date().toISOString().split("T")[0],
      note: note || `Payment entry via ${payment_method || "Credit Card"}`,
    };

    inv.paid_amount = Math.round((inv.paid_amount + payAmt) * 100) / 100;
    inv.outstanding_amount = Math.max(0.0, Math.round((inv.grand_total - inv.paid_amount) * 100) / 100);
    inv.status = inv.outstanding_amount <= 0.005 ? "Paid" : "Confirmed";

    db.payments.unshift(payment);

    // Update parent subscription timeline
    const sub = db.subscriptions.find((s) => s.id === inv.subscription_id);
    if (sub) {
      if (!sub.timeline) sub.timeline = [];
      sub.timeline.unshift({
        text: `Payment ${payment.id} received (${fmtCurr(payAmt)}) for invoice ${inv.id}`,
        meta: `${actorName || inv.customer_name} • Just now`,
      });
    }

    saveDatabase(db);

    recordAudit(
      actorName || inv.customer_name,
      "Payment",
      payment.id,
      "Success",
      `Reconciled ${fmtCurr(payAmt)} against ${inv.id} via ${payment.payment_method}. Remaining balance: ${fmtCurr(inv.outstanding_amount)}`
    );

    return NextResponse.json({
      success: true,
      payment,
      invoice: inv,
      message: `Payment ${payment.id} reconciled against ${inv.id}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
