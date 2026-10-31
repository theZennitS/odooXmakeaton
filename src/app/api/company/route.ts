import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";
import { SubsidiaryEntity } from "@/types/company";

export async function GET() {
  try {
    const db = getDatabase();

    // Calculate real-time financials reflecting actual user actions!
    const activeSubs = db.subscriptions.filter((s) => s.status === "Active");
    let mrr = 0.0;
    activeSubs.forEach((s) => {
      if (s.frequency === "Daily") mrr += s.grand_total * 30;
      else if (s.frequency === "Weekly") mrr += s.grand_total * 4.33;
      else if (s.frequency === "Monthly") mrr += s.grand_total;
      else if (s.frequency === "Yearly") mrr += s.grand_total / 12.0;
    });

    const totalCollected = db.payments.reduce((sum, p) => sum + p.amount, 0);
    const overdueInvoices = db.invoices.filter((i) => i.outstanding_amount > 0);
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.outstanding_amount, 0);

    return NextResponse.json({
      company: db.company,
      financialSummary: {
        mrr: Math.round(mrr * 100) / 100,
        activeSubscriptionsCount: activeSubs.length,
        totalCustomersCount: Array.from(new Set(db.subscriptions.map((s) => s.customer_name))).length,
        totalCollections: Math.round(totalCollected * 100) / 100,
        overdueReceivables: Math.round(overdueAmount * 100) / 100,
        overdueCount: overdueInvoices.length,
        totalInvoicesIssued: db.invoices.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    if (body.subsidiary) {
      const newSub: SubsidiaryEntity = body.subsidiary;
      if (!db.company.subsidiaries) db.company.subsidiaries = [];
      db.company.subsidiaries.push(newSub);

      recordAudit(
        body.actorName || "Admin",
        "Config Update",
        `SUBSIDIARY: ${newSub.code}`,
        "Success",
        `Added new subsidiary entity '${newSub.name}' in jurisdiction ${newSub.jurisdiction}`
      );
    }

    if (body.profileUpdates) {
      db.company = { ...db.company, ...body.profileUpdates };
      recordAudit(
        body.actorName || "Admin",
        "Config Update",
        "COMPANY-PROFILE",
        "Success",
        "Updated company legal credentials & fiscal configurations"
      );
    }

    saveDatabase(db);
    return NextResponse.json({
      success: true,
      company: db.company,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
