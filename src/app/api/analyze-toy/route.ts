import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ToyCategory } from "@/types";

const anthropic = new Anthropic();

interface AnalyzeToyRequest {
  image: string; // base64 encoded image
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}

interface AnalyzeToyResponse {
  isRelevant: boolean;
  toy?: {
    name: string;
    category: ToyCategory;
    description?: string;
  };
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeToyRequest = await request.json();
    const { image, mediaType } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: image,
              },
            },
            {
              type: "text",
              text: `Analyze this image and determine if it shows a toy, educational material, or play item suitable for a toddler (ages 1-5).

If it IS a relevant toy/play item, respond with JSON:
{
  "isRelevant": true,
  "toy": {
    "name": "Simple descriptive name of the toy",
    "category": "one of: blocks, art, books, puzzles, music, pretend-play, outdoor, sensory, motor-skills, other",
    "description": "Brief description"
  }
}

If it is NOT relevant (not a toy, dangerous item, adult item, empty image, unclear image, etc.), respond with:
{
  "isRelevant": false,
  "reason": "Brief explanation why it's not relevant"
}

Valid categories:
- blocks: Building blocks, Lego, stacking toys
- art: Crayons, paint, paper, craft supplies
- books: Picture books, board books, reading materials
- puzzles: Puzzles, shape sorters, matching games
- music: Instruments, musical toys, shakers
- pretend-play: Dolls, toy kitchen, dress-up, figurines
- outdoor: Balls, ride-on toys, sandbox toys
- sensory: Play dough, water toys, textured toys, slime
- motor-skills: Stacking cups, threading toys, push/pull toys
- other: Anything that doesn't fit above

Respond with ONLY valid JSON, no other text.`,
            },
          ],
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let result: AnalyzeToyResponse;
    try {
      result = JSON.parse(textContent.text);
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      return NextResponse.json(
        { isRelevant: false, reason: "Could not analyze the image" },
        { status: 200 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing toy image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
