import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = getDatabase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials: user not found" },
        { status: 401 }
      );
    }

    if (password && user.passwordHash && user.passwordHash !== password) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date().toISOString();
    saveDatabase(db);

    recordAudit(
      user.name,
      "Config Update",
      `USER-LOGIN: ${user.id}`,
      "Success",
      `User ${user.email} logged in with role ${user.role}`
    );

    const { passwordHash, ...safeUser } = user;
    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
