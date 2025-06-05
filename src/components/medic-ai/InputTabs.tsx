'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileAudio, Keyboard, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface InputTabsProps {
  onProcess: (inputType: 'audio' | 'text', data: string) => void;
  isProcessing: boolean;
}

const InputTabs: React.FC<InputTabsProps> = ({ onProcess, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'text'>('audio');

  // Para guardar la URL si el usuario la pega
  const [audioUrl, setAudioUrl] = useState('');

  // Para guardar el Data URL (Base64) si el usuario sube un archivo
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);

  // Para texto libre
  const [textInput, setTextInput] = useState('');

  // ---------------------------------------
  // 1) Cuando el usuario selecciona un archivo MP3/WAV:
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificamos que sea un archivo de audio
    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio (MP3 o WAV).');
      e.target.value = '';
      return;
    }

    // Leemos el archivo como Data URL (Base64) con FileReader
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result tendrá algo como: "data:audio/mpeg;base64,AAAABBBBCCCC..."
      setAudioDataUrl(result);
      // Borramos cualquier URL previa para evitar confusión
      setAudioUrl('');
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------
  // 2) Al hacer clic en "Procesar Información"
  const handleSubmit = () => {
    if (activeTab === 'audio') {
      // Si hay Base64 (subió un archivo), lo enviamos
      if (audioDataUrl) {
        onProcess('audio', audioDataUrl);
      }
      // Si no, y hay URL, la enviamos
      else if (audioUrl) {
        onProcess('audio', audioUrl);
      }
      // Si no hay ninguno, avisamos al usuario
      else {
        alert('Por favor, sube un archivo de audio o ingresa una URL válida.');
      }
    } else {
      // Pestaña de texto
      if (!textInput.trim()) {
        alert('Por favor, ingresa algún texto para procesar.');
        return;
      }
      onProcess('text', textInput.trim());
    }
  };

  return (
    <Tabs
      defaultValue="audio"
      className="w-full"
      onValueChange={(value) => setActiveTab(value as 'audio' | 'text')}
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger
          value="audio"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <FileAudio className="mr-2 h-5 w-5" />
          Cargar Audio
        </TabsTrigger>
        <TabsTrigger
          value="text"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <Keyboard className="mr-2 h-5 w-5" />
          Ingresar Texto
        </TabsTrigger>
      </TabsList>

      {/* ================= PESTAÑA AUDIO ================= */}
      <TabsContent value="audio">
        <div className="space-y-3">
          {/* 1) Input para subir archivo */}
          <Label htmlFor="audioFile" className="text-sm font-medium">
            Selecciona un archivo de audio (MP3 o WAV)
          </Label>
          <input
            id="audioFile"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-primary-foreground
                       hover:file:bg-primary/90"
          />
          <p className="text-xs text-muted-foreground">
            O bien ingresa una URL pública para el audio.
          </p>

          {/* 2) Campo opcional para URL */}
          <Label htmlFor="audioUrl" className="text-sm font-medium">
            o Ingresa la URL del audio
          </Label>
          <Input
            id="audioUrl"
            type="url"
            placeholder="https://ejemplo.com/audio.mp3"
            value={audioUrl}
            onChange={(e) => {
              setAudioUrl(e.target.value);
              // Si el usuario escribe URL, borramos cualquier Base64 anterior
              setAudioDataUrl(null);
            }}
            disabled={isProcessing}
          />
        </div>
      </TabsContent>

      {/* ================= PESTAÑA TEXTO ================= */}
      <TabsContent value="text">
        <div className="space-y-3">
          <Label htmlFor="textInput" className="text-sm font-medium">
            Ingresa el texto a procesar
          </Label>
          <Textarea
            id="textInput"
            placeholder="Escribe aquí la transcripción o notas del paciente..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={8}
            disabled={isProcessing}
          />
        </div>
      </TabsContent>

      {/* Botón de enviar */}
      <Button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full mt-6 text-base py-3"
      >
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
