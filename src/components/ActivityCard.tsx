"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Package, CheckCircle2, SkipForward, RefreshCw } from "lucide-react";
import posthog from "posthog-js";
import type { Activity } from "@/types";
import { SKILL_AREAS } from "@/types";
import DifferentActivityModal from "./DifferentActivityModal";

interface ActivityCardProps {
  activity: Activity;
  activityNumber: number;
  totalActivities: number;
  onComplete: () => void;
  onSkip: () => void;
  onRegenerate: (reason: string, notes: string) => void;
  isRegenerating?: boolean;
}

export default function ActivityCard({
  activity,
  activityNumber,
  totalActivities,
  onComplete,
  onSkip,
  onRegenerate,
  isRegenerating,
}: ActivityCardProps) {
  const [showDifferentModal, setShowDifferentModal] = useState(false);

  const handleDifferentActivitySubmit = (reason: string, notes: string) => {
    setShowDifferentModal(false);

    // Track activity regeneration request
    posthog.capture('activity_regenerated', {
      activity_title: activity.title,
      activity_number: activityNumber,
      total_activities: totalActivities,
      skill_areas: activity.skillAreas,
      reason: reason,
      has_notes: !!notes,
    });

    onRegenerate(reason, notes);
  };

  const handleComplete = () => {
    // Track activity completion - key engagement metric
    posthog.capture('activity_completed', {
      activity_title: activity.title,
      activity_number: activityNumber,
      total_activities: totalActivities,
      skill_areas: activity.skillAreas,
      duration_minutes: activity.duration,
    });

    onComplete();
  };

  const handleSkip = () => {
    // Track activity skip - potential churn indicator
    posthog.capture('activity_skipped', {
      activity_title: activity.title,
      activity_number: activityNumber,
      total_activities: totalActivities,
      skill_areas: activity.skillAreas,
    });

    onSkip();
  };
  const skillLabels = activity.skillAreas.map((skill) => {
    const found = SKILL_AREAS.find((s) => s.value === skill);
    return found || { value: skill, label: skill, color: "navy" };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card texture-overlay"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy-500">
            Activity {activityNumber} of {totalActivities}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-navy-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{activity.duration} min</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-cream-200 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-terracotta-400 to-terracotta-500 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((activityNumber - 1) / totalActivities) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Title */}
      <h2 className="font-display text-2xl font-semibold text-navy-800 mb-3">
        {activity.title}
      </h2>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {skillLabels.map((skill) => (
          <span
            key={skill.value}
            className={`px-3 py-1 rounded-full text-xs font-medium skill-${skill.value}`}
          >
            {skill.label}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-navy-600 leading-relaxed mb-6">
        {activity.description}
      </p>

      {/* Materials */}
      <div className="bg-cream-100 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-terracotta-500" />
          <h3 className="font-semibold text-navy-700">Materials Needed</h3>
        </div>
        <ul className="space-y-1.5">
          {activity.materials.map((material, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-navy-600"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
              {material}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h3 className="font-semibold text-navy-700 mb-3">Instructions</h3>
        <ol className="space-y-3">
          {activity.instructions.map((instruction, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-sm font-medium">
                {i + 1}
              </span>
              <span className="text-navy-600 leading-relaxed pt-0.5">
                {instruction}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleComplete}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          <CheckCircle2 className="w-6 h-6" />
          Activity Complete
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDifferentModal(true)}
            disabled={isRegenerating}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Finding new..." : "Different Activity"}
          </button>
          <button
            onClick={handleSkip}
            className="btn-ghost flex items-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
        </div>
      </div>

      {/* Different Activity Modal */}
      <AnimatePresence>
        {showDifferentModal && (
          <DifferentActivityModal
            activity={activity}
            onSubmit={handleDifferentActivitySubmit}
            onClose={() => setShowDifferentModal(false)}
            isLoading={isRegenerating}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
