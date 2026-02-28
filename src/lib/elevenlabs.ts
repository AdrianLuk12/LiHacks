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
    prompt_influence: 0.3,
  });
}

export async function generateMusic(prompt: string): Promise<Buffer> {
  return elevenLabsFetch("/sound-generation", {
    text: `Musical piece: ${prompt}`,
    duration_seconds: 15,
    prompt_influence: 0.3,
  });
}

async function generateVoiceForDescription(
  voiceDescription: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/text-to-voice/create-previews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      voice_description: voiceDescription,
      auto_generate_text: true,
    }),
  });
  if (!res.ok) return "21m00Tcm4TlvDq8ikWAM"; // fallback to Rachel

  const preview = await res.json();
  const generatedId = preview?.previews?.[0]?.generated_voice_id;
  if (!generatedId) return "21m00Tcm4TlvDq8ikWAM";

  const saveRes = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      voice_name: `SonicGuessr-${Date.now()}`,
      voice_description: voiceDescription,
      generated_voice_id: generatedId,
    }),
  });
  if (!saveRes.ok) return "21m00Tcm4TlvDq8ikWAM";

  const voice = await saveRes.json();
  return voice.voice_id || "21m00Tcm4TlvDq8ikWAM";
}

export async function deleteVoice(voiceId: string): Promise<void> {
  if (voiceId === "21m00Tcm4TlvDq8ikWAM") return;
  await fetch(`${BASE_URL}/voices/${voiceId}`, {
    method: "DELETE",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  }).catch(() => {});
}

export async function generateSpeech(
  text: string,
  voiceDescription: string
): Promise<{ buffer: Buffer; voiceId: string }> {
  let voiceId = "21m00Tcm4TlvDq8ikWAM";
  try {
    voiceId = await generateVoiceForDescription(voiceDescription);
  } catch {
    // fallback to Rachel
  }

  const buffer = await elevenLabsFetch(`/text-to-speech/${voiceId}`, {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
  });
  return { buffer, voiceId };
}
