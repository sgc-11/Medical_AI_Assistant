# MedicAI Assistant

Autor: Simón Gómez Castro

## Descripción Técnica
MedicAI Assistant es una aplicación web construida con Next.js y Firebase. Permite al usuario cargar audio (URL o archivo) o ingresar texto libre, y procesa esa información mediante:
1. **Google Speech-to-Text**: transcribe archivos MP3 a texto en español.  
2. **GenKit + Google Gemini**:  
   - **Extracción de Información Médica**: extrae `{ patientDetails, symptoms, reasonForConsultation }` en formato JSON validado con Zod.  
   - **Generación de Diagnóstico**: genera diagnóstico, plan de tratamiento y recomendaciones en español.  
3. **Cloud Functions** (creadas en Firebase Studio) para encadenar transcripción → extracción → diagnóstico.  
4. **Tailwind CSS + shadcn/ui** en frontend para mostrar resultados en tarjetas y acordeones, con toasts y skeleton loaders.

## Decisiones de Diseño Relevantes
- **Next.js + Firebase Functions**:  
  - Uso de Server Actions en Next.js facilita el desarrollo unificado de frontend y backend sin desplegar servicios por separado.  
  - Empleo de Firebase Studio para escribir y versionar Cloud Functions con validación de esquemas y middleware integrado.
- **GenKit + Google Gemini**:  
  - GenKit permite definir “Flows” con Zod Schemas que garantizan respuestas estructuradas del LLM.  
  - Google Gemini (`gemini-2.0-flash`) elegido por su rendimiento en español y fácil integración con GCP.
- **Google Speech-to-Text**:  
  - Alta precisión en español, configurado con `encoding: MP3`, `languageCode: es-ES`, `sampleRateHertz: 44100`.  
  - Manejo de audio tanto por URL como por Base64 (upload de archivo desde el cliente).
- **Validación y Manejo de Errores Centralizado**:  
  - Cada función valida inputs (URL válida, Base64 no vacío, text no vacío), captura excepciones y retorna un esquema uniforme `{ success, data, error, metadata }`.  
  - Registro de latencia, timestamp y costo estimado de llamadas a LLM para monitoreo.
- **UI/UX con Tailwind + shadcn/ui**:  
  - Componentes reutilizables (Tabs, Cards, Accordion, Skeleton, Toaster) que aceleran el desarrollo y mantienen consistencia visual.  
  - Skeleton loaders y toasts para mejorar la percepción de velocidad y feedback al usuario.

  # Instrucciones para correrlo localmente

1. Ejecutar
```bash
git clone https://github.com/sgc-11/Medical_AI_Assistant.git

cd Medical_AI_Assistant

npm install
```

2. 
 * En Google Cloud crear un proyecto
 * Habilitar la API "Speech-to-text"
 * Crear una cuenta de servicio y descargar el JSON de credenciales
 * Ubicar el json en el root `/` con el nombre `transcriptor-service-account.json`

3. 
* En Gemini Api Key obtener una llave 

4. Cambiar el nombre del archivo `env.local` -> `.env` y ubicar la api key y verificar el nombre de la conexión con la api de "Speech-to-text"

5. Ejecutar
```bash
npm run dev
```


