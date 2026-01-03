"use client";

import { motion } from "framer-motion";
import { PartyPopper, Star, RefreshCw, Settings } from "lucide-react";
import type { DayCurriculum } from "@/types";
import { SKILL_AREAS } from "@/types";

interface DaySummaryProps {
  curriculum: DayCurriculum;
  childName: string;
  onStartNewDay: () => void;
  onManageToys: () => void;
}

export default function DaySummary({
  curriculum,
  childName,
  onStartNewDay,
  onManageToys,
}: DaySummaryProps) {
  const completedActivities = curriculum.activities.filter(
    (a) => a.status === "completed"
  );
  const skippedActivities = curriculum.activities.filter(
    (a) => a.status === "skipped"
  );

  // Collect all skill areas covered
  const skillsCovered = new Set<string>();
  completedActivities.forEach((a) => {
    a.skillAreas.forEach((skill) => skillsCovered.add(skill));
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-6 py-8"
    >
      {/* Celebration header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-honey-300 to-honey-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <PartyPopper className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="font-display text-3xl font-semibold text-navy-800 mb-2">
          Great job today!
        </h1>
        <p className="text-navy-500">
          {childName} completed {completedActivities.length} activit
          {completedActivities.length === 1 ? "y" : "ies"}
        </p>
      </div>

      {/* Stats */}
      <div className="card mb-6">
        <h2 className="font-semibold text-navy-700 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-honey-500" />
          Today&apos;s Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sage-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-display font-bold text-sage-700">
              {completedActivities.length}
            </p>
            <p className="text-sm text-sage-600">Completed</p>
          </div>
          <div className="bg-cream-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-display font-bold text-navy-600">
              {skippedActivities.length}
            </p>
            <p className="text-sm text-navy-500">Skipped</p>
          </div>
        </div>

        {/* Skills covered */}
        {skillsCovered.size > 0 && (
          <div>
            <p className="text-sm font-medium text-navy-600 mb-2">
              Skills practiced today:
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(skillsCovered).map((skill) => {
                const found = SKILL_AREAS.find((s) => s.value === skill);
                return (
                  <span
                    key={skill}
                    className={`px-3 py-1 rounded-full text-xs font-medium skill-${skill}`}
                  >
                    {found?.label || skill}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Activities list */}
      <div className="card mb-6">
        <h2 className="font-semibold text-navy-700 mb-4">Activities</h2>
        <div className="space-y-3">
          {curriculum.activities.map((activity, i) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 py-2"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  activity.status === "completed"
                    ? "bg-sage-100 text-sage-700"
                    : activity.status === "skipped"
                      ? "bg-cream-200 text-navy-400"
                      : "bg-cream-200 text-navy-500"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 ${
                  activity.status === "completed"
                    ? "text-navy-700"
                    : "text-navy-400"
                }`}
              >
                {activity.title}
              </span>
              <span className="text-sm text-navy-400">
                {activity.status === "completed"
                  ? "✓"
                  : activity.status === "skipped"
                    ? "Skipped"
                    : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onStartNewDay}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          <RefreshCw className="w-5 h-5" />
          Generate Tomorrow&apos;s Curriculum
        </button>

        <button
          onClick={onManageToys}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Manage Toys & Materials
        </button>
      </div>

      <p className="text-center text-sm text-navy-400 mt-6">
        Come back tomorrow for new activities!
      </p>
    </motion.div>
  );
}
