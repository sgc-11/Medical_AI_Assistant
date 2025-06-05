'use server';

/**
 * @fileOverview Generates a diagnosis, treatment plan, and recommendations in Spanish based on extracted medical information.
 *
 * - generateDiagnosis - A function that generates the diagnosis, treatment plan and recommendations.
 * - GenerateDiagnosisInput - The input type for the generateDiagnosis function.
 * - GenerateDiagnosisOutput - The return type for the generateDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagnosisInputSchema = z.object({
  symptoms: z.string().describe('A list of symptoms extracted from the patient information.'),
  patientDetails: z
    .string()
    .describe('Patient identification details including name, age, and ID number.'),
  reasonForConsultation: z
    .string()
    .describe('The patient provided reason for consultation.'),
});
export type GenerateDiagnosisInput = z.infer<typeof GenerateDiagnosisInputSchema>;

const GenerateDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe('The generated diagnosis in Spanish.'),
  treatmentPlan: z.string().describe('The proposed treatment plan in Spanish.'),
  recommendations: z.string().describe('The recommendations for the patient in Spanish.'),
});
export type GenerateDiagnosisOutput = z.infer<typeof GenerateDiagnosisOutputSchema>;

export async function generateDiagnosis(input: GenerateDiagnosisInput): Promise<GenerateDiagnosisOutput> {
  return generateDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagnosisPrompt',
  input: {schema: GenerateDiagnosisInputSchema},
  output: {schema: GenerateDiagnosisOutputSchema},
  prompt: `Eres un médico experto que brinda un diagnóstico, un plan de tratamiento y recomendaciones en español.

  Utilice la siguiente información del paciente para generar el diagnóstico, el plan de tratamiento y las recomendaciones en español.

  Síntomas: {{{symptoms}}}
  Detalles del paciente: {{{patientDetails}}}
  Motivo de la consulta: {{{reasonForConsultation}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateDiagnosisFlow = ai.defineFlow(
  {
    name: 'generateDiagnosisFlow',
    inputSchema: GenerateDiagnosisInputSchema,
    outputSchema: GenerateDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
