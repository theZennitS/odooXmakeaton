import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";
import { SubscriptionStatus } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const sub = db.subscriptions.find((s) => s.id === params.id);
    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json({ subscription: sub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, actorName, plan_id, next_billing_date } = await request.json();
    const db = getDatabase();
    const sub = db.subscriptions.find((s) => s.id === params.id);

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const previousStatus = sub.status;
    const actor = actorName || "User";

    if (status) {
      sub.status = status as SubscriptionStatus;
      if (!sub.timeline) sub.timeline = [];
      sub.timeline.unshift({
        text: `Status transitioned from ${previousStatus} to ${status}`,
        meta: `${actor} • Just now`,
      });

      recordAudit(
        actor,
        "Status Change",
        sub.id,
        "Success",
        `Subscription status updated to ${status} (was ${previousStatus})`
      );
    }

    if (next_billing_date) {
      sub.next_billing_date = next_billing_date;
    }

    saveDatabase(db);
    return NextResponse.json({
      success: true,
      subscription: sub,
      message: `Subscription ${sub.id} updated to ${sub.status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
