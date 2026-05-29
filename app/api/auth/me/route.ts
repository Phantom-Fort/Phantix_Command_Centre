import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, jsonResponse, errorResponse } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken(req);
  if (!user) return errorResponse("Unauthorized — no token provided", 401);
  return jsonResponse({ user });
}
