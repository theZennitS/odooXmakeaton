import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const db = getDatabase();
    if (email) {
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        const { passwordHash, ...safe } = user;
        return NextResponse.json({ user: safe });
      }
    }

    // Default to first user if no query provided
    const user = db.users[0];
    const { passwordHash, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
