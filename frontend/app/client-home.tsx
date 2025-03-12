'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealtime } from '@/lib/useRealtime';
import { RealtimeMessage } from '@/lib/types';

export default function ClientHome() {
  const [text, setText] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use the Realtime API hook
  const {
    isRecording,
    messages,
    error: realtimeError,
    toggleConversation
  } = useRealtime();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (localError) setLocalError(null);
  };

  const validateInput = (): boolean => {
    if (!text.trim()) {
      setLocalError('Please enter some text');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInput()) {
      // Handle form submission
      console.log('Submitted text:', text);
    }
  };

  const handleToggleRecording = async () => {
    await toggleConversation();
    
    // Focus back on the input after toggling recording
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background-end))] dark:bg-slate-900 bg-pattern">
      <div className="w-full max-w-2xl mx-auto space-y-8 p-6 sm:p-8 card-container dark:bg-slate-800/90 dark:border-slate-700/30">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-primary dark:text-slate-100">
            What can I help with?
          </h1>
          <p className="text-muted-foreground dark:text-slate-400">
            Ask me anything or use the microphone to speak
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="relative flex items-center w-[85%] mx-auto overflow-hidden bg-white dark:bg-slate-800/90 rounded-lg border border-input shadow-input transition-all duration-300 focus-within:ring-1 focus-within:ring-accent min-h-[4.5rem]">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask anything"
                value={text}
                onChange={handleTextChange}
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-7 px-8 text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                aria-label="Ask anything"
                aria-invalid={!!localError}
                aria-describedby={localError ? "input-error" : undefined}
              />
              <div className="absolute right-3 flex items-center">
                <Button
                  type="button"
                  onClick={handleToggleRecording}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                  className={`rounded-md transition-all duration-300 ${
                    isRecording 
                      ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-4 py-3' 
                      : 'bg-transparent hover:bg-secondary/50 text-muted-foreground border border-transparent hover:border-input p-3'
                  }`}
                >
                  <MicrophoneIcon isRecording={isRecording} />
                </Button>
              </div>
            </div>
            {(localError || realtimeError) && (
              <p id="input-error" className="mt-2 text-sm text-red-500 pl-6">
                {localError || realtimeError}
              </p>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <FeatureButton icon={<AttachmentIcon />} label="Add attachment" />
            <FeatureButton icon={<SearchIcon />} label="Search" />
            <FeatureButton icon={<SettingsIcon />} label="Settings" />
          </div>
          
          {/* Conversation Messages */}
          {messages.length > 0 && (
            <div className="mt-6 space-y-4 max-h-96 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              {messages.map((message: RealtimeMessage, index: number) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

// Feature button component
function FeatureButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Button
      type="button"
      className="bg-transparent hover:bg-secondary dark:hover:bg-slate-800 text-muted-foreground dark:text-slate-300 rounded-md p-3 transition-all duration-300 border border-transparent hover:border-input"
      aria-label={label}
    >
      {icon}
    </Button>
  );
}

// Microphone icon component with audio wave animation
function MicrophoneIcon({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="flex items-center transition-all duration-300">
      {!isRecording ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-300"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div className="flex items-end space-x-0.5 h-4 pb-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="w-0.5 bg-current animate-sound-wave rounded-t-sm" 
                style={{ 
                  height: `${3 + i * 2}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components
function AttachmentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
