import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateLocationAndPrompts } from "@/lib/backboard";
import {
  generateSoundEffect,
  generateMusic,
  generateSpeech,
} from "@/lib/elevenlabs";
import { setSession } from "@/lib/sessions";

export async function POST() {
  try {
    const location = await generateLocationAndPrompts();

    // Generate all 3 audio clips in parallel
    const [ambientBuf, musicBuf, speechBuf] = await Promise.all([
      generateSoundEffect(location.ambientPrompt),
      generateMusic(location.musicPrompt),
      generateSpeech(location.languagePhrase, location.voiceDescription),
    ]);

    const sessionId = randomUUID();

    // Encode audio as base64 data URIs
    const toDataUri = (buf: Buffer, mime = "audio/mpeg") =>
      `data:${mime};base64,${buf.toString("base64")}`;

    const audioUrls = {
      ambient: toDataUri(ambientBuf),
      music: toDataUri(musicBuf),
      language: toDataUri(speechBuf),
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
