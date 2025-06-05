'use server';

import type {
  TranscribeAudioInput,
  TranscribeAudioOutput,
} from '@/ai/flows/transcribe-audio';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import type {
  ExtractMedicalInformationInput,
  ExtractMedicalInformationOutput,
} from '@/ai/flows/extract-medical-information';
import { extractMedicalInformation } from '@/ai/flows/extract-medical-information';
import type {
  GenerateDiagnosisInput,
  GenerateDiagnosisOutput,
} from '@/ai/flows/generate-diagnosis';
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
      // -----------------------------------------------------------
      // 1) Si data es un Data URL (empezando con "data:audio"), lo tratamos como Base64:
      if (data.startsWith('data:audio')) {
        // Extraemos solo la parte después de la coma (sin "data:audio/mp3;base64,")
        const base64Part = data.split(',')[1];
        const transcribeInput: TranscribeAudioInput = { audioBase64: base64Part };
        const transcriptionOutput: TranscribeAudioOutput = await transcribeAudio(transcribeInput);

        if (!transcriptionOutput || !transcriptionOutput.transcription) {
          return {
            error:
              'No se pudo transcribir el audio (Base64). Verifique el archivo subido.',
          };
        }
        textToProcess = transcriptionOutput.transcription;
        transcriptionResult = textToProcess;
      }
      // -----------------------------------------------------------
      // 2) Si no es Data URL, seguimos validando como URL normal:
      else {
        if (!data || data.trim() === '') {
          return { error: 'URL del audio no proporcionada.' };
        }
        // Validación básica de URL:
        try {
          new URL(data);
        } catch (_) {
          return { error: 'URL del audio inválida.' };
        }

        const transcribeInput: TranscribeAudioInput = { audioUrl: data };
        const transcriptionOutput: TranscribeAudioOutput = await transcribeAudio(transcribeInput);

        if (!transcriptionOutput || !transcriptionOutput.transcription) {
          return {
            error:
              'No se pudo transcribir el audio. Verifique la URL o el formato del archivo.',
          };
        }
        textToProcess = transcriptionOutput.transcription;
        transcriptionResult = textToProcess;
      }
      // -----------------------------------------------------------

      // 3) Si llegamos aquí, textToProcess ya tiene el texto transcrito
    } else {
      // Caso "text": validamos que haya texto
      if (!data || data.trim() === '') {
        return { error: 'Texto no proporcionado.' };
      }
      textToProcess = data;
    }

    // 4) Extracción de información médica
    const extractInput: ExtractMedicalInformationInput = { text: textToProcess };
    const medicalInfo: ExtractMedicalInformationOutput = await extractMedicalInformation(extractInput);

    if (
      !medicalInfo ||
      !medicalInfo.patientDetails ||
      !medicalInfo.symptoms ||
      !medicalInfo.reasonForConsultation
    ) {
      return {
        error:
          'No se pudo extraer la información médica completa del texto procesado.',
      };
    }

    // 5) Preparar texto legible con detalles del paciente y síntomas
    const patientDetailsString = `Nombre: ${
      medicalInfo.patientDetails.name || 'No especificado'
    }, Edad: ${
      medicalInfo.patientDetails.age || 'No especificada'
    }, ID: ${medicalInfo.patientDetails.idNumber || 'No especificado'}`;
    const symptomsString =
      medicalInfo.symptoms.length > 0
        ? medicalInfo.symptoms.join(', ')
        : 'No se especificaron síntomas';

    // 6) Llamar a generateDiagnosis
    const diagnosisInput: GenerateDiagnosisInput = {
      symptoms: symptomsString,
      patientDetails: patientDetailsString,
      reasonForConsultation:
        medicalInfo.reasonForConsultation || 'No especificada',
    };
    const diagnosis: GenerateDiagnosisOutput = await generateDiagnosis(
      diagnosisInput
    );

    if (
      !diagnosis ||
      !diagnosis.diagnosis ||
      !diagnosis.treatmentPlan ||
      !diagnosis.recommendations
    ) {
      return {
        error: 'No se pudo generar un diagnóstico completo.',
        transcription: transcriptionResult,
        medicalInfo,
      };
    }

    // 7) Si todo salió bien, retornamos todo junto
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

    if (
      errorMessage.toLowerCase().includes('deadline_exceeded') ||
      errorMessage.toLowerCase().includes('timeout')
    ) {
      return {
        error:
          'El procesamiento tardó demasiado. Por favor, intente con un archivo de audio más corto o revise su entrada.',
      };
    }
    if (
      errorMessage.toLowerCase().includes('fetch') ||
      errorMessage.toLowerCase().includes('url')
    ) {
      return {
        error:
          'No se pudo acceder a la URL del audio. Verifique que sea correcta y accesible.',
      };
    }
    return { error: `Error del sistema: ${errorMessage.substring(0, 150)}` };
  }
}
