import type { ExtractMedicalInformationOutput } from '@/ai/flows/extract-medical-information';
import type { GenerateDiagnosisOutput } from '@/ai/flows/generate-diagnosis';

export interface MedicAIResult {
  transcription?: string;
  medicalInfo?: ExtractMedicalInformationOutput;
  diagnosis?: GenerateDiagnosisOutput;
}
