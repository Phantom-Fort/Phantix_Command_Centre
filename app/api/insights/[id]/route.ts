import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const body = await req.json();
    const allowed = ["status", "verdict", "verdictNotes", "deliberatedBy", "deliberatedDate"];
    const update: Record<string, any> = {};
    allowed.forEach((k) => {
      if (body[k] !== undefined) update[k] = body[k];
    });
    if (!Object.keys(update).length) {
      return errorResponse("No valid fields to update", 400);
    }
    await adminDb.collection("insights").doc(params.id).update(update);
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
    await adminDb.collection("insights").doc(params.id).delete();
    return Response.json({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
