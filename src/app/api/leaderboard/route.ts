import { NextRequest, NextResponse } from "next/server";
import { readLeaderboard, addScore } from "@/lib/leaderboard";

export async function GET() {
  try {
    const entries = await readLeaderboard();
    return NextResponse.json(entries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, score } = (await req.json()) as {
      username: string;
      score: number;
    };

    if (!username || typeof score !== "number") {
      return NextResponse.json(
        { error: "Missing username or score" },
        { status: 400 }
      );
    }

    const entries = await addScore(username, score);
    return NextResponse.json(entries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
