import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const customerName = searchParams.get("customerName");
    const subscriptionId = searchParams.get("subscriptionId");
    const status = searchParams.get("status");

    const db = getDatabase();
    let invoices = db.invoices;

    if (customerId) {
      invoices = invoices.filter((i) => i.customer_id === customerId);
    } else if (customerName) {
      invoices = invoices.filter((i) =>
        i.customer_name.toLowerCase().includes(customerName.toLowerCase())
      );
    }

    if (subscriptionId) {
      invoices = invoices.filter((i) => i.subscription_id === subscriptionId);
    }

    if (status && status !== "all") {
      invoices = invoices.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({
      invoices,
      totalCount: invoices.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
