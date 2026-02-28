"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const activePlayers = new Set<() => void>();
let currentToggle: (() => void) | null = null;

export function toggleActivePlayer() {
  currentToggle?.();
}

interface AudioPlayerProps {
  src: string;
  label: string;
  icon?: LucideIcon;
  autoPlay?: boolean;
  onPlayed?: () => void;
}

export default function AudioPlayer({ src, label, icon: Icon, autoPlay, onPlayed }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const reportedPlay = useRef(false);
  const autoPlayRef = useRef(autoPlay);
  const onPlayedRef = useRef(onPlayed);
  autoPlayRef.current = autoPlay;
  onPlayedRef.current = onPlayed;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaying(false);
    setProgress(0);
    setDuration(0);
    reportedPlay.current = false;

    const onTimeUpdate = () =>
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onLoaded = () => {
      setDuration(audio.duration);
      if (autoPlayRef.current) {
        activePlayers.forEach((pause) => pause());
        audio.play().then(() => setPlaying(true)).catch(() => {});
      }
    };
    const onEnded = () => setPlaying(false);
    const onPlay = () => {
      if (!reportedPlay.current) {
        reportedPlay.current = true;
        onPlayedRef.current?.();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
    };
  }, [src]);

  const pauseSelf = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    activePlayers.add(pauseSelf);
    return () => { activePlayers.delete(pauseSelf); };
  }, [pauseSelf]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      activePlayers.forEach((pause) => { if (pause !== pauseSelf) pause(); });
      audio.play();
      setPlaying(true);
      currentToggle = () => {
        const a = audioRef.current;
        if (!a) return;
        if (a.paused) { a.play(); setPlaying(true); }
        else { a.pause(); setPlaying(false); }
      };
    }
  }, [playing, pauseSelf]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const LabelIcon = Icon ?? Volume2;

  return (
    <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3 w-full max-w-md">
      <audio ref={audioRef} src={src} preload="metadata" />
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="shrink-0 w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 transition flex items-center justify-center text-black"
      >
        {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </motion.button>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <LabelIcon size={12} className="text-amber-500" />
          <span className="font-medium text-gray-200">{label}</span>
          <span className="ml-auto tabular-nums">
            {fmt(duration * progress)} / {fmt(duration)}
          </span>
        </div>
        <div
          className="h-1.5 bg-white/20 rounded-full cursor-pointer group"
          onClick={seek}
        >
          <motion.div
            className="h-full bg-amber-500 rounded-full origin-left"
            style={{ scaleX: progress }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}
