'use server';

/**
 * @fileOverview Re-rolls humanized text if the user is unsatisfied with the initial output.
 *
 * - reRollText - A function that re-generates the humanized text.
 * - ReRollTextInput - The input type for the reRollText function.
 * - ReRollTextOutput - The return type for the reRollText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReRollTextInputSchema = z.object({
  originalText: z.string().describe('The original AI-generated text to be humanized.'),
  humanizationStrength: z
    .enum(['Subtle', 'Balanced', 'Aggressive'])
    .describe('The desired strength of humanization.'),
  lockedKeywords: z.array(z.string()).optional().describe('Keywords that should not be altered.'),
  tone: z.enum(['Formal', 'Casual', 'Confident', 'Friendly', 'Professional']).optional().describe('The desired tone for the output text.'),
  style: z.enum(['Academic', 'Blog Post', 'Business Email', 'Marketing Copy', 'Story']).optional().describe('The desired writing style for the output text.'),
});
export type ReRollTextInput = z.infer<typeof ReRollTextInputSchema>;

const ReRollTextOutputSchema = z.object({
  humanizedText: z.string().describe('The re-generated humanized text.'),
});
export type ReRollTextOutput = z.infer<typeof ReRollTextOutputSchema>;

export async function reRollText(input: ReRollTextInput): Promise<ReRollTextOutput> {
  return reRollTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reRollTextPrompt',
  input: {schema: ReRollTextInputSchema},
  output: {schema: ReRollTextOutputSchema},
  prompt: `You are an AI text humanizer. You will receive AI-generated text and rewrite it to sound more human.

The original text is: {{{originalText}}}

You should adjust the text according to the following humanization strength: {{{humanizationStrength}}}.

{{#if tone}}
The desired tone for the output is: {{{tone}}}.
{{/if}}

{{#if style}}
The desired writing style for the output is: {{{style}}}.
{{/if}}

{{#if lockedKeywords}}
You MUST NOT modify the following keywords:
{{#each lockedKeywords}}
- {{{this}}}
{{/each}}
{{/if}}

Rewrite the text to sound more human.
`,
});

const reRollTextFlow = ai.defineFlow(
  {
    name: 'reRollTextFlow',
    inputSchema: ReRollTextInputSchema,
    outputSchema: ReRollTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
