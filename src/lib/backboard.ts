const BACKBOARD_BASE =
  process.env.BACKBOARD_API_URL || "https://app.backboard.io/api";
const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY || "";

const SYSTEM_PROMPT = `You are a geography expert creating audio prompts for a geography guessing game.

CRITICAL RULES:
- NEVER mention any city name, neighborhood name, landmark name, or station name in ambientPrompt or musicPrompt.
- ambientPrompt must describe 3-4 LOUD, CLEAR, DISTINCTIVE NON-VOCAL sounds that identify the COUNTRY (no human speech or announcements).
- musicPrompt must describe country-specific instruments and musical style (no city/place names).
- languagePhrase: 3-5 conversational sentences in the local language (a full natural paragraph). NEVER include city names or landmark names. Write a mini dialogue or monologue about everyday topics like ordering food, asking for directions, chatting about the weather, or haggling at a market.
- voiceDescription: describe the accent, gender, and approximate age for TTS voice generation.

Respond ONLY with valid JSON matching this exact schema:
{{
  "city": "string",
  "country": "string",
  "lat": number,
  "lng": number,
  "ambientPrompt": "3-4 distinct, loud, non-vocal sounds identifying this country. Max 80 words.",
  "musicPrompt": "Country-specific instruments, genre, and mood. No location names. Max 80 words.",
  "languagePhrase": "3-5 conversational sentences in the local language. A natural paragraph about everyday life. No location names.",
  "languageTranslation": "English translation of the phrase.",
  "voiceDescription": "Accent, gender, age for TTS (e.g. 'Young French woman with soft Parisian accent')."
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
    model: "gemini-3-flash-preview",
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
