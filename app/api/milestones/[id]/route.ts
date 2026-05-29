import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const { status } = await req.json();
    if (!status) return errorResponse("status is required", 400);
    await adminDb.collection("milestones").doc(params.id).update({ status });
    return jsonResponse({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    await adminDb.collection("milestones").doc(params.id).delete();
    return Response.json({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
