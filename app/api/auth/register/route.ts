import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

const ADMIN_KEY = process.env.ADMIN_REGISTRATION_KEY;

export async function POST(req: NextRequest) {
  try {
    const { uid, name, username, email, role, adminKey } = await req.json();

    if (!uid || !name || !username || !email) {
      return NextResponse.json({ error: "uid, name, username, email are required" }, { status: 400 });
    }

    try {
      await adminAuth.getUser(uid);
    } catch (_) {
      return NextResponse.json({ error: "Invalid Firebase user" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    const existing = await adminDb
      .collection("users")
      .where("username", "==", cleanUsername)
      .limit(1)
      .get();

    if (!existing.empty) {
      try { await adminAuth.deleteUser(uid); } catch (_) {}
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    let userRole = "contributor";

    if (role === "admin") {
      if (!ADMIN_KEY) {
        return NextResponse.json({ error: "Admin registration disabled" }, { status: 500 });
      }
      if (adminKey !== ADMIN_KEY) {
        try { await adminAuth.deleteUser(uid); } catch (_) {}
        return NextResponse.json({ error: "Invalid admin key" }, { status: 403 });
      }
      userRole = "admin";
      await adminAuth.setCustomUserClaims(uid, { role: "admin" });
    }

    await adminDb.collection("users").doc(uid).set({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: userRole,
      createdAt: new Date().toISOString(),
    });

    await adminDb.collection("logs").add({
      type: "milestone",
      text: `New user registered: ${cleanName} (@${cleanUsername}) — ${userRole}`,
      date: new Date().toISOString().split("T")[0],
      author: "System",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, name: cleanName, role: userRole });
  } catch (err: any) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
