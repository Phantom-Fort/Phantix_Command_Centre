import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    const body = await req.json();
    const allowed = ["title", "description", "status", "priority", "category"];
    const update: Record<string, any> = {};
    allowed.forEach((k) => {
      if (body[k] !== undefined) update[k] = body[k];
    });
    if (!Object.keys(update).length) return errorResponse("No valid fields to update", 400);
    await adminDb.collection("mvp").doc(params.id).update(update);
    return Response.json({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    await adminDb.collection("mvp").doc(params.id).delete();
    return Response.json({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
