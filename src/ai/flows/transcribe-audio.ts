'use server';

/**
 * @fileOverview A flow to transcribe audio files from a URL using Google Speech-to-Text.
 *
 * - transcribeAudio - Función que maneja el proceso de transcripción de audio.
 * - TranscribeAudioInput - Tipo de entrada (URL del audio).
 * - TranscribeAudioOutput - Tipo de salida (texto transcrito en español).
 */

import { z } from 'genkit';

// 1) Importamos el cliente de Google Speech y los protos para usar el enum de encoding
import { SpeechClient, protos } from '@google-cloud/speech';

// Esquema de entrada: solo cambia si quieres validaciones adicionales
const TranscribeAudioInputSchema = z.object({
  audioUrl: z.string().describe('URL del archivo de audio.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

// Esquema de salida: conserva “transcription” como string
const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('El texto transcrito al español.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

// Función que se exporta y es llamada desde el flow
export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

// Creamos una sola instancia de SpeechClient (leerá GOOGLE_APPLICATION_CREDENTIALS)
const speechClient = new SpeechClient();

/**
 * callGoogleSpeech:  
 *   - Descarga el audio desde la URL.  
 *   - Convierte a Base64.  
 *   - Hace la llamada a Google con el enum adecuado.  
 */
async function callGoogleSpeech(
  audioUrl: string
): Promise<string> {
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS)
  // ——————————————————————————————————————————————
  // 1) Descarga el archivo desde la URL
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el audio. Status ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);

  // ——————————————————————————————————————————————
  // 2) Convertir a Base64
  const audioBytes = audioBuffer.toString('base64');

  // ——————————————————————————————————————————————
  // 3) Armar el request con el enum de encoding
  //    Usamos protos.google.cloud.speech.v1.AudioEncoding.MP3 en lugar de un string genérico
  const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
    audio: {
      content: audioBytes,
    },
    config: {
      // Aquí es donde TS se quejaba: antes tenías `encoding: 'MP3'` como string.
      // Ahora lo asignamos con el enum oficial:
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      languageCode: 'es-ES',
      sampleRateHertz: 44100, // si tu audio lo requiere, puedes descomentar y ajustar
    },
  };

  // ——————————————————————————————————————————————
  // 4) Llamamos a la API y desestructuramos correctamente
  //    SpeechClient.recognize(...) retorna un array [response, requestMetadata?, rawResponse?]
  //    Por eso TypeScript entiende que es un Promise<[IRecognizeResponse, …]>
  //    Lo desestructuramos así:
  const [gResponse] = await speechClient.recognize(request);

  console.log('▶ gResponse.results:', JSON.stringify(gResponse.results, null, 2));
  // gResponse es de tipo IRecognizeResponse

  // ——————————————————————————————————————————————
  // 5) Unir todos los fragmentos
  //    Para evitar el “Parameter ‘result’ implicitly has an ‘any’ type”, anotamos el tipo:
  const transcription = (gResponse.results ?? [])
    .map((result: protos.google.cloud.speech.v1.ISpeechRecognitionResult) => {
      // Cada result.alternatives es un array; tomamos el primer transcript
      const alt = result.alternatives?.[0];
      return alt?.transcript ?? '';
    })
    .join('\n')
    .trim();

  return transcription;
}

// ——————————————————————————————————————————————
// Definimos el flow con GenKit, usando los schemas de entrada/salida tal cual
import { ai } from '@/ai/genkit';

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    try {
      const text = await callGoogleSpeech(input.audioUrl);
      return { transcription: text };
    } catch (err: any) {
      // Si hay error (URL inválida, fallo en fetch o en Google), lo lanzamos para que el toast lo muestre
      throw new Error(`Error en transcripción: ${err.message}`);
    }
  }
);
