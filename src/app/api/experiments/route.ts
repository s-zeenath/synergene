import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    message: "Experiments root route is not used. Use /api/experiments/all instead.",
  });
}
