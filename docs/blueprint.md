# **App Name**: MedicAI Assistant

## Core Features:

- Input Interface: Provide a user-friendly interface for uploading audio files or entering text directly. The application interface with the patient will be in Spanish.
- Results Display: Display the extracted medical information and diagnosis in a clear and organized format, in Spanish.
- Audio Transcription: Transcribe audio files (MP3, WAV) from provided URLs using Google Cloud Speech-to-Text API.
- Medical Information Extraction: Process transcribed text or direct input using the Gemini API to extract a list of symptoms, patient identification details (name, age, ID number), and the reason for consultation; uses structured output to guarantee data consistency; LLM used as a tool for reliable and validated results.
- Diagnosis Generation: Use the Gemini API with structured information to generate a diagnosis, treatment plan, and recommendations.
- Backend Decorators: Implement decorators in Cloud Functions for request verification, validation, centralized error handling, and standard response formatting.
- Metadata Tracking: Implement middleware in Cloud Functions to track metadata (latency, costs, timestamp).

## Style Guidelines:

- Primary color: Soft blue (#64B5F6) to evoke trust and calmness.
- Background color: Light gray (#F0F4F7) for a clean, modern feel.
- Accent color: Green (#4CAF50) for positive and informative elements.
- Body text and headline font: 'Inter' (sans-serif) for readability and a modern feel.
- Use clear and recognizable icons to represent different medical concepts and actions.
- Design a clean and intuitive layout that prioritizes the display of information in a structured and easily digestible manner.
- Implement subtle transitions and animations to enhance user experience without distracting from the primary task.