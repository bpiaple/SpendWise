// This is an autogenerated file. DO NOT change its contents manually.
'use server';
/**
 * @fileOverview An AI agent that categorizes transactions based on description and historical trends.
 *
 * - categorizeTransaction - A function that handles the transaction categorization process.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction.'),
  historicalSpendingPatterns: z
    .string()
    .describe(
      'A summary of the users historical spending patterns, including categories and amounts spent in each category.'
    ),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested category for the transaction.'),
  deviationFromPatterns: z
    .boolean()
    .describe(
      'Whether the suggested category deviates from the users historical spending patterns.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning for the suggested category, and whether it fits with historical trends.'
    ),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a personal finance assistant that categorizes transactions.

  Based on the transaction description and the user's historical spending patterns, suggest a category for the transaction.
  Also, determine if the suggested category deviates from the user's typical spending habits.

  Transaction Description: {{{transactionDescription}}}
  Historical Spending Patterns: {{{historicalSpendingPatterns}}}

  Respond in a JSON format:
  {
    "suggestedCategory": "category name",
    "deviationFromPatterns": true or false,
    "reasoning": "explanation"
  }`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
