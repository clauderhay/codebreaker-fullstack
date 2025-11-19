"""
In-memory game state management.
"""
import random
import string
import time
from typing import Dict, Optional
from models import GamePhase, Guess

class Game:
    def __init__(self, game_code: str, max_hints: int = 2, time_limit: Optional[int] = None):
        self.game_code = game_code
        self.secret_code: Optional[list[int]] = None
        self.phase: GamePhase = "SETUP"
        self.guesses: list[Guess] = []
        self.max_attempts = 10
        self.is_victory: Optional[bool] = None
        self.max_hints = max_hints
        self.hints_used = 0
        self.revealed_positions: list[int] = []  # Positions revealed by hints
        self.time_limit = time_limit  # Time limit in seconds (None = no limit)
        self.start_time: Optional[float] = None

    def set_secret_code(self, code: list[int]):
        """Set the secret code and move to TRANSITION phase."""
        self.secret_code = code
        self.phase = "TRANSITION"

    def start_guessing(self):
        """Move from TRANSITION to GUESSING phase."""
        if self.phase == "TRANSITION":
            self.phase = "GUESSING"
            self.start_time = time.time()  # Start timer

    def use_hint(self) -> Optional[dict]:
        """Use a hint to reveal one digit. Returns hint info or None if no hints left."""
        if self.hints_used >= self.max_hints:
            return None

        if not self.secret_code:
            return None

        # Find positions not yet revealed
        unrevealed_positions = [i for i in range(len(self.secret_code)) if i not in self.revealed_positions]

        if not unrevealed_positions:
            return None

        # Reveal a random unrevealed position
        position = random.choice(unrevealed_positions)
        digit = self.secret_code[position]

        self.revealed_positions.append(position)
        self.hints_used += 1

        return {
            "position": position,
            "digit": digit,
            "hints_remaining": self.max_hints - self.hints_used
        }

    def get_elapsed_time(self) -> Optional[float]:
        """Get elapsed time in seconds since guessing started."""
        if self.start_time is None:
            return None
        return time.time() - self.start_time

    def is_time_expired(self) -> bool:
        """Check if time limit has been exceeded."""
        if self.time_limit is None:
            return False
        elapsed = self.get_elapsed_time()
        return elapsed is not None and elapsed > self.time_limit

    def add_guess(self, guess_data: Guess):
        """Add a guess and check if game is over."""
        self.guesses.append(guess_data)

        if guess_data.wellPlaced == 4:
            self.phase = "GAME_OVER"
            self.is_victory = True
        elif len(self.guesses) >= self.max_attempts:
            self.phase = "GAME_OVER"
            self.is_victory = False

    def reset(self):
        """Reset game for play again."""
        self.secret_code = None
        self.phase = "SETUP"
        self.guesses = []
        self.is_victory = None
        self.hints_used = 0
        self.revealed_positions = []
        self.start_time = None

class GameStateManager:
    def __init__(self):
        self.games: Dict[str, Game] = {}

    def generate_game_code(self) -> str:
        """Generate a unique 6-character game code."""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if code not in self.games:
                return code

    def create_game(self) -> str:
        """Create a new game and return its code."""
        game_code = self.generate_game_code()
        self.games[game_code] = Game(game_code)
        return game_code

    def get_game(self, game_code: str) -> Optional[Game]:
        """Get a game by code."""
        return self.games.get(game_code)

    def delete_game(self, game_code: str):
        """Delete a game."""
        if game_code in self.games:
            del self.games[game_code]

# Global game state manager
game_manager = GameStateManager()
