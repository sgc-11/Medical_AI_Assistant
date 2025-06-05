import { config } from 'dotenv';
config();

import '@/ai/flows/extract-medical-information.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/generate-diagnosis.ts';