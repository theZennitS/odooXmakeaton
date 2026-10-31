import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server-db";

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      auditLedger: db.auditLedger,
      notifications: db.notifications,
      totalLogs: db.auditLedger.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
