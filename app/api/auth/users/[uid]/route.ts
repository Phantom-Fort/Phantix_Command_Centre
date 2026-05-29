import { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function DELETE(req: NextRequest, { params }: { params: { uid: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  const { uid } = params;
  if (uid === user.uid) return errorResponse("Cannot delete your own account", 400);
  try {
    await adminAuth.deleteUser(uid);
    await adminDb.collection("users").doc(uid).delete();
    return jsonResponse({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
