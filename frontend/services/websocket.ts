/**
 * WebSocket service for real-time game updates
 */

const WS_BASE_URL = 'ws://localhost:8000';

export interface WebSocketMessage {
  type: 'connected' | 'secret_code_set' | 'guessing_started' | 'guess_submitted' | 'hint_used' | 'game_reset';
  gameCode?: string;
  gamePhase?: string;
  guess?: any;
  hint?: { position: number; digit: number; hints_remaining: number };
  isVictory?: boolean | null;
  guesses?: any[];
  maxAttempts?: number;
}

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private gameCode: string = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessageCallback: ((message: WebSocketMessage) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private onDisconnectedCallback: (() => void) | null = null;

  connect(gameCode: string) {
    this.gameCode = gameCode;
    this.reconnectAttempts = 0;
    this.createWebSocket();
  }

  private createWebSocket() {
    if (!this.gameCode) {
      console.error('Cannot connect: no game code');
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws/${this.gameCode}`;
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (this.onConnectedCallback) {
          this.onConnectedCallback();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          if (this.onMessageCallback) {
            this.onMessageCallback(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (this.onDisconnectedCallback) {
          this.onDisconnectedCallback();
        }

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
          setTimeout(() => {
            this.createWebSocket();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  onMessage(callback: (message: WebSocketMessage) => void) {
    this.onMessageCallback = callback;
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.onDisconnectedCallback = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.gameCode = '';
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const gameWebSocket = new GameWebSocket();
