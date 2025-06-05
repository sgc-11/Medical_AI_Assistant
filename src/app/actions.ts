'use server';

import type { TranscribeAudioInput, TranscribeAudioOutput } from '@/ai/flows/transcribe-audio';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import type { ExtractMedicalInformationInput, ExtractMedicalInformationOutput } from '@/ai/flows/extract-medical-information';
import { extractMedicalInformation } from '@/ai/flows/extract-medical-information';
import type { GenerateDiagnosisInput, GenerateDiagnosisOutput } from '@/ai/flows/generate-diagnosis';
import { generateDiagnosis } from '@/ai/flows/generate-diagnosis';

export interface ProcessingResult {
  transcription?: string;
  medicalInfo?: ExtractMedicalInformationOutput;
  diagnosis?: GenerateDiagnosisOutput;
  error?: string;
}

export async function processInput(
  inputType: 'audio' | 'text',
  data: string 
): Promise<ProcessingResult> {
  try {
    let textToProcess: string;
    let transcriptionResult: string | undefined = undefined;

    if (inputType === 'audio') {
      if (!data || data.trim() === '') {
        return { error: 'URL del audio no proporcionada.' };
      }
      // Basic URL validation
      try {
        new URL(data);
      } catch (_) {
        return { error: 'URL del audio inválida.' };
      }

      const transcribeInput: TranscribeAudioInput = { audioUrl: data };
      const transcriptionOutput: TranscribeAudioOutput = await transcribeAudio(transcribeInput);
      
      if (!transcriptionOutput || !transcriptionOutput.transcription) {
        return { error: 'No se pudo transcribir el audio. Verifique la URL o el formato del archivo.' };
      }
      textToProcess = transcriptionOutput.transcription;
      transcriptionResult = textToProcess;
    } else {
      if (!data || data.trim() === '') {
        return { error: 'Texto no proporcionado.' };
      }
      textToProcess = data;
    }

    const extractInput: ExtractMedicalInformationInput = { text: textToProcess };
    const medicalInfo: ExtractMedicalInformationOutput = await extractMedicalInformation(extractInput);

    if (!medicalInfo || !medicalInfo.patientDetails || !medicalInfo.symptoms || !medicalInfo.reasonForConsultation) {
        return { error: 'No se pudo extraer la información médica completa del texto procesado.' };
    }
    
    const patientDetailsString = `Nombre: ${medicalInfo.patientDetails.name || 'No especificado'}, Edad: ${medicalInfo.patientDetails.age || 'No especificada'}, ID: ${medicalInfo.patientDetails.idNumber || 'No especificado'}`;
    const symptomsString = medicalInfo.symptoms.length > 0 ? medicalInfo.symptoms.join(', ') : 'No se especificaron síntomas';

    const diagnosisInput: GenerateDiagnosisInput = {
      symptoms: symptomsString,
      patientDetails: patientDetailsString,
      reasonForConsultation: medicalInfo.reasonForConsultation || 'No especificada',
    };
    const diagnosis: GenerateDiagnosisOutput = await generateDiagnosis(diagnosisInput);
     if (!diagnosis || !diagnosis.diagnosis || !diagnosis.treatmentPlan || !diagnosis.recommendations) {
        return { 
          error: 'No se pudo generar un diagnóstico completo.',
          transcription: transcriptionResult,
          medicalInfo
        };
    }

    return {
      transcription: transcriptionResult,
      medicalInfo,
      diagnosis,
    };
  } catch (e: any) {
    console.error('Error processing input:', e);
    let errorMessage = 'Ocurrió un error durante el procesamiento.';
    if (e && typeof e.message === 'string') {
      errorMessage = e.message;
    }
    
    if (errorMessage.toLowerCase().includes('deadline_exceeded') || errorMessage.toLowerCase().includes('timeout')) {
        return { error: 'El procesamiento tardó demasiado. Por favor, intente con un archivo de audio más corto o revise su entrada.' };
    }
    if (errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('url')) {
        return { error: 'No se pudo acceder a la URL del audio. Verifique que sea correcta y accesible.'};
    }
    return { error: `Error del sistema: ${errorMessage.substring(0,150)}` };
  }
}
