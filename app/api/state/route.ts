import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const snap = await adminDb.collection("users").doc(user.uid).collection("state").doc("main").get();
    return jsonResponse({ state: snap.exists ? snap.data() : {} });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const { key, value } = await req.json();
    if (!key) return errorResponse("key is required", 400);
    await adminDb
      .collection("users")
      .doc(user.uid)
      .collection("state")
      .doc("main")
      .set({ [key]: value }, { merge: true });
    return jsonResponse({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
