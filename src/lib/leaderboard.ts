import fs from "fs/promises";
import path from "path";

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

const LEADERBOARD_PATH = path.join(process.cwd(), "leaderboard.json");
const MAX_ENTRIES = 100;

export async function readLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const data = await fs.readFile(LEADERBOARD_PATH, "utf-8");
    return JSON.parse(data) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export async function writeLeaderboard(
  entries: LeaderboardEntry[]
): Promise<void> {
  const sorted = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  await fs.writeFile(LEADERBOARD_PATH, JSON.stringify(sorted, null, 2));
}

export async function addScore(
  username: string,
  score: number
): Promise<LeaderboardEntry[]> {
  const entries = await readLeaderboard();
  entries.push({ username, score, date: new Date().toISOString() });
  await writeLeaderboard(entries);
  return readLeaderboard();
}
