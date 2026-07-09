import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const snap = await adminDb.collection("mvp").orderBy("createdAt", "asc").get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return jsonResponse({ items });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    const { title, description, status, priority, category } = await req.json();
    if (!title) return errorResponse("title is required", 400);
    const entry = {
      title,
      description: description || "",
      status: status || "pending",
      priority: priority || "P1",
      category: category || "Core",
      addedBy: user.name,
      createdAt: new Date(),
    };
    const ref = await adminDb.collection("mvp").add(entry);
    return jsonResponse({ id: ref.id, ...entry });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
