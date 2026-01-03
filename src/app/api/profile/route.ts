import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { UpdateProfileRequest, ChildProfile, SkillArea } from "@/types";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body: UpdateProfileRequest = await request.json();
    const { childId, currentProfile, activity, feedback, recentHistory } = body;

    // Build context from recent history
    const historyContext = recentHistory
      .slice(-10)
      .map((h) => {
        const engagementLabel =
          h.feedback.engagement >= 4
            ? "highly engaged"
            : h.feedback.engagement >= 3
              ? "moderately engaged"
              : "low engagement";
        const completionLabel =
          h.feedback.completion === "completed"
            ? "completed"
            : h.feedback.completion === "exceeded"
              ? "exceeded expectations"
              : h.feedback.completion === "partial"
                ? "partially completed"
                : "did not complete";
        return `- "${h.activityTitle}" (${h.skillAreas.join(", ")}): ${engagementLabel}, ${completionLabel}${h.feedback.challenges ? `, challenges: ${h.feedback.challenges}` : ""}${h.feedback.highlights ? `, highlights: ${h.feedback.highlights}` : ""}`;
      })
      .join("\n");

    // Current activity feedback
    const currentEngagement =
      feedback.engagement >= 4
        ? "highly engaged"
        : feedback.engagement >= 3
          ? "moderately engaged"
          : "low engagement";
    const currentCompletion =
      feedback.completion === "completed"
        ? "completed successfully"
        : feedback.completion === "exceeded"
          ? "exceeded expectations"
          : feedback.completion === "partial"
            ? "partially completed"
            : "did not complete";

    const currentProfileStr = currentProfile
      ? `
Current Profile:
- Activities completed: ${currentProfile.activitiesCompleted}
- Strengths: ${currentProfile.strengths.length > 0 ? currentProfile.strengths.join(", ") : "Not yet identified"}
- Areas for growth: ${currentProfile.areasForGrowth.length > 0 ? currentProfile.areasForGrowth.join(", ") : "Not yet identified"}
- Preferred activities: ${currentProfile.preferredActivityTypes.length > 0 ? currentProfile.preferredActivityTypes.join(", ") : "Not yet identified"}
- Activities to avoid: ${currentProfile.avoidances.length > 0 ? currentProfile.avoidances.join(", ") : "None noted"}
- Skill levels: ${Object.entries(currentProfile.skillLevels).map(([skill, data]) => `${skill}: ${data?.level}/5 (${data?.trend})`).join(", ") || "Not yet assessed"}
- Development notes: ${currentProfile.developmentNotes || "None yet"}
- Recent observations: ${currentProfile.observations.slice(-3).join("; ") || "None yet"}
`
      : "No existing profile - this is the first activity.";

    const systemPrompt = `You are an expert early childhood development specialist. Your job is to maintain and update a child's developmental profile based on activity feedback from caregivers.

Analyze the feedback and update the child's profile to help create better, more personalized activities in the future.

Be specific and actionable in your observations. Focus on patterns, not single data points.

Always respond with valid JSON only.`;

    const userPrompt = `Update the child's developmental profile based on this new activity feedback.

${currentProfileStr}

Recent Activity History:
${historyContext || "No previous activities"}

NEW Activity Just Completed:
- Activity: "${activity.title}"
- Skill areas: ${activity.skillAreas.join(", ")}
- Engagement: ${currentEngagement} (${feedback.engagement}/5)
- Completion: ${currentCompletion}
${feedback.challenges ? `- Challenges noted: ${feedback.challenges}` : ""}
${feedback.highlights ? `- Highlights noted: ${feedback.highlights}` : ""}

Based on this feedback and the history, update the child's profile. Consider:
1. Should any skill levels be adjusted? (1-5 scale)
2. Are there patterns suggesting strengths or areas for growth?
3. What types of activities seem to work well or poorly?
4. Any important observations to note?

Respond with JSON in this exact format:
{
  "skillLevels": {
    "motor-fine": { "level": 3, "trend": "improving", "lastAssessed": "${new Date().toISOString()}" },
    "cognitive": { "level": 4, "trend": "stable", "lastAssessed": "${new Date().toISOString()}" }
  },
  "strengths": ["Shows excellent focus during art activities", "Good hand-eye coordination"],
  "areasForGrowth": ["May need more practice with turn-taking", "Building patience for longer activities"],
  "observations": ["Really enjoyed the color sorting today", "Responded well to musical cues"],
  "preferredActivityTypes": ["Art projects", "Music-based activities", "Sensory play"],
  "avoidances": ["Long seated activities without movement breaks"],
  "developmentNotes": "A brief 2-3 sentence summary of overall development progress and recommendations."
}

Include ALL skill areas that have been assessed (keep previous assessments, update based on new data).
Keep arrays concise (3-5 items max each, most recent/relevant).
Be specific and actionable.

Respond with ONLY the JSON, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
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

    let updates: {
      skillLevels: ChildProfile["skillLevels"];
      strengths: string[];
      areasForGrowth: string[];
      observations: string[];
      preferredActivityTypes: string[];
      avoidances: string[];
      developmentNotes: string;
    };

    try {
      updates = JSON.parse(textContent.text);
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Invalid response format from Claude");
    }

    // Build the updated profile
    const updatedProfile: ChildProfile = {
      childId,
      lastUpdated: new Date().toISOString(),
      skillLevels: updates.skillLevels || currentProfile?.skillLevels || {},
      strengths: updates.strengths || currentProfile?.strengths || [],
      areasForGrowth: updates.areasForGrowth || currentProfile?.areasForGrowth || [],
      observations: updates.observations || currentProfile?.observations || [],
      preferredActivityTypes: updates.preferredActivityTypes || currentProfile?.preferredActivityTypes || [],
      avoidances: updates.avoidances || currentProfile?.avoidances || [],
      developmentNotes: updates.developmentNotes || currentProfile?.developmentNotes || "",
      activitiesCompleted: (currentProfile?.activitiesCompleted || 0) + 1,
    };

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
