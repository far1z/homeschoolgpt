"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Target,
  Heart,
  AlertCircle,
  MessageSquare,
  Brain,
} from "lucide-react";
import type { Child, ChildProfile } from "@/types";
import { SKILL_AREAS } from "@/types";

interface ChildProfileViewProps {
  child: Child;
  profile: ChildProfile | null;
  onBack: () => void;
}

function getAgeDescription(ageInMonths: number): string {
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  if (years === 0) return `${months} months old`;
  if (months === 0) return `${years} year${years > 1 ? "s" : ""} old`;
  return `${years}y ${months}m`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TrendIcon({ trend }: { trend: "improving" | "stable" | "needs-attention" }) {
  if (trend === "improving") {
    return <TrendingUp className="w-4 h-4 text-sage-600" />;
  } else if (trend === "needs-attention") {
    return <TrendingDown className="w-4 h-4 text-terracotta-500" />;
  }
  return <Minus className="w-4 h-4 text-navy-400" />;
}

function SkillLevelBar({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-6 rounded-full ${
            i <= level ? "bg-sage-500" : "bg-cream-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ChildProfileView({
  child,
  profile,
  onBack,
}: ChildProfileViewProps) {
  const hasProfile = profile && (
    profile.strengths.length > 0 ||
    profile.areasForGrowth.length > 0 ||
    profile.observations.length > 0 ||
    Object.keys(profile.skillLevels).length > 0
  );

  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 flex items-center gap-4 border-b border-cream-200"
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-navy-800">
            {child.name}&apos;s Profile
          </h1>
          <p className="text-sm text-navy-400">
            {getAgeDescription(child.age)} &middot; AI-generated insights
          </p>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* AI Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sage-50 to-honey-50 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-sage-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-navy-700">
              AI-Generated Assessment
            </p>
            <p className="text-xs text-navy-500 mt-0.5">
              This profile is built from activity feedback and evolves over time.
              It helps personalize learning activities for {child.name}.
            </p>
          </div>
        </motion.div>

        {!hasProfile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-navy-400" />
            </div>
            <h2 className="font-display text-lg font-semibold text-navy-700 mb-2">
              Profile building...
            </h2>
            <p className="text-navy-500 text-sm max-w-xs mx-auto">
              Complete a few activities and provide feedback to start building
              {child.name}&apos;s learning profile.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Last Updated */}
            {profile.lastUpdated && (
              <p className="text-xs text-navy-400 text-center">
                Last updated: {formatDate(profile.lastUpdated)}
              </p>
            )}

            {/* Activities Completed */}
            {profile.activitiesCompleted > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-honey-50 rounded-2xl p-4 text-center"
              >
                <p className="text-3xl font-display font-bold text-honey-600">
                  {profile.activitiesCompleted}
                </p>
                <p className="text-sm text-navy-600">activities completed</p>
              </motion.div>
            )}

            {/* Skill Levels */}
            {Object.keys(profile.skillLevels).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card"
              >
                <h2 className="font-semibold text-navy-700 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-terracotta-500" />
                  Skill Development
                </h2>
                <div className="space-y-4">
                  {Object.entries(profile.skillLevels).map(([skill, data]) => {
                    const skillInfo = SKILL_AREAS.find((s) => s.value === skill);
                    if (!data) return null;
                    return (
                      <div key={skill} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-navy-700">
                              {skillInfo?.label || skill}
                            </span>
                            <div className="flex items-center gap-1">
                              <TrendIcon trend={data.trend} />
                              <span className="text-xs text-navy-400">
                                {data.trend === "improving"
                                  ? "Improving"
                                  : data.trend === "needs-attention"
                                    ? "Needs focus"
                                    : "Stable"}
                              </span>
                            </div>
                          </div>
                          <SkillLevelBar level={data.level} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Strengths */}
            {profile.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <h2 className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-honey-500" />
                  Strengths
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.strengths.map((strength, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-honey-50 text-honey-700 rounded-full text-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Areas for Growth */}
            {profile.areasForGrowth.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="card"
              >
                <h2 className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sage-600" />
                  Areas for Growth
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.areasForGrowth.map((area, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-sage-50 text-sage-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preferred Activity Types */}
            {profile.preferredActivityTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <h2 className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-terracotta-500" />
                  Enjoys
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredActivityTypes.map((type, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-terracotta-50 text-terracotta-700 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Things to Avoid */}
            {profile.avoidances.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="card"
              >
                <h2 className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-navy-400" />
                  Better to Avoid
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.avoidances.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-cream-200 text-navy-600 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Observations */}
            {profile.observations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <h2 className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-navy-500" />
                  Recent Observations
                </h2>
                <ul className="space-y-2">
                  {profile.observations.slice(0, 5).map((obs, i) => (
                    <li
                      key={i}
                      className="text-sm text-navy-600 pl-4 border-l-2 border-cream-300"
                    >
                      {obs}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Development Notes */}
            {profile.developmentNotes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="card bg-gradient-to-br from-cream-100 to-cream-50"
              >
                <h2 className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-terracotta-500" />
                  Development Summary
                </h2>
                <p className="text-sm text-navy-600 leading-relaxed">
                  {profile.developmentNotes}
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>
    </div>
  );
}
