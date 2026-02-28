import fs from "fs/promises";
import path from "path";

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

const LEADERBOARD_PATH = path.join(process.cwd(), "leaderboard.json");
const MAX_ENTRIES = 100;

// Track session IDs that have already submitted a score (in-memory, per process)
const submittedSessions = new Set<string>();

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
  score: number,
  sessionId?: string
): Promise<LeaderboardEntry[] | null> {
  if (sessionId) {
    if (submittedSessions.has(sessionId)) return null; // already submitted
    submittedSessions.add(sessionId);
  }
  const entries = await readLeaderboard();
  const existing = entries.find((e) => e.username === username);
  if (existing) {
    if (score <= existing.score) return readLeaderboard(); // existing score is higher, keep it
    existing.score = score;
    existing.date = new Date().toISOString();
  } else {
    entries.push({ username, score, date: new Date().toISOString() });
  }
  await writeLeaderboard(entries);
  return readLeaderboard();
}
