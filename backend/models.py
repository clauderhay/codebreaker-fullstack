"""
Pydantic models for API requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Literal

GamePhase = Literal["SETUP", "TRANSITION", "GUESSING", "GAME_OVER"]

class Guess(BaseModel):
    id: int
    guess: list[int]
    wellPlaced: int
    misplaced: int

class SetSecretCodeRequest(BaseModel):
    secretCode: list[int] = Field(..., min_length=4, max_length=4)

class SubmitGuessRequest(BaseModel):
    guess: list[int] = Field(..., min_length=4, max_length=4)

class GameResponse(BaseModel):
    gameCode: str
    gamePhase: GamePhase
    guesses: list[Guess]
    maxAttempts: int
    isVictory: bool | None = None
    currentPlayer: str | None = None

class CreateGameResponse(BaseModel):
    gameCode: str
    message: str
