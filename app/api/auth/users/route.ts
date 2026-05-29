import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "asc").get();
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    return jsonResponse({ users });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
