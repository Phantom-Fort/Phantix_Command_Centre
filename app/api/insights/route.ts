import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthToken, requireAdmin, errorResponse, jsonResponse } from "@/lib/auth-utils";

const LOCK_END = new Date("2026-11-09");

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const snap = await adminDb.collection("insights").orderBy("createdAt", "desc").get();
    const insights = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return jsonResponse({ insights });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    if (new Date() > LOCK_END) {
      return errorResponse("Edit window has closed", 403);
    }
    const { book, author, phase, chapter, notes, category, suggestions } = await req.json();
    if (!book || !chapter || !notes) {
      return errorResponse("book, chapter, and notes are required", 400);
    }
    const entry = {
      book,
      author: author || "",
      phase: phase || "",
      chapter,
      notes,
      category: category || "",
      suggestions: suggestions || [],
      status: "pending",
      verdict: "",
      verdictNotes: "",
      addedBy: user.name,
      addedByUid: user.uid,
      deliberatedBy: "",
      deliberatedDate: "",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
    };
    const ref = await adminDb.collection("insights").add(entry);
    await adminDb.collection("logs").add({
      type: "research",
      text: `Insight logged: "${chapter}" from "${book}" by ${user.name}.`,
      date: entry.date,
      author: user.name,
      createdAt: new Date(),
    });
    return jsonResponse({ id: ref.id, ...entry });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
