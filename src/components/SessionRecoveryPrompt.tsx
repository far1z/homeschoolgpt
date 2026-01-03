"use client";

import { motion } from "framer-motion";
import { PlayCircle, RefreshCw } from "lucide-react";
import type { LearningSession } from "@/types";

interface SessionRecoveryPromptProps {
  session: LearningSession;
  childName: string;
  onContinue: () => void;
  onStartOver: () => void;
}

export default function SessionRecoveryPrompt({
  session,
  childName,
  onContinue,
  onStartOver,
}: SessionRecoveryPromptProps) {
  const currentActivity = session.activities[session.currentActivityIndex];
  const completedCount = session.activities.filter(
    (a) => a.status === "completed"
  ).length;

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta-300 to-terracotta-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <PlayCircle className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-2xl font-semibold text-navy-800 text-center mb-2">
          Welcome back!
        </h1>
        <p className="text-navy-500 text-center mb-8">
          {childName} has an unfinished session
        </p>

        {/* Session info card */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-navy-500">Progress</span>
            <span className="text-sm font-medium text-navy-700">
              {completedCount} of {session.activities.length} done
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-cream-200 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(completedCount / session.activities.length) * 100}%`,
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>

          {currentActivity && (
            <div className="bg-cream-100 rounded-xl p-3">
              <p className="text-xs text-navy-400 mb-1">Next up:</p>
              <p className="font-medium text-navy-700">{currentActivity.title}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
          >
            <PlayCircle className="w-5 h-5" />
            Continue Session
          </button>

          <button
            onClick={onStartOver}
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Session
          </button>
        </div>
      </motion.div>
    </div>
  );
}
