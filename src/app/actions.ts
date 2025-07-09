"use server";

import {
  humanizeText,
  type HumanizeTextInput,
  type HumanizeTextOutput,
} from "@/ai/flows/humanize-text";
import {
  reRollText,
  type ReRollTextInput,
  type ReRollTextOutput,
} from "@/ai/flows/re-roll-text";
import {
  estimateAiDetectionScore,
  type EstimateAiDetectionScoreInput,
  type EstimateAiDetectionScoreOutput,
} from "@/ai/flows/estimate-ai-detection-score";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// This type matches what the client sends
type ClientActionInput = {
  text: string;
  strength: "Subtle" | "Balanced" | "Aggressive";
  lockedKeywords?: string[];
  tone?: "Formal" | "Casual" | "Confident" | "Friendly" | "Professional";
  style?: "Academic" | "Blog Post" | "Business Email" | "Marketing Copy" | "Story";
}

export async function humanizeTextAction(
  input: ClientActionInput
): Promise<ActionResult<HumanizeTextOutput>> {
  try {
    const result = await humanizeText({
        text: input.text,
        humanizationStrength: input.strength,
        lockedKeywords: input.lockedKeywords,
        tone: input.tone,
        style: input.style,
    });
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error };
  }
}

export async function reRollTextAction(
  input: ClientActionInput
): Promise<ActionResult<ReRollTextOutput>> {
    try {
        const result = await reRollText({
            originalText: input.text,
            humanizationStrength: input.strength,
            lockedKeywords: input.lockedKeywords,
            tone: input.tone,
            style: input.style,
        });
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        const error = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error };
    }
}

export async function estimateScoreAction(
  input: EstimateAiDetectionScoreInput
): Promise<ActionResult<EstimateAiDetectionScoreOutput>> {
  try {
    const result = await estimateAiDetectionScore(input);
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error };
  }
}
