"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";

import type {
  Child,
  ChildProfile,
  Toy,
  LearningSession,
  Activity,
  ActivityFeedback,
} from "@/types";
import {
  getAppState,
  getChild,
  getChildProfile,
  getToyHistory,
  getToysByIds,
  getCurrentSession,
  saveSession,
  saveChildProfile,
  addToToyHistory,
  clearSession,
  updateActivityStatus,
  advanceToNextActivity,
  addLessonHistory,
  getLessonHistory,
} from "@/lib/storage";
import { generateSession, regenerateActivity, updateChildProfile, updateProfileWithActivitySkip } from "@/lib/api";

import Onboarding from "@/components/Onboarding";
import ToySelection from "@/components/ToySelection";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";
import ActivityCard from "@/components/ActivityCard";
import FeedbackForm from "@/components/FeedbackForm";
import SessionSummary from "@/components/SessionSummary";

type AppView =
  | "loading"
  | "onboarding"
  | "toy-selection"
  | "generating"
  | "activity"
  | "feedback"
  | "summary";

export default function Home() {
  const [view, setView] = useState<AppView>("loading");
  const [child, setChild] = useState<Child | null>(null);
  const [childProfile, setChildProfileState] = useState<ChildProfile | null>(null);
  const [toyHistory, setToyHistory] = useState<Toy[]>([]);
  const [sessionToys, setSessionToys] = useState<Toy[]>([]);
  const [session, setSession] = useState<LearningSession | null>(null);
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
    setChildProfileState(state.childProfile);
    setToyHistory(state.toyHistory);

    const existingSession = getCurrentSession();

    if (existingSession && existingSession.status === "in-progress") {
      // Resume existing session
      setSession(existingSession);
      setSessionToys(getToysByIds(existingSession.selectedToyIds));
      const activity = existingSession.activities[existingSession.currentActivityIndex];
      setCurrentActivity(activity);
      setView("activity");
    } else if (existingSession && existingSession.status === "completed") {
      // Show summary of completed session
      setSession(existingSession);
      setSessionToys(getToysByIds(existingSession.selectedToyIds));
      setView("summary");
    } else {
      // Start fresh - select toys
      setView("toy-selection");
    }
  }, []);

  const handleOnboardingComplete = () => {
    const childData = getChild();
    const profile = getChildProfile();

    if (childData) {
      setChild(childData);
      setChildProfileState(profile);
      setView("toy-selection");
    }
  };

  const handleAddToHistory = (toy: Toy) => {
    addToToyHistory(toy);
    setToyHistory((prev) => [...prev, toy]);
  };

  const handleStartSession = async (selectedToys: Toy[]) => {
    if (!child) return;

    setSessionToys(selectedToys);
    setView("generating");

    try {
      setError(null);
      const recentHistory = getLessonHistory(10);
      const newSession = await generateSession(
        child,
        childProfile,
        selectedToys,
        recentHistory
      );

      setSession(newSession);
      saveSession(newSession);

      if (newSession.activities.length > 0) {
        setCurrentActivity(newSession.activities[0]);
        setView("activity");
      }
    } catch (err) {
      console.error("Failed to generate session:", err);
      setError("Failed to generate activities. Please try again.");
      setView("toy-selection");
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
      const updated = getCurrentSession();
      setSession(updated);
    } else {
      const updated = getCurrentSession();
      setSession(updated);
      setView("summary");
    }
  };

  const handleRegenerate = async (reason: string, notes: string) => {
    if (!currentActivity || !child || !sessionToys.length) return;

    setIsRegenerating(true);
    try {
      const newActivity = await regenerateActivity(
        child,
        childProfile,
        sessionToys,
        currentActivity,
        reason,
        notes
      );

      if (session) {
        const updatedActivities = session.activities.map((a) =>
          a.id === currentActivity.id ? { ...newActivity, id: a.id } : a
        );
        const updatedSession = {
          ...session,
          activities: updatedActivities,
        };
        setSession(updatedSession);
        saveSession(updatedSession);
        setCurrentActivity({ ...newActivity, id: currentActivity.id });
      }

      // Update child profile with skip feedback in background
      updateProfileWithActivitySkip(
        child.id,
        childProfile,
        {
          title: currentActivity.title,
          skillAreas: currentActivity.skillAreas,
        },
        reason,
        notes
      )
        .then((updatedProfile) => {
          setChildProfileState(updatedProfile);
          saveChildProfile(updatedProfile);
        })
        .catch((err) => {
          console.error("Failed to update profile with skip feedback:", err);
        });
    } catch (err) {
      console.error("Failed to regenerate activity:", err);
      setError("Failed to generate a new activity. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: ActivityFeedback) => {
    if (!currentActivity || !child) return;

    // Save feedback to history
    addLessonHistory(
      currentActivity.id,
      currentActivity.title,
      currentActivity.skillAreas,
      feedback
    );

    // Update child profile in background
    updateChildProfile(
      child.id,
      childProfile,
      {
        title: currentActivity.title,
        skillAreas: currentActivity.skillAreas,
      },
      feedback,
      getLessonHistory(10)
    )
      .then((updatedProfile) => {
        setChildProfileState(updatedProfile);
        saveChildProfile(updatedProfile);
      })
      .catch((err) => {
        console.error("Failed to update child profile:", err);
      });

    // Move to next activity
    const nextActivity = advanceToNextActivity();
    if (nextActivity) {
      setCurrentActivity(nextActivity);
      const updated = getCurrentSession();
      setSession(updated);
      setView("activity");
    } else {
      const updated = getCurrentSession();
      setSession(updated);
      setView("summary");
    }
  };

  const handleStartNewSession = useCallback(() => {
    clearSession();
    setSession(null);
    setCurrentActivity(null);
    setSessionToys([]);
    // Refresh toy history
    setToyHistory(getToyHistory());
    setChildProfileState(getChildProfile());
    setView("toy-selection");
  }, []);

  // Render based on current view
  if (view === "loading") {
    return <LoadingScreen message="Loading..." />;
  }

  if (view === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === "toy-selection" && child) {
    return (
      <ToySelection
        childName={child.name}
        toyHistory={toyHistory}
        onStartSession={handleStartSession}
        onAddToHistory={handleAddToHistory}
      />
    );
  }

  if (view === "generating") {
    return (
      <LoadingScreen
        message="Creating activities..."
        childName={child?.name}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      {child && view !== "summary" && (
        <Header childName={child.name} />
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
          {view === "activity" && currentActivity && session && (
            <ActivityCard
              key={`activity-${currentActivity.id}`}
              activity={currentActivity}
              activityNumber={session.currentActivityIndex + 1}
              totalActivities={session.activities.length}
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
                session
                  ? session.currentActivityIndex ===
                    session.activities.length - 1
                  : false
              }
            />
          )}

          {view === "summary" && session && child && (
            <SessionSummary
              session={session}
              childName={child.name}
              onStartNewSession={handleStartNewSession}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
