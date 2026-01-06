"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import posthog from "posthog-js";
import type { Activity, ActivityFeedback, EngagementLevel, CompletionLevel } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface FeedbackFormProps {
  activity: Activity;
  onSubmit: (feedback: ActivityFeedback) => void;
  isLastActivity?: boolean;
}

const ENGAGEMENT_LEVELS: { value: EngagementLevel; label: string; emoji: string }[] = [
  { value: 1, label: "Not interested", emoji: "😴" },
  { value: 2, label: "A little engaged", emoji: "😐" },
  { value: 3, label: "Engaged", emoji: "🙂" },
  { value: 4, label: "Very engaged", emoji: "😊" },
  { value: 5, label: "Loved it!", emoji: "🤩" },
];

const COMPLETION_LEVELS: { value: CompletionLevel; label: string }[] = [
  { value: "not-started", label: "Didn't try" },
  { value: "partial", label: "Tried but didn't finish" },
  { value: "completed", label: "Completed" },
  { value: "exceeded", label: "Exceeded expectations!" },
];

export default function FeedbackForm({
  activity,
  onSubmit,
  isLastActivity,
}: FeedbackFormProps) {
  const [engagement, setEngagement] = useState<EngagementLevel | null>(null);
  const [completion, setCompletion] = useState<CompletionLevel | null>(null);
  const [challenges, setChallenges] = useState("");
  const [highlights, setHighlights] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const canSubmit = engagement !== null && completion !== null;

  const handleSubmit = () => {
    if (!engagement || !completion) return;

    const feedback: ActivityFeedback = {
      id: uuidv4(),
      activityId: activity.id,
      date: new Date().toISOString(),
      engagement,
      completion,
      notes: activity.title,
      challenges: challenges.trim() || undefined,
      highlights: highlights.trim() || undefined,
    };

    // Track feedback submission - key engagement metric
    posthog.capture('feedback_submitted', {
      activity_title: activity.title,
      skill_areas: activity.skillAreas,
      engagement_level: engagement,
      completion_level: completion,
      has_challenges: !!challenges.trim(),
      has_highlights: !!highlights.trim(),
      is_last_activity: isLastActivity,
    });

    onSubmit(feedback);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-sage-600" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-800">
            How did it go?
          </h2>
          <p className="text-navy-500 text-sm">{activity.title}</p>
        </div>
      </div>

      {/* Engagement */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-700 mb-3">
          How engaged was the child?
        </label>
        <div className="grid grid-cols-5 gap-2">
          {ENGAGEMENT_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setEngagement(level.value)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                engagement === level.value
                  ? "bg-terracotta-100 border-2 border-terracotta-400 shadow-sm"
                  : "bg-cream-100 border-2 border-transparent hover:bg-cream-200"
              }`}
            >
              <span className="text-2xl mb-1">{level.emoji}</span>
              <span className="text-xs text-navy-600 text-center leading-tight">
                {level.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Completion */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-700 mb-3">
          Did they complete the activity?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COMPLETION_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setCompletion(level.value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                completion === level.value
                  ? "bg-sage-100 border-2 border-sage-400 text-sage-800"
                  : "bg-cream-100 border-2 border-transparent text-navy-700 hover:bg-cream-200"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional details toggle */}
      {!showDetails && (
        <button
          onClick={() => setShowDetails(true)}
          className="text-sm text-terracotta-600 hover:text-terracotta-700 mb-6 flex items-center gap-1"
        >
          + Add notes (optional)
        </button>
      )}

      {/* Optional details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 mb-6"
        >
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Any challenges?
            </label>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="e.g., Lost interest quickly, struggled with..."
              className="input-field h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              What went well?
            </label>
            <textarea
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="e.g., Really enjoyed the colors, learned new word..."
              className="input-field h-20 resize-none"
            />
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4"
      >
        {isLastActivity ? (
          <>
            <Sparkles className="w-5 h-5" />
            Finish Today&apos;s Learning
          </>
        ) : (
          <>
            Next Activity
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </motion.div>
  );
}
