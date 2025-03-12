'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/lib/useRealtime';
import { RealtimeMessage } from '@/lib/types';

export default function ClientHome() {
  const [localError, setLocalError] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [isAttemptingToRecord, setIsAttemptingToRecord] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const micPermissionDeniedRef = useRef(false);
  
  // Use the Realtime API hook
  const {
    isRecording,
    messages,
    error: realtimeError,
    toggleConversation,
    stopConversation,
    clearError
  } = useRealtime();

  // Clear error when recording state changes
  useEffect(() => {
    if (isRecording) {
      setLocalError(null);
      setIsAttemptingToRecord(false);
      micPermissionDeniedRef.current = false;
    }
  }, [isRecording]);

  // Show messages panel when we have messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowMessages(true);
    }
  }, [messages]);

  // Handle realtime errors
  useEffect(() => {
    if (realtimeError) {
      // If the error is about microphone access, mark it
      if (realtimeError.includes('microphone')) {
        micPermissionDeniedRef.current = true;
      }
      
      // Stop attempting to record if there's an error
      if (isAttemptingToRecord) {
        setIsAttemptingToRecord(false);
      }
    }
  }, [realtimeError, isAttemptingToRecord]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && showMessages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showMessages]);

  const handleToggleRecording = async () => {
    // Clear any previous errors
    setLocalError(null);
    clearError();
    
    // If already recording, just stop
    if (isRecording) {
      stopConversation();
      return;
    }
    
    // Check if microphone permission was previously denied
    if (micPermissionDeniedRef.current) {
      setLocalError('Microphone access was denied. Please grant microphone permissions and reload the page.');
      return;
    }
    
    // Otherwise, attempt to start recording
    setIsAttemptingToRecord(true);
    try {
      const success = await toggleConversation();
      
      // If the toggle was not successful and no error was set in the hook,
      // we need to show a fallback error
      if (!success && !realtimeError) {
        setLocalError('Failed to start recording. Please try again.');
        setIsAttemptingToRecord(false);
      }
    } catch (err) {
      setLocalError('An error occurred while starting the conversation');
      console.error(err);
      setIsAttemptingToRecord(false);
    }
  };

  const handleEndConversation = () => {
    stopConversation();
    setIsAttemptingToRecord(false);
    // Don't hide messages when ending conversation
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background-end))] dark:bg-slate-900 bg-pattern">
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary dark:text-slate-100">
            Voice Conversation Assistant
          </h1>
          <p className="text-muted-foreground dark:text-slate-400 mt-2">
            Click the microphone to start talking
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Main Content Area - Split into two sections when messages are shown */}
          <div className={`w-full flex ${showMessages ? 'flex-row' : 'flex-col items-center'} gap-8`}>
            {/* Microphone Section */}
            <div className={`${showMessages ? 'w-1/2' : 'w-full'} flex flex-col items-center justify-center`}>
              {/* Microphone UI - Only shown when not recording */}
              {!isRecording && !isAttemptingToRecord ? (
                <div className="relative flex items-center justify-center transform transition-all duration-500">
                  {/* Decorative rings */}
                  <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                  <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                  
                  {/* Microphone Button with gradient */}
                  <Button
                    type="button"
                    onClick={handleToggleRecording}
                    aria-label="Start recording"
                    className="relative z-10 rounded-full w-28 h-28 flex items-center justify-center transition-all duration-500
                      bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                      hover:scale-105 border-4 border-white/20 dark:border-slate-700/30"
                  >
                    <MicrophoneIcon isRecording={false} size={32} />
                  </Button>
                </div>
              ) : (
                /* Audio Visualization - Shown when recording or attempting to record */
                <div className="my-12 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Animated rings */}
                    <div className="absolute w-full h-full rounded-full bg-purple-500/5 animate-ping-slow"></div>
                    <div className="absolute w-[110%] h-[110%] rounded-full bg-blue-500/5 animate-ping-slower"></div>
                    
                    {/* Central audio visualization */}
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <div className="flex items-center justify-center w-full h-full">
                          {Array.from({ length: 24 }).map((_, i) => {
                            const angle = (i * 15) * Math.PI / 180;
                            const x = Math.cos(angle) * 50;
                            const y = Math.sin(angle) * 50;
                            return (
                              <div 
                                key={i}
                                className="absolute w-1.5 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full animate-sound-wave"
                                style={{
                                  height: `${Math.max(10, Math.min(40, 15 + Math.sin(i/3) * 25))}px`,
                                  animationDelay: `${i * 0.05}s`,
                                  transform: `translate(${x}px, ${y}px) rotate(${angle + Math.PI/2}rad)`,
                                  transformOrigin: 'bottom',
                                }}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        <span className="animate-pulse">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Status Text */}
              <div className="mt-6 text-center">
                <p className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                  {isRecording ? "I'm listening..." : isAttemptingToRecord ? "Starting..." : "Click to speak"}
                </p>
                {(localError || realtimeError) && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800/30 max-w-xs mx-auto">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {localError || realtimeError}
                    </p>
                    <button 
                      onClick={() => {
                        setLocalError(null);
                        clearError();
                        setIsAttemptingToRecord(false);
                      }}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-1 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              
              {/* End Conversation Button - Shown when recording or when there are messages */}
              {(isRecording || messages.length > 0) && (
                <Button
                  type="button"
                  onClick={handleEndConversation}
                  className="mt-8 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700
                    text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40
                    transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <span>End Conversation</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                </Button>
              )}
            </div>
            
            {/* Messages Section - Only shown when there are messages */}
            {showMessages && (
              <div className="w-1/2 card-container dark:bg-slate-800/90 dark:border-slate-700/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-primary dark:text-slate-100">Conversation</h2>
                <div className="space-y-4">
                  {messages.map((message: RealtimeMessage, index: number) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted dark:bg-slate-700'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>
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
function MicrophoneIcon({ isRecording, size = 20 }: { isRecording: boolean; size?: number }) {
  return (
    <div className="flex items-center transition-all duration-300">
      {!isRecording ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
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
              width={size - 2}
              height={size - 2}
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
