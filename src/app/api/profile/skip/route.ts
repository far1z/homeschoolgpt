import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ChildProfile, SkillArea } from "@/types";

const anthropic = new Anthropic();

interface SkipFeedbackRequest {
  childId: string;
  currentProfile: ChildProfile | null;
  activity: {
    title: string;
    skillAreas: SkillArea[];
  };
  reason: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SkipFeedbackRequest = await request.json();
    const { childId, currentProfile, activity, reason, notes } = body;

    const systemPrompt = `You are an expert early childhood educator analyzing why a caregiver requested a different activity. Use this feedback to update the child's learning profile with insights that will help personalize future activities.

You will receive the current profile (if any) and must return an updated profile that incorporates what we learned from this skip/change request.

Always respond with valid JSON only, no additional text.`;

    const profileContext = currentProfile
      ? `Current Profile:
- Strengths: ${currentProfile.strengths.join(", ") || "None identified yet"}
- Areas for Growth: ${currentProfile.areasForGrowth.join(", ") || "None identified yet"}
- Preferred Activity Types: ${currentProfile.preferredActivityTypes.join(", ") || "None identified yet"}
- Things to Avoid: ${currentProfile.avoidances.join(", ") || "None identified yet"}
- Recent Observations: ${currentProfile.observations.slice(0, 5).join("; ") || "None yet"}
- Development Notes: ${currentProfile.developmentNotes || "None yet"}`
      : "No existing profile - this is our first observation.";

    const userPrompt = `A caregiver requested a different activity instead of completing this one:

Activity Skipped: "${activity.title}"
Skill Areas: ${activity.skillAreas.join(", ")}

Why they wanted something different:
- Reason: ${reason}
${notes !== reason ? `- Additional context: "${notes}"` : ""}

${profileContext}

Based on this feedback, update the child's profile. Consider:
- If "not interested" or "not in mood" - what types of activities might they prefer?
- If "too hard" - note this skill area needs simpler approaches
- If "too easy" - they may be ready for more challenge in this area
- If "no materials" - not a learning insight, ignore for profile
- If "done recently" - they prefer variety, avoid repetition

Return the updated profile in this JSON format:
{
  "profile": {
    "childId": "${childId}",
    "lastUpdated": "${new Date().toISOString()}",
    "skillLevels": ${JSON.stringify(currentProfile?.skillLevels || {})},
    "strengths": ["array of observed strengths"],
    "areasForGrowth": ["areas that need more work"],
    "observations": ["Most recent observation first", "then older ones..."],
    "preferredActivityTypes": ["activity types they respond well to"],
    "avoidances": ["activity types or approaches to avoid"],
    "developmentNotes": "Brief summary of development patterns observed",
    "activitiesCompleted": ${currentProfile?.activitiesCompleted || 0}
  }
}

Keep existing profile data that's still relevant. Add new insights from this feedback.
Observations should be specific and actionable (max 10, newest first).
Respond with ONLY the JSON, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
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

    let profile: ChildProfile;
    try {
      const parsed = JSON.parse(textContent.text);
      profile = parsed.profile;
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      // Return current profile if parsing fails
      if (currentProfile) {
        // Add a simple observation about the skip
        const newObservation = `Requested different activity instead of "${activity.title}" - reason: ${reason}`;
        return NextResponse.json({
          profile: {
            ...currentProfile,
            lastUpdated: new Date().toISOString(),
            observations: [newObservation, ...currentProfile.observations].slice(0, 10),
          },
        });
      }
      throw new Error("Invalid response format from Claude");
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile with skip feedback:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
