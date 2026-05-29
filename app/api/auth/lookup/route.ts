import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username or email is required" }, { status: 400 });
    }

    const input = username.trim().toLowerCase();

    if (input.includes("@")) {
      return NextResponse.json({ email: input, source: "email" });
    }

    const snap = await adminDb
      .collection("users")
      .where("username", "==", input)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "Username not found" }, { status: 404 });
    }

    const profile = snap.docs[0].data();
    return NextResponse.json({ email: profile.email, source: "username" });
  } catch (err: any) {
    console.error("[/api/auth/lookup]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
