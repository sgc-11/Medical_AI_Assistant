'use server';

/**
 * @fileOverview A flow to transcribe audio files (URL o Base64) usando Google Speech-to-Text.
 *
 * - transcribeAudio - Función que maneja el proceso de transcripción de audio.
 * - TranscribeAudioInput - Tipo de entrada (URL o Base64).
 * - TranscribeAudioOutput - Tipo de salida (texto transcrito).
 */

import { z } from 'genkit';
import { SpeechClient, protos } from '@google-cloud/speech';
import { ai } from '@/ai/genkit';

// 1) Esquema de entrada: aceptamos audioUrl o audioBase64, pero no ambos
const TranscribeAudioInputSchema = z
  .object({
    audioUrl: z.string().optional().describe('URL del archivo de audio (MP3).'),
    audioBase64: z.string().optional().describe('Contenido del audio en Base64 (sin prefijo "data:...").'),
  })
  .refine(
    (val) => {
      // Debe llegar O audioUrl (y no audioBase64), O audioBase64 (y no audioUrl)
      if (val.audioUrl && val.audioBase64) return false;
      if (!val.audioUrl && !val.audioBase64) return false;
      return true;
    },
    {
      message: 'Debes enviar **audioUrl** o **audioBase64**, pero no ambos.',
      path: ['audioUrl', 'audioBase64'],
    }
  );

export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

// 2) Esquema de salida: el texto transcrito
const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('El texto transcrito al español.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

// Instancia de SpeechClient (llevará GOOGLE_APPLICATION_CREDENTIALS)
const speechClient = new SpeechClient();

/**
 * callGoogleSpeech:
 *   - Si recibe audioUrl: lo descarga y lo convierte a Base64.
 *   - Si recibe audioBase64: lo usa directamente.
 *   - Envía el Base64 a Google Speech-to-Text y devuelve la transcripción.
 */
async function callGoogleSpeech(input: {
  audioUrl?: string;
  audioBase64?: string;
}): Promise<string> {
  let audioBytes: string;

  if (input.audioUrl) {
    // 1) Descarga por URL
    const response = await fetch(input.audioUrl);
    if (!response.ok) {
      throw new Error(`No se pudo descargar el audio. Status ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    audioBytes = Buffer.from(arrayBuffer).toString('base64');
  } else {
    // 2) Viene Base64 (sin el prefijo "data:audio/mp3;base64,")
    audioBytes = input.audioBase64!;
  }

  // 3) Construir el request para Google
  const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
    audio: { content: audioBytes },
    config: {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      languageCode: 'es-ES',
      sampleRateHertz: 44100, // Ajusta según tu MP3
    },
  };

  // 4) Llamar a la API de Google Speech-to-Text
  const [gResponse] = await speechClient.recognize(request);

  // 5) Unir todos los fragmentos de resultado en un solo string
  const transcription = (gResponse.results ?? [])
    .map((result: protos.google.cloud.speech.v1.ISpeechRecognitionResult) => {
      const alt = result.alternatives?.[0];
      return alt?.transcript ?? '';
    })
    .join('\n')
    .trim();

  return transcription;
}

// 6) Función exportada: llama a callGoogleSpeech según el input recibido
export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

// 7) Definimos el Flow de GenKit
const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    try {
      const text = await callGoogleSpeech(input);
      // Si quisieras fallar cuando la transcripción quede vacía:
      // if (!text) throw new Error('No se detectó voz en el audio.');
      return { transcription: text };
    } catch (err: any) {
      throw new Error(`Error en transcripción: ${err.message}`);
    }
  }
);
