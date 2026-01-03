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

export interface DayCurriculum {
  id: string;
  date: string;
  childId: string;
  activities: Activity[];
  currentActivityIndex: number;
  status: "in-progress" | "completed";
  generatedAt: string;
}

export interface LessonHistory {
  id: string;
  activityId: string;
  date: string;
  feedback: ActivityFeedback;
}

// App state stored in localStorage
export interface AppState {
  child: Child | null;
  toys: Toy[];
  currentCurriculum: DayCurriculum | null;
  lessonHistory: LessonHistory[];
  onboardingCompleted: boolean;
}

// API request/response types
export interface GenerateCurriculumRequest {
  child: Child;
  toys: Toy[];
  recentHistory: LessonHistory[];
  date: string;
}

export interface GenerateCurriculumResponse {
  activities: Activity[];
}
