/**
 * API client abstraction
 * Makes HTTP calls to our Next.js API routes
 * Can be swapped for direct Supabase/external API calls later
 */

import type {
  Child,
  Toy,
  DayCurriculum,
  Activity,
  LessonHistory,
  GenerateCurriculumResponse,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function generateCurriculum(
  child: Child,
  toys: Toy[],
  recentHistory: LessonHistory[]
): Promise<DayCurriculum> {
  const response = await fetch("/api/curriculum", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      child,
      toys,
      recentHistory,
      date: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate curriculum");
  }

  const data: GenerateCurriculumResponse = await response.json();

  // Create the curriculum object
  const curriculum: DayCurriculum = {
    id: uuidv4(),
    date: new Date().toISOString(),
    childId: child.id,
    activities: data.activities.map((activity, index) => ({
      ...activity,
      id: activity.id || uuidv4(),
      status: index === 0 ? "in-progress" : "pending",
      order: index,
    })),
    currentActivityIndex: 0,
    status: "in-progress",
    generatedAt: new Date().toISOString(),
  };

  return curriculum;
}

export async function regenerateActivity(
  child: Child,
  toys: Toy[],
  currentActivity: Activity,
  feedback: string
): Promise<Activity> {
  const response = await fetch("/api/curriculum/regenerate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      child,
      toys,
      currentActivity,
      feedback,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to regenerate activity");
  }

  const data = await response.json();
  return data.activity;
}
