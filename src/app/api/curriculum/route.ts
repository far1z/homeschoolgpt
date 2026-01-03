import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  GenerateCurriculumRequest,
  Activity,
  SkillArea,
} from "@/types";

const anthropic = new Anthropic();

function getAgeDescription(ageInMonths: number): string {
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  if (years === 0) return `${months} months old`;
  if (months === 0) return `${years} year${years > 1 ? "s" : ""} old`;
  return `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""} old`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCurriculumRequest = await request.json();
    const { child, childProfile, toys, recentHistory } = body;

    const toyList = toys.map((t) => `- ${t.name} (${t.category})`).join("\n");
    const ageDescription = getAgeDescription(child.age);

    // Build child profile context
    let profileContext = "";
    if (childProfile && childProfile.activitiesCompleted > 0) {
      const skillLevelStr = Object.entries(childProfile.skillLevels)
        .map(([skill, data]) => {
          const trendEmoji = data?.trend === "improving" ? "↑" : data?.trend === "needs-attention" ? "↓" : "→";
          return `  - ${skill}: Level ${data?.level}/5 ${trendEmoji}`;
        })
        .join("\n");

      profileContext = `
=== CHILD PROFILE (${childProfile.activitiesCompleted} activities completed) ===

STRENGTHS (build on these):
${childProfile.strengths.length > 0 ? childProfile.strengths.map(s => `  ✓ ${s}`).join("\n") : "  Still learning about this child"}

AREAS FOR GROWTH (gently challenge):
${childProfile.areasForGrowth.length > 0 ? childProfile.areasForGrowth.map(a => `  • ${a}`).join("\n") : "  Still learning about this child"}

SKILL LEVELS:
${skillLevelStr || "  Not yet assessed"}

PREFERRED ACTIVITY TYPES:
${childProfile.preferredActivityTypes.length > 0 ? childProfile.preferredActivityTypes.map(p => `  ♥ ${p}`).join("\n") : "  Still discovering preferences"}

ACTIVITIES TO AVOID OR MODIFY:
${childProfile.avoidances.length > 0 ? childProfile.avoidances.map(a => `  ✗ ${a}`).join("\n") : "  None noted"}

RECENT OBSERVATIONS:
${childProfile.observations.length > 0 ? childProfile.observations.slice(-3).map(o => `  → ${o}`).join("\n") : "  None yet"}

DEVELOPMENT NOTES:
${childProfile.developmentNotes || "  No notes yet"}

=== END PROFILE ===
`;
    }

    // Build context from recent history
    let historyContext = "";
    if (recentHistory.length > 0) {
      const recentFeedback = recentHistory.slice(-5).map((h) => {
        const engagement =
          h.feedback.engagement >= 4
            ? "highly engaged"
            : h.feedback.engagement >= 3
              ? "moderately engaged"
              : "low engagement";
        const completion =
          h.feedback.completion === "completed"
            ? "completed successfully"
            : h.feedback.completion === "exceeded"
              ? "exceeded expectations"
              : h.feedback.completion === "partial"
                ? "partially completed"
                : "not completed";
        return `- "${h.activityTitle}" (${h.skillAreas.join(", ")}): ${engagement}, ${completion}${h.feedback.challenges ? ` | Challenges: ${h.feedback.challenges}` : ""}${h.feedback.highlights ? ` | Highlights: ${h.feedback.highlights}` : ""}`;
      });
      historyContext = `\n\nRECENT ACTIVITIES (last 5):\n${recentFeedback.join("\n")}`;
    }

    const systemPrompt = `You are an expert early childhood educator specializing in play-based learning for toddlers. You create developmentally appropriate, engaging activities that use available materials.

Your activities should:
- Be appropriate for the child's age and developmental stage
- Use only the available toys/materials listed
- Balance different skill areas (motor, language, cognitive, social-emotional, sensory, creativity)
- Be realistic in duration (5-20 minutes for toddlers)
- Include clear, simple instructions for caregivers
- Be fun and engaging for young children

IMPORTANT: When a child profile is provided, you MUST:
1. Design activities that BUILD ON their strengths to maintain confidence
2. GENTLY challenge areas for growth without overwhelming
3. FAVOR their preferred activity types when possible
4. AVOID or significantly MODIFY activity types that haven't worked
5. Consider their skill levels when setting difficulty
6. Use recent observations to personalize the experience

Always respond with valid JSON only, no additional text.`;

    const userPrompt = `Create a day's curriculum of 4-5 activities for ${child.name}, who is ${ageDescription}.
${profileContext}
Available toys and materials:
${toyList}
${historyContext}

Create a PERSONALIZED curriculum that:
1. Uses only the available materials
2. Is appropriate for a ${ageDescription} child
3. ${childProfile?.activitiesCompleted ? "Takes into account the child's profile, strengths, and areas for growth" : "Provides a balanced introduction to different skill areas"}
4. Builds progressively from simpler to more complex
5. Includes variety - some activities they'll excel at, some that gently stretch their abilities
6. ${childProfile?.preferredActivityTypes?.length ? `Incorporates their preferred types: ${childProfile.preferredActivityTypes.join(", ")}` : "Explores different activity types to discover preferences"}

Respond with a JSON object in this exact format:
{
  "activities": [
    {
      "id": "unique-id-1",
      "title": "Activity Name",
      "description": "Brief description of what the child will do and learn. Reference how this connects to their strengths or growth areas if applicable.",
      "instructions": [
        "Step 1 for the caregiver",
        "Step 2 for the caregiver",
        "Step 3 for the caregiver"
      ],
      "materials": ["Material 1", "Material 2"],
      "duration": 10,
      "skillAreas": ["motor-fine", "cognitive"]
    }
  ]
}

Valid skillAreas are: "motor-fine", "motor-gross", "language", "cognitive", "social-emotional", "sensory", "creativity"

Respond with ONLY the JSON, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract text content
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse the JSON response
    let activities: Activity[];
    try {
      const parsed = JSON.parse(textContent.text);
      activities = parsed.activities.map(
        (
          a: {
            id?: string;
            title: string;
            description: string;
            instructions: string[];
            materials: string[];
            duration: number;
            skillAreas: SkillArea[];
          },
          index: number
        ) => ({
          id: a.id || `activity-${index}`,
          title: a.title,
          description: a.description,
          instructions: a.instructions,
          materials: a.materials,
          duration: a.duration,
          skillAreas: a.skillAreas,
          status: "pending" as const,
          order: index,
        })
      );
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Invalid response format from Claude");
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return NextResponse.json(
      { error: "Failed to generate curriculum" },
      { status: 500 }
    );
  }
}
