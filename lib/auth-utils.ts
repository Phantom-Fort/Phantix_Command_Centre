import { adminAuth, adminDb } from "./firebase-admin";
import { UserSession } from "./types";

export async function verifyAuthToken(req: Request): Promise<UserSession | null> {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const cookieHeader = req.headers.get("cookie") || "";
    let token: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      const match = cookieHeader.match(/phantix_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    const profile = snap.exists ? snap.data() : {};

    return {
      uid: decoded.uid,
      email: decoded.email || "",
      name: profile?.name || decoded.email || "",
      username: profile?.username || "",
      role: profile?.role || "contributor",
    };
  } catch {
    return null;
  }
}

export function requireAdmin(session: UserSession | null): boolean {
  return session?.role === "admin";
}

export function jsonResponse(data: any, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
