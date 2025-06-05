'use client';

import React, { useState, useEffect } from 'react';
import InputTabs from './InputTabs';
import ResultsDisplay from './ResultsDisplay';
import type { ProcessingResult } from '@/app/actions';
import { processInput } from '@/app/actions';
import type { MedicAIResult } from './types';
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";

const MedicAIAssistantPage: React.FC = () => {
  const [results, setResults] = useState<MedicAIResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false); // To track if any processing has been attempted
  const { toast } = useToast();
  const [pageKey, setPageKey] = useState(Date.now()); // Used to reset state

  const handleProcess = async (inputType: 'audio' | 'text', data: string) => {
    setIsProcessing(true);
    setProcessed(true); 
    setResults(null); // Clear previous results before new processing

    const response: ProcessingResult = await processInput(inputType, data);

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error de Procesamiento",
        description: response.error,
        duration: 5000,
      });
      // If there was an error, but some partial data exists (e.g., transcription and medicalInfo but no diagnosis)
      if (response.transcription || response.medicalInfo) {
        setResults({
          transcription: response.transcription,
          medicalInfo: response.medicalInfo,
          diagnosis: response.diagnosis, // Might be undefined
        });
      } else {
        setResults(null);
      }
    } else {
       setResults({
        transcription: response.transcription,
        medicalInfo: response.medicalInfo,
        diagnosis: response.diagnosis,
      });
      toast({
        title: "Procesamiento Exitoso",
        description: "La información ha sido procesada y los resultados se muestran a continuación.",
        className: "bg-accent text-accent-foreground",
        duration: 3000,
      });
    }
    setIsProcessing(false);
  };
  
  const resetState = () => {
    setResults(null);
    setIsProcessing(false);
    setProcessed(false);
    setPageKey(Date.now()); // This will force re-render of InputTabs if it holds internal state tied to key
     toast({
        title: "Estado Restablecido",
        description: "El formulario y los resultados han sido limpiados.",
        duration: 2000,
      });
  };


  return (
    <div key={pageKey} className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-6 md:mb-10 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Stethoscope className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
            MedicAI Assistant
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Su asistente médico inteligente para análisis preliminar. Todo en Español.
        </p>
         <Button onClick={resetState} variant="outline" size="sm" className="mt-4">
            Limpiar y Reiniciar
        </Button>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <section className="md:sticky md:top-8 bg-card p-6 rounded-xl shadow-xl h-fit">
          <h2 className="text-2xl font-semibold mb-1 font-headline">Ingreso de Datos</h2>
          <p className="text-sm text-muted-foreground mb-6">Seleccione el método de entrada y proporcione la información.</p>
          <InputTabs onProcess={handleProcess} isProcessing={isProcessing} />
        </section>

        <section className="bg-card p-6 rounded-xl shadow-xl min-h-[300px]">
           <h2 className="text-2xl font-semibold mb-1 font-headline">Resultados del Análisis</h2>
           <p className="text-sm text-muted-foreground mb-6">Aquí se mostrará la información procesada.</p>
           <Separator className="mb-6" />
          <ResultsDisplay results={results} isProcessing={isProcessing} processed={processed}/>
        </section>
      </main>
      
      <footer className="w-full max-w-6xl mt-10 md:mt-16 pt-6 border-t text-center">
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow mb-4 max-w-3xl mx-auto" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-yellow-600" />
            <div>
              <p className="font-bold">Importante:</p>
              <p className="text-sm">MedicAI Assistant proporciona un análisis preliminar y no sustituye la consulta médica profesional. Utilice esta herramienta con fines informativos y de apoyo.</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MedicAI Assistant. Potenciado por IA.
        </p>
      </footer>
    </div>
  );
};

export default MedicAIAssistantPage;
