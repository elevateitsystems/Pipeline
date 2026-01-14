import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) : Promise<NextResponse> {
  // If ratelimit is not configured, allow the request
  if (!ratelimit) {
    return NextResponse.json({ message: "OK, you're within limits (ratelimit not configured)" });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  console.log("IP:", ip);
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return NextResponse.json({ message: "OK, you're within limits" });
}
