/**
 * Storage abstraction layer
 * Currently uses localStorage, but can be easily swapped for Supabase
 */

import type {
  AppState,
  Child,
  ChildProfile,
  Toy,
  DayCurriculum,
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
  toys: [],
  currentCurriculum: null,
  lessonHistory: [],
  onboardingCompleted: false,
};

// Get the full app state
export function getAppState(): AppState {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    return JSON.parse(stored) as AppState;
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

// Toys operations
export function getToys(): Toy[] {
  return getAppState().toys;
}

export function saveToys(toys: Toy[]): void {
  const state = getAppState();
  state.toys = toys;
  saveAppState(state);
}

export function addToy(toy: Toy): void {
  const state = getAppState();
  state.toys.push(toy);
  saveAppState(state);
}

export function removeToy(toyId: string): void {
  const state = getAppState();
  state.toys = state.toys.filter((t) => t.id !== toyId);
  saveAppState(state);
}

// Curriculum operations
export function getCurrentCurriculum(): DayCurriculum | null {
  const state = getAppState();

  // Check if curriculum is from today
  if (state.currentCurriculum) {
    const currDate = new Date(state.currentCurriculum.date).toDateString();
    const today = new Date().toDateString();
    if (currDate !== today) {
      // Curriculum is stale, return null to trigger regeneration
      return null;
    }
  }

  return state.currentCurriculum;
}

export function saveCurriculum(curriculum: DayCurriculum): void {
  const state = getAppState();
  state.currentCurriculum = curriculum;
  saveAppState(state);
}

export function updateActivityStatus(
  activityId: string,
  status: Activity["status"]
): void {
  const state = getAppState();
  if (!state.currentCurriculum) return;

  const activity = state.currentCurriculum.activities.find(
    (a) => a.id === activityId
  );
  if (activity) {
    activity.status = status;
  }
  saveAppState(state);
}

export function advanceToNextActivity(): Activity | null {
  const state = getAppState();
  if (!state.currentCurriculum) return null;

  const nextIndex = state.currentCurriculum.currentActivityIndex + 1;
  if (nextIndex >= state.currentCurriculum.activities.length) {
    state.currentCurriculum.status = "completed";
    saveAppState(state);
    return null;
  }

  state.currentCurriculum.currentActivityIndex = nextIndex;
  saveAppState(state);
  return state.currentCurriculum.activities[nextIndex];
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
