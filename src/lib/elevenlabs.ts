const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const BASE_URL = "https://api.elevenlabs.io/v1";

async function elevenLabsFetch(
  path: string,
  body: Record<string, unknown>
): Promise<Buffer> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `ElevenLabs API error (${path}): ${res.status} ${await res.text()}`
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateSoundEffect(prompt: string): Promise<Buffer> {
  return elevenLabsFetch("/sound-generation", {
    text: prompt,
    duration_seconds: 10,
  });
}

export async function generateMusic(prompt: string): Promise<Buffer> {
  // ElevenLabs doesn't have a dedicated music endpoint in all tiers,
  // so we use sound generation with a music-oriented prompt as fallback
  return elevenLabsFetch("/sound-generation", {
    text: `Musical piece: ${prompt}`,
    duration_seconds: 15,
  });
}

export async function generateSpeech(
  text: string,
  _voiceDescription: string
): Promise<Buffer> {
  // Use a multilingual voice model. "Rachel" is a default voice ID.
  // In production, you'd pick a voice matching the voiceDescription.
  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel
  return elevenLabsFetch(`/text-to-speech/${voiceId}`, {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
  });
}
