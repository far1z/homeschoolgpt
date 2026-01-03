"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, RefreshCw, Lightbulb } from "lucide-react";
import type { Activity } from "@/types";

interface DifferentActivityModalProps {
  activity: Activity;
  onSubmit: (reason: string, notes: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const QUICK_REASONS = [
  { id: "not-interested", label: "Not interested in this", emoji: "😴" },
  { id: "too-hard", label: "Too challenging right now", emoji: "😓" },
  { id: "too-easy", label: "Too easy / already mastered", emoji: "🎓" },
  { id: "no-materials", label: "Don't have the materials", emoji: "📦" },
  { id: "not-mood", label: "Not in the mood for this type", emoji: "🙃" },
  { id: "done-recently", label: "Did something similar recently", emoji: "🔄" },
];

export default function DifferentActivityModal({
  activity,
  onSubmit,
  onClose,
  isLoading,
}: DifferentActivityModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSubmit = () => {
    const reason = QUICK_REASONS.find((r) => r.id === selectedReason);
    const reasonText = reason ? reason.label : "Other";
    const fullNotes = additionalNotes.trim()
      ? `${reasonText}: ${additionalNotes.trim()}`
      : reasonText;
    onSubmit(reasonText, fullNotes);
  };

  const canSubmit = selectedReason !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-terracotta-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-navy-800">
                Help us improve
              </h2>
              <p className="text-sm text-navy-500">
                Why try something different?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-navy-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current activity context */}
          <div className="bg-cream-100 rounded-xl p-3 mb-6">
            <p className="text-xs text-navy-500 mb-1">Current activity:</p>
            <p className="font-medium text-navy-800">{activity.title}</p>
          </div>

          {/* Quick reasons */}
          <p className="text-sm font-medium text-navy-700 mb-3">
            What&apos;s the reason?
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {QUICK_REASONS.map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                disabled={isLoading}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedReason === reason.id
                    ? "bg-terracotta-100 border-2 border-terracotta-400"
                    : "bg-cream-100 border-2 border-transparent hover:bg-cream-200"
                }`}
              >
                <span className="text-lg block mb-1">{reason.emoji}</span>
                <span className="text-xs text-navy-700 leading-tight block">
                  {reason.label}
                </span>
              </button>
            ))}
          </div>

          {/* Additional notes */}
          <div className="mb-6">
            <label className="text-sm font-medium text-navy-700 mb-2 block">
              Any additional notes? (optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g., She's more interested in music today..."
              disabled={isLoading}
              className="input-field h-20 resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Finding..." : "Get Different Activity"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
