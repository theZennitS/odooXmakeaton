import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";
import { Subscription, SubscriptionItem, Invoice } from "@/types";
import { fmtCurr } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const customerName = searchParams.get("customerName");
    const status = searchParams.get("status");

    const db = getDatabase();
    let subs = db.subscriptions;

    if (customerId) {
      subs = subs.filter((s) => s.customer_id === customerId);
    } else if (customerName) {
      subs = subs.filter((s) => s.customer_name.toLowerCase().includes(customerName.toLowerCase()));
    }

    if (status && status !== "all") {
      subs = subs.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({
      subscriptions: subs,
      totalCount: subs.length,
      plans: db.plans,
      products: db.products,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_address,
      plan_id,
      items,
      payment_terms,
      start_date,
      expiry_date,
      status,
    } = body;

    if (!customer_name || !plan_id) {
      return NextResponse.json({ error: "Customer name and plan are required" }, { status: 400 });
    }

    const db = getDatabase();
    const plan = db.plans.find((p) => p.id === plan_id) || db.plans[0];

    const subNum = db.counters.SUB || 1;
    const subId = `SUB-2026-${String(subNum).padStart(5, "0")}`;
    db.counters.SUB = subNum + 1;

    // Calculate line items and variant surcharges
    let calculatedItems: SubscriptionItem[] = [];
    if (items && Array.isArray(items) && items.length > 0) {
      calculatedItems = items.map((it: any) => {
        let surcharge = 0;
        if (it.variant_name && it.variant_name.includes("Odoo")) surcharge = 560;
        if (it.variant_name && it.variant_name.includes("Multi")) surcharge = 300;
        const unitPrice = (it.base_price || 350) + surcharge;
        const qty = it.quantity || 1;
        return {
          product_id: it.product_id || "PROD-01",
          product_name: it.product_name || "Brightloop Core ERP",
          variant_name: it.variant_name || "Standard Edition",
          quantity: qty,
          unit_price: unitPrice,
          subtotal: unitPrice * qty,
        };
      });
    } else {
      const isOdoo = plan.id === "PLAN-PRO-ODOO";
      const unitPrice = 350 + (isOdoo ? 560 : 0);
      calculatedItems = [
        {
          product_id: "PROD-01",
          product_name: "Brightloop Core ERP",
          variant_name: isOdoo ? "Brand: Odoo Compatibility Layer" : "Standard Edition",
          quantity: 1,
          unit_price: unitPrice,
          subtotal: unitPrice,
        },
      ];
    }

    const subtotal = calculatedItems.reduce((acc, i) => acc + i.subtotal, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const grandTotal = Math.round((subtotal + tax) * 100) / 100;

    const startDateStr = start_date || new Date().toISOString().split("T")[0];
    const expiryDateStr = expiry_date || "2027-11-01";
    const subStatus = status || "Active";

    const newSub: Subscription = {
      id: subId,
      customer_id: customer_id || `CUST-${Math.floor(100 + Math.random() * 900)}`,
      customer_name,
      customer_address: customer_address || "742 Evergreen Terrace, Suite 100",
      plan_id: plan.id,
      plan_name: plan.name,
      frequency: plan.frequency,
      start_date: startDateStr,
      expiry_date: expiryDateStr,
      next_billing_date: startDateStr,
      payment_terms: payment_terms || "Net 15",
      status: subStatus,
      items: calculatedItems,
      subtotal,
      discount_amount: 0.0,
      tax_amount: tax,
      grand_total: grandTotal,
      timeline: [
        {
          text: `Subscription ${subId} created with plan ${plan.name} (${fmtCurr(grandTotal)})`,
          meta: `${customer_name} • Just now`,
        },
      ],
    };

    db.subscriptions.unshift(newSub);

    // If active immediately, generate first tax invoice
    if (subStatus === "Active") {
      const invNum = db.counters.INV || 1;
      const invId = `INV-2026-${String(invNum).padStart(5, "0")}`;
      db.counters.INV = invNum + 1;

      const invoice: Invoice = {
        id: invId,
        subscription_id: subId,
        customer_id: newSub.customer_id,
        customer_name: newSub.customer_name,
        invoice_date: startDateStr,
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        billing_period_start: startDateStr,
        billing_period_end: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        subtotal,
        discount_amount: 0.0,
        tax_total: tax,
        grand_total: grandTotal,
        paid_amount: 0.0,
        outstanding_amount: grandTotal,
        status: "Confirmed",
        items: calculatedItems.map((i) => ({
          product_name: `${i.product_name} (${i.variant_name})`,
          quantity: i.quantity,
          unit_price: i.unit_price,
          amount: i.subtotal,
        })),
      };
      db.invoices.unshift(invoice);

      recordAudit(
        customer_name,
        "Invoice Gen",
        invId,
        "Success",
        `Initial contract invoice of ${fmtCurr(grandTotal)} generated for subscription ${subId}`
      );
    }

    saveDatabase(db);

    recordAudit(
      customer_name,
      "Status Change",
      subId,
      "Success",
      `New subscription initialized with plan ${plan.name} (${fmtCurr(grandTotal)})`
    );

    return NextResponse.json({
      success: true,
      subscription: newSub,
      message: `Subscription ${subId} successfully created.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
