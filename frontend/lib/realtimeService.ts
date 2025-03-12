import { RealtimeEvent, RealtimeResponseCreateEvent } from './types';

export class RealtimeService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private isConnected: boolean = false;
  private ephemeralKey: string = '';
  private onMessageCallback: ((event: RealtimeEvent) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private onDisconnectedCallback: (() => void) | null = null;

  constructor() {
    // Only initialize Audio in browser environments
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.autoplay = true;
    }
  }

  public async initialize(onMessage: (event: RealtimeEvent) => void, onConnected?: () => void, onDisconnected?: () => void): Promise<boolean> {
    try {
      this.onMessageCallback = onMessage;
      this.onConnectedCallback = onConnected || null;
      this.onDisconnectedCallback = onDisconnected || null;
      
      // Get ephemeral key from backend
      const token = await this.getEphemeralKey();
      if (!token) return false;
      
      this.ephemeralKey = token;
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection();
      
      // Set up audio
      this.peerConnection.ontrack = (e) => {
        if (this.audioElement) {
          this.audioElement.srcObject = e.streams[0];
        }
      };
      
      // Create data channel
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      this.dataChannel.onmessage = (e) => {
        if (this.onMessageCallback) {
          try {
            const eventData = JSON.parse(e.data) as RealtimeEvent;
            this.onMessageCallback(eventData);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }
      };
      
      this.dataChannel.onopen = () => {
        this.isConnected = true;
        if (this.onConnectedCallback) this.onConnectedCallback();
      };
      
      this.dataChannel.onclose = () => {
        this.isConnected = false;
        if (this.onDisconnectedCallback) this.onDisconnectedCallback();
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing realtime service:', error);
      return false;
    }
  }
  
  public async startMicrophone(): Promise<boolean> {
    try {
      if (!this.peerConnection || typeof window === 'undefined') return false;
      
      // Get microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Add audio track to peer connection
      this.localStream.getAudioTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error starting microphone:', error);
      return false;
    }
  }
  
  public async connect(): Promise<boolean> {
    try {
      if (!this.peerConnection) return false;
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete
      const completeOffer = await this.waitForIceComplete();
      if (!completeOffer) return false;
      
      // Send offer to OpenAI
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: completeOffer.sdp,
        headers: {
          'Authorization': `Bearer ${this.ephemeralKey}`,
          'Content-Type': 'application/sdp'
        },
      });
      
      if (!sdpResponse.ok) {
        console.error('Error connecting to OpenAI:', await sdpResponse.text());
        return false;
      }
      
      // Set remote description
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.peerConnection.setRemoteDescription(answer);
      return true;
    } catch (error) {
      console.error('Error connecting to OpenAI:', error);
      return false;
    }
  }
  
  private async waitForIceComplete(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection || !this.peerConnection.localDescription) {
      return null;
    }
    
    return new Promise((resolve) => {
      const checkIce = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          resolve(this.peerConnection.localDescription);
        } else {
          setTimeout(checkIce, 100);
        }
      };
      
      checkIce();
    });
  }
  
  public sendMessage(message: RealtimeEvent): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }
    
    try {
      this.dataChannel.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  public startConversation(instructions?: string): boolean {
    const event: RealtimeResponseCreateEvent = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: instructions || 'Have a conversation with me.',
      },
    };
    
    return this.sendMessage(event);
  }
  
  public disconnect(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.isConnected = false;
    if (this.onDisconnectedCallback) this.onDisconnectedCallback();
  }
  
  private async getEphemeralKey(): Promise<string> {
    try {
      // Use the full backend URL instead of a relative path
      const backendUrl = 'http://localhost:3001/api/realtime/token';
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get ephemeral key:', errorText);
        throw new Error(`Failed to get ephemeral key: ${errorText}`);
      }
      
      const data = await response.json();
      return data.client_secret.value;
    } catch (error) {
      console.error('Error getting ephemeral key:', error);
      return '';
    }
  }
}

export default new RealtimeService();
