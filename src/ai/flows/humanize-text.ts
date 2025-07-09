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
  tone: z.enum(['Formal', 'Casual', 'Confident', 'Friendly', 'Professional']).optional().describe('The desired tone for the output text.'),
  style: z.enum(['Academic', 'Blog Post', 'Business Email', 'Marketing Copy', 'Story']).optional().describe('The desired writing style for the output text.'),
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

1. Vary sentence length and complexity across the text. Do not follow any rhythmic pattern. Let some sentences be very short and others more developed, but avoid excessive formality or tight balance.

2. Use a context-aware vocabulary model to replace generic AI terms (e.g., "utilize", "therefore", "in order to") with more relaxed or native equivalents. Choose words based on tone, not thesaurus matching.

3. Reconstruct sentence structure:
   - Reorder clauses and mix active/passive voice.
   - Frequently split or merge sentences.
   - Occasionally drop or combine subject references (e.g., “Which makes sense.” instead of “This makes sense.”).

4. Hard limit on sentence length: No sentence should contain more than two commas unless absolutely necessary. Force a stop after the second comma.

Additional instructions to enhance humanization:

5. Diversify sentence openings deliberately. Use:
   - Interjections like "Well", "Honestly", "Sure", "Of course"
   - Adverbs and prepositional phrases like "Sometimes", "Across different regions", "In most cases"
   - Implicit connectors like "Which is why...", "Not that it always works, though."
   - Sentence fragments like "Makes you wonder.", "Not ideal."

6. Add slight hesitation and natural asides occasionally. Use dashes, ellipses, or parentheses to inject human spontaneity. For example:
   - "That idea — while clever — isn’t new."
   - "It could work… at least in theory."

7. Include idioms, soft qualifiers, or casual tone where appropriate, without becoming slangy. Examples: "on the fence", "a bit much", "pretty straightforward", "not the end of the world".

8. Ensure smooth transitions, but not always perfect ones. Humans occasionally shift ideas abruptly, or use vague links like:
   - "Anyway", "Still", "Even then", "That said", "Funny enough"

9. Simplify explanations as if speaking aloud to a friend or explaining to a non-technical person. Keep it clear, but not sterile.

10. Maintain the original tone and register (e.g., academic, professional, technical). Do not convert the text into casual or informal language. The goal is to improve human-likeness without diluting the original style.

{{#if tone}}
Adapt the text to adopt a '{{{tone}}}' tone.
{{/if}}

{{#if style}}
Rewrite the text in the style of a '{{{style}}}'.
{{/if}}

Instructions on academic integrity and accuracy:

- Preserve citation formats such as (Smith, 2023), [1], or MLA-style entries. Do not rewrite or reformat these — treat them as frozen.

- Maintain factual accuracy. Do not change the underlying information or reinterpret data.

- Keep a neutral tone unless otherwise indicated. Do not add personal opinions unless they are already present in the input.

Final checks to ensure human-like output:

- Avoid “perfect” transitions and robotic structure. Inject slight randomness — sentence beginnings should not feel templated.

- Avoid AI flags like overuse of:
   - "It is important to note that..."
   - "In conclusion", "Moreover", "This shows that..."

- The output must pass major AI detectors (ZeroGPT, GPTZero, Originality.ai) and feel comfortably human to native readers — even under scrutiny.


  {{#if lockedKeywords}}
  The following keywords and phrases must not be altered:
  {{#each lockedKeywords}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  Negative Constraints:
  - Avoid using phrases commonly associated with AI-generated text.

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
