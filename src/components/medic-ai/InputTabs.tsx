'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileAudio, Keyboard, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface InputTabsProps {
  onProcess: (inputType: 'audio' | 'text', data: string) => void;
  isProcessing: boolean;
}

const InputTabs: React.FC<InputTabsProps> = ({ onProcess, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'text'>('audio');
  const [audioUrl, setAudioUrl] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleSubmit = () => {
    if (activeTab === 'audio') {
      onProcess('audio', audioUrl);
    } else {
      onProcess('text', textInput);
    }
  };

  return (
    <Tabs defaultValue="audio" className="w-full" onValueChange={(value) => setActiveTab(value as 'audio' | 'text')}>
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="audio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
          <FileAudio className="mr-2 h-5 w-5" />
          Cargar Audio (URL)
        </TabsTrigger>
        <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
          <Keyboard className="mr-2 h-5 w-5" />
          Ingresar Texto
        </TabsTrigger>
      </TabsList>
      <TabsContent value="audio">
        <div className="space-y-3">
          <Label htmlFor="audioUrl" className="text-sm font-medium">URL del archivo de audio (MP3, WAV)</Label>
          <Input
            id="audioUrl"
            type="url"
            placeholder="https://ejemplo.com/audio.mp3"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            Asegúrese de que la URL sea públicamente accesible.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="text">
        <div className="space-y-3">
          <Label htmlFor="textInput" className="text-sm font-medium">Ingrese el texto a procesar</Label>
          <Textarea
            id="textInput"
            placeholder="Escriba aquí la transcripción o notas del paciente..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={8}
            disabled={isProcessing}
          />
        </div>
      </TabsContent>
      <Button onClick={handleSubmit} disabled={isProcessing} className="w-full mt-6 text-base py-3">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          'Procesar Información'
        )}
      </Button>
    </Tabs>
  );
};

export default InputTabs;
