import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const snap = await adminDb.collection("manifest").orderBy("createdAt", "asc").get();
    const manifest = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return jsonResponse({ manifest });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  if (!requireAdmin(user)) return errorResponse("Admin access required", 403);
  try {
    const { title, body, type, source, priority, category } = await req.json();
    if (!title || !body) return errorResponse("title and body are required", 400);
    const entry = {
      title,
      body,
      type: type || "feature",
      source: source || "",
      priority: priority || "Phase 2",
      category: category || "",
      addedBy: user.name,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
    };
    const ref = await adminDb.collection("manifest").add(entry);
    await adminDb.collection("logs").add({
      type: "milestone",
      text: `Manifest entry added: "${title}" by ${user.name}.`,
      date: entry.date,
      author: user.name,
      createdAt: new Date(),
    });
    return jsonResponse({ id: ref.id, ...entry });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
