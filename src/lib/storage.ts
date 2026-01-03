/**
 * Storage abstraction layer
 * Currently uses localStorage, but can be easily swapped for Supabase
 */

import type {
  AppState,
  Child,
  ChildProfile,
  Toy,
  LearningSession,
  LessonHistory,
  ActivityFeedback,
  Activity,
  SkillArea,
} from "@/types";

const STORAGE_KEY = "homeschool-gpt-state";

// Default state
const defaultState: AppState = {
  child: null,
  childProfile: null,
  toyHistory: [],
  currentSession: null,
  lessonHistory: [],
  onboardingCompleted: false,
};

// Get the full app state
export function getAppState(): AppState {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;

    // Handle migration from old state format
    const parsed = JSON.parse(stored);

    // Migrate old 'toys' to 'toyHistory' if needed
    if (parsed.toys && !parsed.toyHistory) {
      parsed.toyHistory = parsed.toys;
      delete parsed.toys;
    }

    // Migrate old 'currentCurriculum' to 'currentSession' if needed
    if (parsed.currentCurriculum && !parsed.currentSession) {
      parsed.currentSession = {
        ...parsed.currentCurriculum,
        selectedToyIds: parsed.toyHistory?.map((t: Toy) => t.id) || [],
      };
      delete parsed.currentCurriculum;
    }

    return { ...defaultState, ...parsed } as AppState;
  } catch {
    return defaultState;
  }
}

// Save the full app state
function saveAppState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Child operations
export function getChild(): Child | null {
  return getAppState().child;
}

export function saveChild(child: Child): void {
  const state = getAppState();
  state.child = child;
  saveAppState(state);
}

// Child profile operations
export function getChildProfile(): ChildProfile | null {
  return getAppState().childProfile;
}

export function saveChildProfile(profile: ChildProfile): void {
  const state = getAppState();
  state.childProfile = profile;
  saveAppState(state);
}

export function initializeChildProfile(childId: string): ChildProfile {
  const profile: ChildProfile = {
    childId,
    lastUpdated: new Date().toISOString(),
    skillLevels: {},
    strengths: [],
    areasForGrowth: [],
    observations: [],
    preferredActivityTypes: [],
    avoidances: [],
    developmentNotes: "",
    activitiesCompleted: 0,
  };
  saveChildProfile(profile);
  return profile;
}

// Toy History operations (all toys ever added)
export function getToyHistory(): Toy[] {
  return getAppState().toyHistory;
}

export function addToToyHistory(toy: Toy): void {
  const state = getAppState();
  // Only add if not already in history
  if (!state.toyHistory.some((t) => t.id === toy.id)) {
    state.toyHistory.push(toy);
    saveAppState(state);
  }
}

export function addMultipleToToyHistory(toys: Toy[]): void {
  const state = getAppState();
  toys.forEach((toy) => {
    if (!state.toyHistory.some((t) => t.id === toy.id)) {
      state.toyHistory.push(toy);
    }
  });
  saveAppState(state);
}

export function removeFromToyHistory(toyId: string): void {
  const state = getAppState();
  state.toyHistory = state.toyHistory.filter((t) => t.id !== toyId);
  saveAppState(state);
}

// Get toys by IDs (for getting session toys from history)
export function getToysByIds(toyIds: string[]): Toy[] {
  const history = getToyHistory();
  return history.filter((t) => toyIds.includes(t.id));
}

// Session operations
export function getCurrentSession(): LearningSession | null {
  return getAppState().currentSession;
}

export function hasActiveSession(): boolean {
  const session = getCurrentSession();
  return session !== null && session.status === "in-progress";
}

export function saveSession(session: LearningSession): void {
  const state = getAppState();
  state.currentSession = session;
  saveAppState(state);
}

export function clearSession(): void {
  const state = getAppState();
  state.currentSession = null;
  saveAppState(state);
}

export function updateActivityStatus(
  activityId: string,
  status: Activity["status"]
): void {
  const state = getAppState();
  if (!state.currentSession) return;

  const activity = state.currentSession.activities.find(
    (a) => a.id === activityId
  );
  if (activity) {
    activity.status = status;
  }
  saveAppState(state);
}

export function advanceToNextActivity(): Activity | null {
  const state = getAppState();
  if (!state.currentSession) return null;

  const nextIndex = state.currentSession.currentActivityIndex + 1;
  if (nextIndex >= state.currentSession.activities.length) {
    state.currentSession.status = "completed";
    saveAppState(state);
    return null;
  }

  state.currentSession.currentActivityIndex = nextIndex;
  saveAppState(state);
  return state.currentSession.activities[nextIndex];
}

// History operations
export function getLessonHistory(limit?: number): LessonHistory[] {
  const history = getAppState().lessonHistory;
  if (limit) {
    return history.slice(-limit);
  }
  return history;
}

export function addLessonHistory(
  activityId: string,
  activityTitle: string,
  skillAreas: SkillArea[],
  feedback: ActivityFeedback
): void {
  const state = getAppState();
  const historyEntry: LessonHistory = {
    id: crypto.randomUUID(),
    activityId,
    activityTitle,
    skillAreas,
    date: new Date().toISOString(),
    feedback,
  };
  state.lessonHistory.push(historyEntry);
  saveAppState(state);
}

// Onboarding
export function isOnboardingCompleted(): boolean {
  return getAppState().onboardingCompleted;
}

export function completeOnboarding(): void {
  const state = getAppState();
  state.onboardingCompleted = true;
  saveAppState(state);
}

// Reset (for development/testing)
export function resetAppState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
