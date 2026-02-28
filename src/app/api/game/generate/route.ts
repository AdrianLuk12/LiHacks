import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateLocationAndPrompts } from "@/lib/backboard";
import {
  generateSoundEffect,
  generateMusic,
  generateSpeech,
  deleteVoice,
} from "@/lib/elevenlabs";
import { setSession } from "@/lib/sessions";

export async function POST() {
  try {
    const location = await generateLocationAndPrompts();

    const [ambientBuf, musicBuf, speechResult] = await Promise.all([
      generateSoundEffect(location.ambientPrompt),
      generateMusic(location.musicPrompt),
      generateSpeech(location.languagePhrase, location.voiceDescription),
    ]);

    // Clean up dynamically generated voice
    deleteVoice(speechResult.voiceId).catch(() => {});

    const sessionId = randomUUID();

    const toDataUri = (buf: Buffer, mime = "audio/mpeg") =>
      `data:${mime};base64,${buf.toString("base64")}`;

    const audioUrls = {
      ambient: toDataUri(ambientBuf),
      music: toDataUri(musicBuf),
      language: toDataUri(speechResult.buffer),
    };

    setSession({
      id: sessionId,
      location: {
        city: location.city,
        country: location.country,
        lat: location.lat,
        lng: location.lng,
      },
      audioUrls,
      languagePhrase: location.languagePhrase,
      languageTranslation: location.languageTranslation,
    });

    // Return audio and session ID — but NOT the actual coordinates
    return NextResponse.json({
      sessionId,
      audio: audioUrls,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
