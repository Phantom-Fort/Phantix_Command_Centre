import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const snap = await adminDb.collection("logs").orderBy("createdAt", "desc").limit(200).get();
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return jsonResponse({ logs });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const { type, text } = await req.json();
    if (!text) return errorResponse("text is required", 400);
    const entry = {
      type: type || "update",
      text,
      date: new Date().toISOString().split("T")[0],
      author: user.name,
      createdAt: new Date(),
    };
    const ref = await adminDb.collection("logs").add(entry);
    return jsonResponse({ id: ref.id, ...entry });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
