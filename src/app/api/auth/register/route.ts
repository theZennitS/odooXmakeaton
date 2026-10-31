import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, recordAudit } from "@/lib/server-db";

export async function POST(request: Request) {
  try {
    const { name, email, role, password, department } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const db = getDatabase();
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const initials = name
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name,
      email: email.toLowerCase().trim(),
      role: role || "Customer",
      avatar: initials || "US",
      department: department || (role === "Customer" ? "Client / Subscriber" : "Operations"),
      lastLoginAt: new Date().toISOString(),
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      passwordHash: password || "pass123",
    };

    db.users.push(newUser);
    saveDatabase(db);

    recordAudit(
      name,
      "Config Update",
      `USER-REGISTER: ${newUser.id}`,
      "Success",
      `New user account registered (${newUser.email}) with role ${newUser.role}`
    );

    const { passwordHash, ...safeUser } = newUser;
    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
