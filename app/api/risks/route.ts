import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const snap = await adminDb.collection("risks").orderBy("createdAt", "asc").get();
    const risks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return jsonResponse({ risks });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const { title, level, category, mitigation, owner } = await req.json();
    if (!title) return errorResponse("title is required", 400);
    const entry = {
      title,
      level: level || "MEDIUM",
      category: category || "General",
      mitigation: mitigation || "—",
      owner: owner || "—",
      addedBy: user.name,
      createdAt: new Date(),
    };
    const ref = await adminDb.collection("risks").add(entry);
    return jsonResponse({ id: ref.id, ...entry });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
