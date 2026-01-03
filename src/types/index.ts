// Core data types for HomeschoolGPT

export interface Child {
  id: string;
  name: string;
  age: number; // in months for precision with toddlers
  createdAt: string;
}

export interface Toy {
  id: string;
  name: string;
  category: ToyCategory;
  description?: string;
}

export type ToyCategory =
  | "blocks"
  | "art"
  | "books"
  | "puzzles"
  | "music"
  | "pretend-play"
  | "outdoor"
  | "sensory"
  | "motor-skills"
  | "other";

export const TOY_CATEGORIES: { value: ToyCategory; label: string; emoji: string }[] = [
  { value: "blocks", label: "Blocks & Building", emoji: "🧱" },
  { value: "art", label: "Art & Craft Supplies", emoji: "🎨" },
  { value: "books", label: "Books", emoji: "📚" },
  { value: "puzzles", label: "Puzzles & Games", emoji: "🧩" },
  { value: "music", label: "Musical Instruments", emoji: "🎵" },
  { value: "pretend-play", label: "Pretend Play", emoji: "🎭" },
  { value: "outdoor", label: "Outdoor Toys", emoji: "🌳" },
  { value: "sensory", label: "Sensory Toys", emoji: "✨" },
  { value: "motor-skills", label: "Motor Skills", emoji: "🤹" },
  { value: "other", label: "Other", emoji: "🎁" },
];

export interface Activity {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  materials: string[];
  duration: number; // in minutes
  skillAreas: SkillArea[];
  status: ActivityStatus;
  order: number;
}

export type SkillArea =
  | "motor-fine"
  | "motor-gross"
  | "language"
  | "cognitive"
  | "social-emotional"
  | "sensory"
  | "creativity";

export const SKILL_AREAS: { value: SkillArea; label: string; color: string }[] = [
  { value: "motor-fine", label: "Fine Motor", color: "terracotta" },
  { value: "motor-gross", label: "Gross Motor", color: "sage" },
  { value: "language", label: "Language", color: "honey" },
  { value: "cognitive", label: "Cognitive", color: "navy" },
  { value: "social-emotional", label: "Social-Emotional", color: "terracotta" },
  { value: "sensory", label: "Sensory", color: "sage" },
  { value: "creativity", label: "Creativity", color: "honey" },
];

export type ActivityStatus = "pending" | "in-progress" | "completed" | "skipped";

export interface ActivityFeedback {
  id: string;
  activityId: string;
  date: string;
  engagement: EngagementLevel;
  completion: CompletionLevel;
  notes?: string;
  challenges?: string;
  highlights?: string;
}

export type EngagementLevel = 1 | 2 | 3 | 4 | 5;
export type CompletionLevel = "not-started" | "partial" | "completed" | "exceeded";

// A learning session - created each time they select toys and start
export interface LearningSession {
  id: string;
  date: string;
  childId: string;
  selectedToyIds: string[]; // toys chosen for this session
  activities: Activity[];
  currentActivityIndex: number;
  status: "in-progress" | "completed";
  generatedAt: string;
}

export interface LessonHistory {
  id: string;
  activityId: string;
  activityTitle: string;
  skillAreas: SkillArea[];
  date: string;
  feedback: ActivityFeedback;
}

// Child profile - built up over time from activity feedback
export interface ChildProfile {
  childId: string;
  lastUpdated: string;

  // Skill levels (1-5 scale based on activity performance)
  skillLevels: {
    [key in SkillArea]?: {
      level: number; // 1-5
      trend: "improving" | "stable" | "needs-attention";
      lastAssessed: string;
    };
  };

  // What the child enjoys and excels at
  strengths: string[];

  // Areas that need more practice or different approaches
  areasForGrowth: string[];

  // Specific observations from caregivers
  observations: string[];

  // Preferred activity types based on engagement
  preferredActivityTypes: string[];

  // Activities/approaches that didn't work well
  avoidances: string[];

  // Overall developmental notes
  developmentNotes: string;

  // Number of activities completed
  activitiesCompleted: number;
}

// App state stored in localStorage
export interface AppState {
  child: Child | null;
  childProfile: ChildProfile | null;
  toyHistory: Toy[]; // all toys ever added - for quick re-selection
  currentSession: LearningSession | null;
  lessonHistory: LessonHistory[];
  onboardingCompleted: boolean;
}

// API request/response types
export interface GenerateCurriculumRequest {
  child: Child;
  childProfile: ChildProfile | null;
  toys: Toy[];
  recentHistory: LessonHistory[];
  date: string;
}

export interface GenerateCurriculumResponse {
  activities: Activity[];
}

// Profile update request
export interface UpdateProfileRequest {
  childId: string;
  currentProfile: ChildProfile | null;
  activity: {
    title: string;
    skillAreas: SkillArea[];
  };
  feedback: ActivityFeedback;
  recentHistory: LessonHistory[];
}

export interface UpdateProfileResponse {
  profile: ChildProfile;
}
