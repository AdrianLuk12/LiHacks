"use client";

import { useState, useEffect } from "react";
import { Headphones, Globe, Music, Volume2, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "Picking a mystery location…", icon: Globe, duration: 1500 },
  { label: "Creating ambient sounds…", icon: Volume2, duration: 3000 },
  { label: "Composing regional music…", icon: Music, duration: 3000 },
  { label: "Generating speech clue…", icon: MessageSquare, duration: 3000 },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const advance = (step: number) => {
      if (step >= STEPS.length) return;
      timeout = setTimeout(() => {
        setCurrentStep(step + 1);
        advance(step + 1);
      }, STEPS[step].duration);
    };
    advance(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Pulsing ring + icon */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-24 h-24 rounded-full border-2 border-amber-500/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full border border-amber-500/50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <Headphones size={48} className="text-amber-500 relative z-10" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold mb-1">Tuning the radio…</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            className="text-amber-400 text-sm font-medium h-5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep < STEPS.length
              ? STEPS[currentStep].label
              : "Almost ready…"}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Step list */}
      <div className="flex flex-col gap-2 w-64">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const StepIcon = step.icon;
          const DoneIcon = CheckCircle2;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                done ? "text-emerald-400" : active ? "text-amber-400" : "text-gray-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {done ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <DoneIcon size={16} />
                  </motion.div>
                ) : active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <StepIcon size={16} />
                  </motion.div>
                ) : (
                  <StepIcon size={16} />
                )}
              </div>
              <span className={done ? "line-through opacity-60" : active ? "font-medium" : ""}>
                {step.label.replace("…", "")}
              </span>
              {active && (
                <motion.div
                  className="ml-auto flex gap-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((d) => (
                    <motion.div
                      key={d}
                      className="w-1 h-1 rounded-full bg-amber-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
