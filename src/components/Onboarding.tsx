"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Child } from "@/types";
import { saveChild, completeOnboarding, initializeChildProfile } from "@/lib/storage";

interface OnboardingProps {
  onComplete: () => void;
}

type Step = "welcome" | "child";

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [childName, setChildName] = useState("");
  const [childAgeYears, setChildAgeYears] = useState(2);
  const [childAgeMonths, setChildAgeMonths] = useState(0);

  const handleComplete = () => {
    const child: Child = {
      id: uuidv4(),
      name: childName,
      age: childAgeYears * 12 + childAgeMonths,
      createdAt: new Date().toISOString(),
    };

    saveChild(child);
    initializeChildProfile(child.id);
    completeOnboarding();
    onComplete();
  };

  const canProceed = childName.trim().length > 0;

  return (
    <div className="min-h-screen min-h-dvh flex flex-col px-6 py-8">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-honey-300 to-terracotta-400 flex items-center justify-center mb-8 shadow-lg"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="font-display text-4xl font-semibold text-navy-800 mb-4">
              HomeschoolGPT
            </h1>

            <p className="text-navy-600 text-lg mb-12 max-w-sm leading-relaxed">
              Personalized play-based learning activities designed just for your
              little one.
            </p>

            <button
              onClick={() => setStep("child")}
              className="btn-primary flex items-center gap-2 text-lg px-8"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === "child" && (
          <motion.div
            key="child"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-3xl font-semibold text-navy-800 mb-2">
              Tell us about your child
            </h2>
            <p className="text-navy-500 mb-8">
              We&apos;ll personalize activities for their age and development.
            </p>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Child&apos;s Name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter their name"
                  className="input-field text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Age
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      value={childAgeYears}
                      onChange={(e) => setChildAgeYears(Number(e.target.value))}
                      className="input-field"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((y) => (
                        <option key={y} value={y}>
                          {y} year{y !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={childAgeMonths}
                      onChange={(e) =>
                        setChildAgeMonths(Number(e.target.value))
                      }
                      className="input-field"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {i} month{i !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep("welcome")}
                className="btn-ghost flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!canProceed}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
