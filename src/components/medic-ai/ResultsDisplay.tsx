'use client';

import React from 'react';
import type { MedicAIResult } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle2, ListChecks, MessageSquareText, FileHeart, ClipboardList, Lightbulb, FileText } from 'lucide-react';

interface ResultsDisplayProps {
  results: MedicAIResult | null;
  isProcessing: boolean;
  processed: boolean; 
}

const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean, description?: string }> = ({ title, icon: Icon, children, defaultOpen = false, description }) => (
  <Card className="shadow-lg break-inside-avoid">
    <CardHeader>
      <div className="flex items-center space-x-3">
        <Icon className="h-7 w-7 text-primary" />
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const SkeletonLoader: React.FC = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4].map(i => (
      <Card key={i} className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ))}
  </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isProcessing, processed }) => {
  if (isProcessing) {
    return <SkeletonLoader />;
  }

  if (!processed || !results) {
    return (
      <div className="text-center py-10">
        <FileHeart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          Los resultados aparecerán aquí después del procesamiento.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ingrese datos en el panel izquierdo y presione "Procesar Información".
        </p>
      </div>
    );
  }
  
  const { medicalInfo, diagnosis, transcription } = results;

  return (
    <div className="space-y-6">
      {transcription && (
        <SectionCard title="Transcripción del Audio" icon={FileText}>
          <p className="text-sm whitespace-pre-wrap">{transcription}</p>
        </SectionCard>
      )}

      {medicalInfo && (
        <>
          <SectionCard title="Información del Paciente" icon={UserCircle2}>
            <ul className="space-y-1 text-sm">
              <li><strong>Nombre:</strong> {medicalInfo.patientDetails.name || 'No especificado'}</li>
              <li><strong>Edad:</strong> {medicalInfo.patientDetails.age || 'No especificado'}</li>
              <li><strong>ID:</strong> {medicalInfo.patientDetails.idNumber || 'No especificado'}</li>
            </ul>
          </SectionCard>

          <SectionCard title="Síntomas Reportados" icon={ListChecks}>
            {medicalInfo.symptoms && medicalInfo.symptoms.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {medicalInfo.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No se especificaron síntomas.</p>
            )}
          </SectionCard>

          <SectionCard title="Motivo de Consulta" icon={MessageSquareText}>
            <p className="text-sm whitespace-pre-wrap">{medicalInfo.reasonForConsultation || 'No especificado'}</p>
          </SectionCard>
        </>
      )}

      {diagnosis && (
         <Accordion type="multiple" defaultValue={['diagnosis-item', 'treatment-item', 'recommendations-item']} className="w-full space-y-6">
            <AccordionItem value="diagnosis-item" className="border-none">
                <SectionCard title="Diagnóstico Preliminar" icon={FileHeart} description="Basado en la información proporcionada.">
                    <AccordionTrigger className="text-sm hover:no-underline justify-start -mt-4 -ml-1 text-primary">Ver/Ocultar Detalles</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm whitespace-pre-wrap pt-2">{diagnosis.diagnosis || 'No disponible'}</p>
                    </AccordionContent>
                </SectionCard>
            </AccordionItem>
            <AccordionItem value="treatment-item" className="border-none">
                 <SectionCard title="Plan de Tratamiento Sugerido" icon={ClipboardList} description="Recomendaciones generales.">
                    <AccordionTrigger className="text-sm hover:no-underline justify-start -mt-4 -ml-1 text-primary">Ver/Ocultar Detalles</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm whitespace-pre-wrap pt-2">{diagnosis.treatmentPlan || 'No disponible'}</p>
                    </AccordionContent>
                </SectionCard>
            </AccordionItem>
            <AccordionItem value="recommendations-item" className="border-none">
                <SectionCard title="Recomendaciones Adicionales" icon={Lightbulb} description="Consejos y próximos pasos.">
                    <AccordionTrigger className="text-sm hover:no-underline justify-start -mt-4 -ml-1 text-primary">Ver/Ocultar Detalles</AccordionTrigger>
                    <AccordionContent>
                         <p className="text-sm whitespace-pre-wrap pt-2">{diagnosis.recommendations || 'No disponible'}</p>
                    </AccordionContent>
                </SectionCard>
            </AccordionItem>
        </Accordion>
      )}
      
      {(!medicalInfo && !diagnosis) && (
        <div className="text-center py-10">
            <FileHeart className="mx-auto h-16 w-16 text-destructive mb-4" />
            <p className="text-destructive text-lg font-semibold">
            No se pudo obtener información.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
            Verifique la entrada o intente de nuevo. Si el problema persiste, el texto podría no contener información médica relevante.
            </p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
