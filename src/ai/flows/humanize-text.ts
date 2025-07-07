// src/ai/flows/humanize-text.ts
'use server';

/**
 * @fileOverview A text humanization AI agent.
 *
 * - humanizeText - A function that humanizes the input text.
 * - HumanizeTextInput - The input type for the humanizeText function.
 * - HumanizeTextOutput - The return type for the humanizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumanizeTextInputSchema = z.object({
  text: z.string().describe('The AI-generated text to humanize.'),
  lockedKeywords: z.array(z.string()).optional().describe('A list of keywords and phrases that should not be altered.'),
  humanizationStrength: z.enum(['Subtle', 'Balanced', 'Aggressive']).default('Balanced').describe('The degree of modification applied to the text.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

const HumanizeTextOutputSchema = z.object({
  humanizedText: z.string().describe('The humanized version of the input text.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  return humanizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'humanizeTextPrompt',
  input: {schema: HumanizeTextInputSchema},
  output: {schema: HumanizeTextOutputSchema},
  prompt: `You are an expert academic writing assistant. Your task is to humanize AI-generated text to improve its readability and reduce AI detection scores.

  Here are the instructions:
  1.  Vary sentence length and complexity to avoid uniform patterns typical of AI-generated text.
  2.  Use a context-aware vocabulary model to replace common AI word choices with more sophisticated or varied synonyms, avoiding awkward phrasing.
  3.  Reorder clauses, change sentences from active to passive voice (and vice-versa), and combine or split sentences to improve flow.

  Instructions on Academic Integrity & Accuracy:
  *   Preserve common citation formats (e.g., APA (Smith, 2023), IEEE [1], MLA) without altering them. Treat them as immutable blocks.
  *   Make sure the meaning of the original text is preserved. 
  *   The output should be factually accurate.

  {{#if lockedKeywords}}
  The following keywords and phrases must not be altered:
  {{#each lockedKeywords}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  The text to humanize:
  {{{text}}}
  `,
});

const humanizeTextFlow = ai.defineFlow(
  {
    name: 'humanizeTextFlow',
    inputSchema: HumanizeTextInputSchema,
    outputSchema: HumanizeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
