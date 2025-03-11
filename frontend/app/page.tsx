'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [text, setText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneticText, setPhoneticText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (error) setError(null);
    
    // Generate phonetic spelling
    if (newText) {
      // Simple phonetic conversion for demonstration
      // In a real app, this would use a proper phonetic API
      const simplified = newText
        .toLowerCase()
        .replace(/th/g, 'θ')
        .replace(/ch/g, 'tʃ')
        .replace(/sh/g, 'ʃ')
        .replace(/ng/g, 'ŋ')
        .replace(/zh/g, 'ʒ');
      setPhoneticText(`/${simplified}/`);
    } else {
      setPhoneticText('');
    }
  };

  const validateInput = (): boolean => {
    if (!text.trim()) {
      setError('Please enter some text');
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual audio recording functionality
    console.log(isRecording ? 'Stopped recording' : 'Started recording');
    
    // Focus back on the input after toggling recording
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background-end))] dark:bg-slate-900 bg-pattern">
      <div className="w-full max-w-2xl mx-auto space-y-8 p-6 sm:p-8 card-container dark:bg-slate-800/90 dark:border-slate-700/30">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-primary dark:text-slate-100 text-improved">
            What can I help with?
          </h1>
          <p className="text-muted-foreground dark:text-slate-400 text-improved">
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
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-7 px-8 text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-improved"
                aria-label="Ask anything"
                aria-invalid={!!error}
                aria-describedby={error ? "input-error" : phoneticText ? "phonetic-text" : undefined}
              />
              <div className="absolute right-3 flex items-center">
                <Button
                  type="button"
                  onClick={toggleRecording}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                  className={`rounded-md transition-all duration-300 ${
                    isRecording 
                      ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-4 py-3 speech-active' 
                      : 'bg-transparent hover:bg-secondary/50 text-muted-foreground border border-transparent hover:border-input p-3'
                  }`}
                >
                  <MicrophoneIcon isRecording={isRecording} />
                </Button>
              </div>
            </div>
            {error && (
              <p id="input-error" className="mt-2 text-sm text-red-500 pl-6">
                {error}
              </p>
            )}
            {!error && phoneticText && (
              <p id="phonetic-text" className="phonetic-text w-[85%] mx-auto text-center" aria-label="Phonetic pronunciation">
                {phoneticText}
              </p>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <FeatureButton icon={<AttachmentIcon />} label="Add attachment" />
            <FeatureButton icon={<SearchIcon />} label="Search" />
            <FeatureButton icon={<SettingsIcon />} label="Settings" />
          </div>
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

// Additional UI icons
function AttachmentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
