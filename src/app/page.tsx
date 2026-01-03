"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";

import type {
  Child,
  Toy,
  DayCurriculum,
  Activity,
  ActivityFeedback,
} from "@/types";
import {
  getAppState,
  getChild,
  getToys,
  getCurrentCurriculum,
  saveCurriculum,
  updateActivityStatus,
  advanceToNextActivity,
  addLessonHistory,
  getLessonHistory,
} from "@/lib/storage";
import { generateCurriculum, regenerateActivity } from "@/lib/api";

import Onboarding from "@/components/Onboarding";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";
import ActivityCard from "@/components/ActivityCard";
import FeedbackForm from "@/components/FeedbackForm";
import DaySummary from "@/components/DaySummary";
import ManageToys from "@/components/ManageToys";

type AppView =
  | "loading"
  | "onboarding"
  | "generating"
  | "activity"
  | "feedback"
  | "summary"
  | "manage-toys";

export default function Home() {
  const [view, setView] = useState<AppView>("loading");
  const [child, setChild] = useState<Child | null>(null);
  const [toys, setToys] = useState<Toy[]>([]);
  const [curriculum, setCurriculum] = useState<DayCurriculum | null>(null);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize app state from localStorage
  useEffect(() => {
    const state = getAppState();

    if (!state.onboardingCompleted || !state.child) {
      setView("onboarding");
      return;
    }

    setChild(state.child);
    setToys(state.toys);

    const existingCurriculum = getCurrentCurriculum();

    if (existingCurriculum) {
      setCurriculum(existingCurriculum);

      if (existingCurriculum.status === "completed") {
        setView("summary");
      } else {
        const activity =
          existingCurriculum.activities[
            existingCurriculum.currentActivityIndex
          ];
        setCurrentActivity(activity);
        setView("activity");
      }
    } else {
      // Need to generate new curriculum
      setView("generating");
      generateNewCurriculum(state.child, state.toys);
    }
  }, []);

  const generateNewCurriculum = async (childData: Child, toysData: Toy[]) => {
    try {
      setError(null);
      const recentHistory = getLessonHistory(10);
      const newCurriculum = await generateCurriculum(
        childData,
        toysData,
        recentHistory
      );

      setCurriculum(newCurriculum);
      saveCurriculum(newCurriculum);

      if (newCurriculum.activities.length > 0) {
        setCurrentActivity(newCurriculum.activities[0]);
        setView("activity");
      }
    } catch (err) {
      console.error("Failed to generate curriculum:", err);
      setError("Failed to generate curriculum. Please try again.");
      setView("activity");
    }
  };

  const handleOnboardingComplete = () => {
    const childData = getChild();
    const toysData = getToys();

    if (childData && toysData.length > 0) {
      setChild(childData);
      setToys(toysData);
      setView("generating");
      generateNewCurriculum(childData, toysData);
    }
  };

  const handleActivityComplete = () => {
    if (!currentActivity) return;

    updateActivityStatus(currentActivity.id, "completed");
    setView("feedback");
  };

  const handleActivitySkip = () => {
    if (!currentActivity) return;

    updateActivityStatus(currentActivity.id, "skipped");

    const nextActivity = advanceToNextActivity();
    if (nextActivity) {
      setCurrentActivity(nextActivity);
      // Refresh curriculum from storage
      const updated = getCurrentCurriculum();
      setCurriculum(updated);
    } else {
      // All activities done
      const updated = getCurrentCurriculum();
      setCurriculum(updated);
      setView("summary");
    }
  };

  const handleRegenerate = async () => {
    if (!currentActivity || !child || !toys.length) return;

    setIsRegenerating(true);
    try {
      const newActivity = await regenerateActivity(
        child,
        toys,
        currentActivity,
        "The child wasn't interested in this activity"
      );

      // Update the activity in the curriculum
      if (curriculum) {
        const updatedActivities = curriculum.activities.map((a) =>
          a.id === currentActivity.id ? { ...newActivity, id: a.id } : a
        );
        const updatedCurriculum = {
          ...curriculum,
          activities: updatedActivities,
        };
        setCurriculum(updatedCurriculum);
        saveCurriculum(updatedCurriculum);
        setCurrentActivity({ ...newActivity, id: currentActivity.id });
      }
    } catch (err) {
      console.error("Failed to regenerate activity:", err);
      setError("Failed to generate a new activity. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFeedbackSubmit = (feedback: ActivityFeedback) => {
    if (!currentActivity) return;

    // Save feedback to history
    addLessonHistory(currentActivity.id, feedback);

    // Move to next activity
    const nextActivity = advanceToNextActivity();
    if (nextActivity) {
      setCurrentActivity(nextActivity);
      // Refresh curriculum from storage
      const updated = getCurrentCurriculum();
      setCurriculum(updated);
      setView("activity");
    } else {
      // All activities done
      const updated = getCurrentCurriculum();
      setCurriculum(updated);
      setView("summary");
    }
  };

  const handleStartNewDay = useCallback(() => {
    if (child && toys.length > 0) {
      setView("generating");
      generateNewCurriculum(child, toys);
    }
  }, [child, toys]);

  const handleManageToysClick = () => {
    setView("manage-toys");
  };

  const handleManageToysClose = () => {
    // Refresh toys from storage
    setToys(getToys());
    setView(curriculum?.status === "completed" ? "summary" : "activity");
  };

  // Render based on current view
  if (view === "loading") {
    return <LoadingScreen message="Loading..." />;
  }

  if (view === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === "generating") {
    return (
      <LoadingScreen
        message="Creating today's curriculum..."
        childName={child?.name}
      />
    );
  }

  if (view === "manage-toys") {
    return <ManageToys initialToys={toys} onClose={handleManageToysClose} />;
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      {child && (
        <Header childName={child.name} onSettingsClick={handleManageToysClick} />
      )}

      <div className="flex-1 px-6 pb-8">
        {error && (
          <div className="mb-4 p-4 bg-terracotta-100 text-terracotta-800 rounded-xl">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === "activity" && currentActivity && curriculum && (
            <ActivityCard
              key={`activity-${currentActivity.id}`}
              activity={currentActivity}
              activityNumber={curriculum.currentActivityIndex + 1}
              totalActivities={curriculum.activities.length}
              onComplete={handleActivityComplete}
              onSkip={handleActivitySkip}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
            />
          )}

          {view === "feedback" && currentActivity && (
            <FeedbackForm
              key={`feedback-${currentActivity.id}`}
              activity={currentActivity}
              onSubmit={handleFeedbackSubmit}
              isLastActivity={
                curriculum
                  ? curriculum.currentActivityIndex ===
                    curriculum.activities.length - 1
                  : false
              }
            />
          )}

          {view === "summary" && curriculum && child && (
            <DaySummary
              curriculum={curriculum}
              childName={child.name}
              onStartNewDay={handleStartNewDay}
              onManageToys={handleManageToysClick}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
