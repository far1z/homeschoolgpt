// Google Analytics utility functions

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = "G-5ZTYFW6MHV";

// Track page views
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

// Track custom events
export function trackEvent({ action, category, label, value, ...params }: GTagEvent) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
}

// Convenience functions for common event categories

export const analytics = {
  // Onboarding events
  onboarding: {
    started: () =>
      trackEvent({ action: "onboarding_started", category: "onboarding" }),
    childNameEntered: () =>
      trackEvent({ action: "child_name_entered", category: "onboarding" }),
    ageSet: (ageMonths: number) =>
      trackEvent({ action: "age_set", category: "onboarding", value: ageMonths }),
    completed: (ageMonths: number) =>
      trackEvent({ action: "onboarding_completed", category: "onboarding", value: ageMonths }),
    stepBack: () =>
      trackEvent({ action: "step_back", category: "onboarding" }),
  },

  // Toy selection events
  toys: {
    pageViewed: () =>
      trackEvent({ action: "toy_selection_viewed", category: "toys" }),
    toggled: (toyName: string, isSelected: boolean) =>
      trackEvent({
        action: isSelected ? "toy_selected" : "toy_deselected",
        category: "toys",
        label: toyName,
      }),
    addedManual: (toyName: string, category: string) =>
      trackEvent({
        action: "toy_added_manual",
        category: "toys",
        label: toyName,
        toy_category: category,
      }),
    addedQuickSuggest: (toyName: string) =>
      trackEvent({
        action: "toy_added_quick_suggest",
        category: "toys",
        label: toyName,
      }),
    addFormOpened: () =>
      trackEvent({ action: "add_toy_form_opened", category: "toys" }),
    addFormClosed: () =>
      trackEvent({ action: "add_toy_form_closed", category: "toys" }),
    sessionStarted: (toyCount: number) =>
      trackEvent({
        action: "session_started",
        category: "toys",
        value: toyCount,
      }),
  },

  // Camera events
  camera: {
    opened: () =>
      trackEvent({ action: "camera_opened", category: "camera" }),
    photoCaptured: () =>
      trackEvent({ action: "photo_captured", category: "camera" }),
    photoRetaken: () =>
      trackEvent({ action: "photo_retaken", category: "camera" }),
    analyzed: () =>
      trackEvent({ action: "photo_analyzed", category: "camera" }),
    detectionSuccess: (toyName: string) =>
      trackEvent({
        action: "toy_detection_success",
        category: "camera",
        label: toyName,
      }),
    detectionFailed: () =>
      trackEvent({ action: "toy_detection_failed", category: "camera" }),
    toyConfirmed: (toyName: string) =>
      trackEvent({
        action: "detected_toy_confirmed",
        category: "camera",
        label: toyName,
      }),
    closed: () =>
      trackEvent({ action: "camera_closed", category: "camera" }),
  },

  // Session events
  session: {
    generating: (toyCount: number) =>
      trackEvent({
        action: "session_generating",
        category: "session",
        value: toyCount,
      }),
    generated: (activityCount: number) =>
      trackEvent({
        action: "session_generated",
        category: "session",
        value: activityCount,
      }),
    generationError: (error: string) =>
      trackEvent({
        action: "session_generation_error",
        category: "session",
        label: error,
      }),
    recoveryShown: () =>
      trackEvent({ action: "recovery_prompt_shown", category: "session" }),
    recoveryContinued: (completedCount: number) =>
      trackEvent({
        action: "session_continued",
        category: "session",
        value: completedCount,
      }),
    recoveryRestarted: () =>
      trackEvent({ action: "session_restarted", category: "session" }),
    completed: (completedCount: number, skippedCount: number) =>
      trackEvent({
        action: "session_completed",
        category: "session",
        value: completedCount,
        skipped_count: skippedCount,
      }),
  },

  // Activity events
  activity: {
    viewed: (activityTitle: string, activityNumber: number) =>
      trackEvent({
        action: "activity_viewed",
        category: "activity",
        label: activityTitle,
        value: activityNumber,
      }),
    completed: (activityTitle: string) =>
      trackEvent({
        action: "activity_completed",
        category: "activity",
        label: activityTitle,
      }),
    skipped: (activityTitle: string) =>
      trackEvent({
        action: "activity_skipped",
        category: "activity",
        label: activityTitle,
      }),
    differentRequested: (activityTitle: string) =>
      trackEvent({
        action: "different_activity_requested",
        category: "activity",
        label: activityTitle,
      }),
    regenerated: (reason: string) =>
      trackEvent({
        action: "activity_regenerated",
        category: "activity",
        label: reason,
      }),
    regenerationError: () =>
      trackEvent({ action: "activity_regeneration_error", category: "activity" }),
  },

  // Feedback events
  feedback: {
    formViewed: (activityTitle: string) =>
      trackEvent({
        action: "feedback_form_viewed",
        category: "feedback",
        label: activityTitle,
      }),
    engagementSelected: (level: number) =>
      trackEvent({
        action: "engagement_selected",
        category: "feedback",
        value: level,
      }),
    completionSelected: (level: string) =>
      trackEvent({
        action: "completion_selected",
        category: "feedback",
        label: level,
      }),
    notesToggled: () =>
      trackEvent({ action: "notes_toggled", category: "feedback" }),
    submitted: (engagementLevel: number, completionLevel: string) =>
      trackEvent({
        action: "feedback_submitted",
        category: "feedback",
        value: engagementLevel,
        completion_level: completionLevel,
      }),
  },

  // Summary events
  summary: {
    viewed: (completedCount: number, totalCount: number) =>
      trackEvent({
        action: "summary_viewed",
        category: "summary",
        value: completedCount,
        total_activities: totalCount,
      }),
    newSessionStarted: () =>
      trackEvent({ action: "new_session_started", category: "summary" }),
  },

  // Settings/Profile events
  settings: {
    opened: () =>
      trackEvent({ action: "settings_opened", category: "settings" }),
    closed: () =>
      trackEvent({ action: "settings_closed", category: "settings" }),
    profileViewed: () =>
      trackEvent({ action: "profile_viewed", category: "settings" }),
  },

  // Landing page events
  landing: {
    heroCtaClicked: () =>
      trackEvent({ action: "hero_cta_clicked", category: "landing" }),
    watchDemoClicked: () =>
      trackEvent({ action: "watch_demo_clicked", category: "landing" }),
    demoStepViewed: (stepIndex: number) =>
      trackEvent({
        action: "demo_step_viewed",
        category: "landing",
        value: stepIndex,
      }),
    finalCtaClicked: () =>
      trackEvent({ action: "final_cta_clicked", category: "landing" }),
    featureViewed: (featureTitle: string) =>
      trackEvent({
        action: "feature_viewed",
        category: "landing",
        label: featureTitle,
      }),
  },

  // Error events
  error: {
    displayed: (errorMessage: string, context: string) =>
      trackEvent({
        action: "error_displayed",
        category: "error",
        label: errorMessage,
        error_context: context,
      }),
    dismissed: () =>
      trackEvent({ action: "error_dismissed", category: "error" }),
  },
};
