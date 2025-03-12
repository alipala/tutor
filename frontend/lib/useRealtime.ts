import { useState, useEffect, useCallback } from 'react';
import realtimeService from './realtimeService';
import { RealtimeMessage, RealtimeEvent, RealtimeTextDeltaEvent, RealtimeAudioTranscriptionEvent } from './types';

export function useRealtime() {
  // Check if running in browser environment
  const isBrowser = typeof window !== 'undefined';
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback((event: RealtimeEvent) => {
    console.log('Received event:', event);
    
    // Handle different event types
    if (event.type === 'response.text.delta') {
      const textEvent = event as RealtimeTextDeltaEvent;
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update the last message
          const updatedMessages = [...prev];
          updatedMessages[prev.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + (textEvent.delta?.text || '')
          };
          return updatedMessages;
        } else {
          // Create a new message
          return [...prev, { role: 'assistant', content: textEvent.delta?.text || '' }];
        }
      });
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const transcriptionEvent = event as RealtimeAudioTranscriptionEvent;
      // Add user's transcribed message
      if (transcriptionEvent.transcription?.text) {
        setMessages(prev => [...prev, { role: 'user', content: transcriptionEvent.transcription.text }]);
      }
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      const success = await realtimeService.initialize(
        handleMessage,
        () => setIsConnected(true),
        () => {
          setIsConnected(false);
          setIsRecording(false);
        }
      );
      
      if (success) {
        setIsInitialized(true);
      } else {
        setError('Failed to initialize realtime service');
      }
    } catch (err) {
      setError('Error initializing realtime service');
      console.error(err);
    }
  }, [handleMessage]);

  const startConversation = useCallback(async () => {
    if (!isBrowser) return false;
    if (!isInitialized) {
      await initialize();
    }
    
    try {
      setError(null);
      const micSuccess = await realtimeService.startMicrophone();
      if (!micSuccess) {
        setError('Failed to access microphone');
        return false;
      }
      
      const connectSuccess = await realtimeService.connect();
      if (!connectSuccess) {
        setError('Failed to connect to OpenAI');
        return false;
      }
      
      const startSuccess = realtimeService.startConversation();
      if (!startSuccess) {
        setError('Failed to start conversation');
        return false;
      }
      
      setIsRecording(true);
      return true;
    } catch (err) {
      setError('Error starting conversation');
      console.error(err);
      return false;
    }
  }, [isInitialized, initialize]);

  const stopConversation = useCallback(() => {
    realtimeService.disconnect();
    setIsRecording(false);
  }, []);

  const toggleConversation = useCallback(async () => {
    if (isRecording) {
      stopConversation();
    } else {
      await startConversation();
    }
  }, [isRecording, startConversation, stopConversation]);

  useEffect(() => {
    if (!isBrowser) return;
    
    return () => {
      // Clean up on component unmount
      realtimeService.disconnect();
    };
  }, [isBrowser]);

  return {
    isConnected,
    isRecording,
    messages,
    error,
    toggleConversation,
    startConversation,
    stopConversation
  };
}
