import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse } from "@/lib/auth-utils";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    await adminDb.collection("logs").doc(params.id).delete();
    return Response.json({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
