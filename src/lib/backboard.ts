const BACKBOARD_BASE =
  process.env.BACKBOARD_API_URL || "https://app.backboard.io/api";
const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY || "";

const SYSTEM_PROMPT = `You are a geography expert. Generate a random real-world location and audio prompts for a geography guessing game. Respond ONLY with valid JSON matching this exact schema:
{{
  "city": "string",
  "country": "string",
  "lat": number,
  "lng": number,
  "ambientPrompt": "A vivid description of the ambient sounds at this location for a sound effects AI generator (e.g. bustling market, ocean waves, traffic). Max 100 words.",
  "musicPrompt": "A description of the regional musical style, instruments, and mood for music generation. Max 100 words.",
  "languagePhrase": "A common everyday phrase in the local language written in its original script or romanized form.",
  "languageTranslation": "English translation of the phrase.",
  "voiceDescription": "Description of the voice characteristics (accent, gender, age) for TTS."
}}
Pick diverse and interesting locations. Avoid overly obvious capitals.`;

export interface LocationData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  ambientPrompt: string;
  musicPrompt: string;
  languagePhrase: string;
  languageTranslation: string;
  voiceDescription: string;
}

async function bbFetch(path: string, body: unknown) {
  const res = await fetch(`${BACKBOARD_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": BACKBOARD_API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Backboard ${path}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Cache assistant ID so we only create it once per process
let cachedAssistantId: string | null = null;

async function getOrCreateAssistant(): Promise<string> {
  if (cachedAssistantId) return cachedAssistantId;

  // Check for an existing assistant first
  const listRes = await fetch(`${BACKBOARD_BASE}/assistants`, {
    headers: { "X-API-Key": BACKBOARD_API_KEY },
  });
  if (listRes.ok) {
    const assistants = await listRes.json();
    const existing = assistants.find(
      (a: { name?: string }) => a.name === "SonicGuessr Location Generator"
    );
    if (existing) {
      cachedAssistantId = existing.assistant_id;
      return existing.assistant_id;
    }
  }

  const assistant = await bbFetch("/assistants", {
    name: "SonicGuessr Location Generator",
    description: "Generates random locations with audio prompts for a geography guessing game",
    system_prompt: SYSTEM_PROMPT,
  });
  cachedAssistantId = assistant.assistant_id;
  return assistant.assistant_id;
}

export async function generateLocationAndPrompts(): Promise<LocationData> {
  const assistantId = await getOrCreateAssistant();

  // Create a new thread
  const thread = await bbFetch(`/assistants/${assistantId}/threads`, {});
  const threadId = thread.thread_id;

  // Inject a random seed and region hint so the LLM never returns a cached/deterministic result
  const regions = [
    "Western Europe", "Eastern Europe", "Sub-Saharan Africa", "North Africa",
    "Middle East", "South Asia", "Southeast Asia", "East Asia", "Central Asia",
    "North America", "Central America", "South America", "Caribbean",
    "Oceania", "Scandinavia", "Balkans",
  ];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const seed = Math.random().toString(36).slice(2, 8);

  // Send a message and get the response
  const response = await bbFetch(`/threads/${threadId}/messages`, {
    content: `Generate a random location in the ${region} region with audio prompts (seed: ${seed}). Respond ONLY with valid JSON, no markdown.`,
    role: "user",
  });

  const text = typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);

  // Extract JSON from response (may be wrapped in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse location JSON from LLM. Raw: ${text.slice(0, 300)}`);
  }

  return JSON.parse(jsonMatch[0]) as LocationData;
}
