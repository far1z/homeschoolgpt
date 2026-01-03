import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Activity, Child, Toy, SkillArea } from "@/types";

const anthropic = new Anthropic();

interface RegenerateRequest {
  child: Child;
  toys: Toy[];
  currentActivity: Activity;
  feedback: string;
}

function getAgeDescription(ageInMonths: number): string {
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  if (years === 0) return `${months} months old`;
  if (months === 0) return `${years} year${years > 1 ? "s" : ""} old`;
  return `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""} old`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegenerateRequest = await request.json();
    const { child, toys, currentActivity, feedback } = body;

    const toyList = toys.map((t) => `- ${t.name} (${t.category})`).join("\n");
    const ageDescription = getAgeDescription(child.age);

    const systemPrompt = `You are an expert early childhood educator specializing in play-based learning for toddlers. You adapt activities based on feedback to better suit the child's needs and interests.

Always respond with valid JSON only, no additional text.`;

    const userPrompt = `The current activity didn't work well for ${child.name} (${ageDescription}).

Current activity that needs replacement:
- Title: ${currentActivity.title}
- Description: ${currentActivity.description}
- Skill areas: ${currentActivity.skillAreas.join(", ")}

Caregiver feedback: "${feedback}"

Available toys and materials:
${toyList}

Create a NEW activity that:
1. Addresses the issues mentioned in the feedback
2. Targets similar skill areas: ${currentActivity.skillAreas.join(", ")}
3. Uses available materials
4. Is more likely to engage the child based on the feedback

Respond with a JSON object in this exact format:
{
  "activity": {
    "id": "unique-id",
    "title": "Activity Name",
    "description": "Brief description",
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "materials": ["Material 1", "Material 2"],
    "duration": 10,
    "skillAreas": ["motor-fine", "cognitive"]
  }
}

Respond with ONLY the JSON, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let activity: Activity;
    try {
      const parsed = JSON.parse(textContent.text);
      const a = parsed.activity;
      activity = {
        id: a.id || `activity-regen-${Date.now()}`,
        title: a.title,
        description: a.description,
        instructions: a.instructions,
        materials: a.materials,
        duration: a.duration,
        skillAreas: a.skillAreas as SkillArea[],
        status: "in-progress",
        order: currentActivity.order,
      };
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Invalid response format from Claude");
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error regenerating activity:", error);
    return NextResponse.json(
      { error: "Failed to regenerate activity" },
      { status: 500 }
    );
  }
}
