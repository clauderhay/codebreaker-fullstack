/**
 * API Service for Code Breaker backend
 */

// Configure this to match your backend URL
// For local development: http://localhost:8000
// For production: update with your deployed backend URL
const API_BASE_URL = 'http://localhost:8000';

export interface Guess {
  id: number;
  guess: number[];
  wellPlaced: number;
  misplaced: number;
}

export type GamePhase = 'SETUP' | 'TRANSITION' | 'GUESSING' | 'GAME_OVER';

export interface GameState {
  gameCode: string;
  gamePhase: GamePhase;
  guesses: Guess[];
  maxAttempts: number;
  isVictory: boolean | null;
}

export interface CreateGameResponse {
  gameCode: string;
  message: string;
}

export interface SubmitGuessResponse {
  guess: Guess;
  gamePhase: GamePhase;
  isVictory: boolean | null;
}

class CodeBreakerAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Create a new game
   */
  async createGame(): Promise<CreateGameResponse> {
    const response = await fetch(`${this.baseURL}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current game state
   */
  async getGame(gameCode: string): Promise<GameState> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get game: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set the secret code (Player 1)
   */
  async setSecretCode(gameCode: string, secretCode: number[]): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}/set-secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secretCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to set secret code');
    }
  }

  /**
   * Start the guessing phase (Player 2)
   */
  async startGuessing(gameCode: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}/start-guessing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start guessing');
    }
  }

  /**
   * Submit a guess (Player 2)
   */
  async submitGuess(gameCode: string, guess: number[]): Promise<SubmitGuessResponse> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guess }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit guess');
    }

    return response.json();
  }

  /**
   * Reset game to play again
   */
  async resetGame(gameCode: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset game');
    }
  }

  /**
   * Request a hint (reveals one digit)
   */
  async requestHint(gameCode: string): Promise<{ position: number; digit: number; hints_remaining: number }> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}/hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get hint');
    }

    return response.json();
  }

  /**
   * Get timer information
   */
  async getTimer(gameCode: string): Promise<{
    elapsed_time: number | null;
    time_limit: number | null;
    is_expired: boolean;
    time_remaining: number | null;
  }> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}/timer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get timer');
    }

    return response.json();
  }

  /**
   * Delete a game (cleanup)
   */
  async deleteGame(gameCode: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/games/${gameCode}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete game');
    }
  }
}

// Export singleton instance
export const api = new CodeBreakerAPI();
