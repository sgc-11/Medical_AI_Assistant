'use server';

/**
 * @fileOverview Extracts key medical information from text input in Spanish.
 *
 * - extractMedicalInformation - A function that handles the extraction of medical information.
 * - ExtractMedicalInformationInput - The input type for the extractMedicalInformation function.
 * - ExtractMedicalInformationOutput - The return type for the extractMedicalInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMedicalInformationInputSchema = z.object({
  text: z.string().describe('The transcribed text or direct text input in Spanish.'),
});
export type ExtractMedicalInformationInput = z.infer<typeof ExtractMedicalInformationInputSchema>;

const ExtractMedicalInformationOutputSchema = z.object({
  patientDetails: z.object({
    name: z.string().describe('The name of the patient.'),
    age: z.number().describe('The age of the patient.'),
    idNumber: z.string().describe('The patient identification number.'),
  }).describe('Details of the patient.'),
  symptoms: z.array(z.string()).describe('A list of symptoms reported by the patient.'),
  reasonForConsultation: z.string().describe('The primary reason for the patient seeking consultation.'),
});
export type ExtractMedicalInformationOutput = z.infer<typeof ExtractMedicalInformationOutputSchema>;

export async function extractMedicalInformation(input: ExtractMedicalInformationInput): Promise<ExtractMedicalInformationOutput> {
  return extractMedicalInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMedicalInformationPrompt',
  input: {schema: ExtractMedicalInformationInputSchema},
  output: {schema: ExtractMedicalInformationOutputSchema},
  prompt: `You are a medical expert tasked with extracting key information from patient text in Spanish.

  Analyze the following text and extract the patient's details (name, age, ID), symptoms, and the reason for consultation.
  Provide the output in a structured JSON format as defined by the ExtractMedicalInformationOutputSchema schema.

  Text: {{{text}}}
  `,
});

const extractMedicalInformationFlow = ai.defineFlow(
  {
    name: 'extractMedicalInformationFlow',
    inputSchema: ExtractMedicalInformationInputSchema,
    outputSchema: ExtractMedicalInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
