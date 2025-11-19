"""
FastAPI backend for Code Breaker game.
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import (
    SetSecretCodeRequest,
    SubmitGuessRequest,
    GameResponse,
    CreateGameResponse,
    Guess
)
from game_state import game_manager
from game_logic import check_guess
from typing import Dict, List
import json

app = FastAPI(
    title="Code Breaker API",
    description="Backend API for the Code Breaker multiplayer game",
    version="1.0.0"
)

# Enable CORS for React Native/Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        # game_code -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, game_code: str):
        await websocket.accept()
        if game_code not in self.active_connections:
            self.active_connections[game_code] = []
        self.active_connections[game_code].append(websocket)

    def disconnect(self, websocket: WebSocket, game_code: str):
        if game_code in self.active_connections:
            self.active_connections[game_code].remove(websocket)
            if len(self.active_connections[game_code]) == 0:
                del self.active_connections[game_code]

    async def broadcast(self, game_code: str, message: dict):
        """Broadcast message to all clients connected to this game."""
        if game_code in self.active_connections:
            disconnected = []
            for connection in self.active_connections[game_code]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)

            # Clean up disconnected clients
            for conn in disconnected:
                self.disconnect(conn, game_code)

manager = ConnectionManager()

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Code Breaker API is running"}

@app.websocket("/ws/{game_code}")
async def websocket_endpoint(websocket: WebSocket, game_code: str):
    """
    WebSocket endpoint for real-time game updates.
    Clients connect to receive live updates when game state changes.
    """
    await manager.connect(websocket, game_code)
    try:
        # Send initial game state
        game = game_manager.get_game(game_code)
        if game:
            await websocket.send_json({
                "type": "connected",
                "gameCode": game_code,
                "gamePhase": game.phase,
                "guesses": [g.dict() for g in game.guesses],
                "maxAttempts": game.max_attempts,
                "isVictory": game.is_victory
            })

        # Keep connection alive and listen for disconnect
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, game_code)

@app.post("/api/games", response_model=CreateGameResponse)
def create_game():
    """
    Create a new game.
    Returns a unique game code that players can use to join.
    """
    game_code = game_manager.create_game()
    return CreateGameResponse(
        gameCode=game_code,
        message="Game created successfully. Share this code with other players."
    )

@app.get("/api/games/{game_code}", response_model=GameResponse)
def get_game(game_code: str):
    """
    Get the current state of a game.
    Note: The secret code is never exposed to clients.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return GameResponse(
        gameCode=game.game_code,
        gamePhase=game.phase,
        guesses=game.guesses,
        maxAttempts=game.max_attempts,
        isVictory=game.is_victory
    )

@app.post("/api/games/{game_code}/set-secret")
async def set_secret_code(game_code: str, request: SetSecretCodeRequest):
    """
    Player 1 sets the secret code.
    Validates the code and transitions game to TRANSITION phase.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.phase != "SETUP":
        raise HTTPException(
            status_code=400,
            detail="Secret code can only be set during SETUP phase"
        )

    # Validate secret code
    if len(request.secretCode) != 4:
        raise HTTPException(status_code=400, detail="Secret code must be 4 digits")

    for digit in request.secretCode:
        if not isinstance(digit, int) or digit < 0 or digit > 9:
            raise HTTPException(
                status_code=400,
                detail="Each digit must be an integer between 0 and 9"
            )

    game.set_secret_code(request.secretCode)

    # Broadcast update to all connected clients
    await manager.broadcast(game_code, {
        "type": "secret_code_set",
        "gamePhase": game.phase
    })

    return {
        "message": "Secret code set successfully",
        "gamePhase": game.phase
    }

@app.post("/api/games/{game_code}/start-guessing")
async def start_guessing(game_code: str):
    """
    Transition from TRANSITION phase to GUESSING phase.
    Called when Player 2 is ready to start guessing.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.phase != "TRANSITION":
        raise HTTPException(
            status_code=400,
            detail="Can only start guessing from TRANSITION phase"
        )

    game.start_guessing()

    # Broadcast update to all connected clients
    await manager.broadcast(game_code, {
        "type": "guessing_started",
        "gamePhase": game.phase
    })

    return {
        "message": "Guessing phase started",
        "gamePhase": game.phase
    }

@app.post("/api/games/{game_code}/guess")
async def submit_guess(game_code: str, request: SubmitGuessRequest):
    """
    Submit a guess and get feedback.
    Returns wellPlaced (correct position) and misplaced (wrong position) counts.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.phase != "GUESSING":
        raise HTTPException(
            status_code=400,
            detail="Can only submit guesses during GUESSING phase"
        )

    if not game.secret_code:
        raise HTTPException(status_code=400, detail="Secret code not set")

    # Validate guess
    if len(request.guess) != 4:
        raise HTTPException(status_code=400, detail="Guess must be 4 digits")

    for digit in request.guess:
        if not isinstance(digit, int) or digit < 0 or digit > 9:
            raise HTTPException(
                status_code=400,
                detail="Each digit must be an integer between 0 and 9"
            )

    # Check the guess
    result = check_guess(request.guess, game.secret_code)

    # Create guess object
    new_guess = Guess(
        id=len(game.guesses) + 1,
        guess=request.guess,
        wellPlaced=result["wellPlaced"],
        misplaced=result["misplaced"]
    )

    game.add_guess(new_guess)

    # Broadcast update to all connected clients
    await manager.broadcast(game_code, {
        "type": "guess_submitted",
        "guess": new_guess.dict(),
        "gamePhase": game.phase,
        "isVictory": game.is_victory
    })

    return {
        "guess": new_guess,
        "gamePhase": game.phase,
        "isVictory": game.is_victory
    }

@app.post("/api/games/{game_code}/hint")
async def request_hint(game_code: str):
    """
    Request a hint (reveals one digit position).
    Limited number of hints per game.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.phase != "GUESSING":
        raise HTTPException(
            status_code=400,
            detail="Hints can only be requested during GUESSING phase"
        )

    hint = game.use_hint()
    if hint is None:
        raise HTTPException(
            status_code=400,
            detail="No hints remaining or all positions already revealed"
        )

    # Broadcast hint to all connected clients
    await manager.broadcast(game_code, {
        "type": "hint_used",
        "hint": hint
    })

    return {
        "message": "Hint revealed",
        **hint
    }

@app.get("/api/games/{game_code}/timer")
async def get_timer(game_code: str):
    """
    Get elapsed time and time limit info.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    elapsed = game.get_elapsed_time()
    is_expired = game.is_time_expired()

    return {
        "elapsed_time": elapsed,
        "time_limit": game.time_limit,
        "is_expired": is_expired,
        "time_remaining": (game.time_limit - elapsed) if (game.time_limit and elapsed) else None
    }

@app.post("/api/games/{game_code}/reset")
async def reset_game(game_code: str):
    """
    Reset the game for play again.
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    game.reset()

    # Broadcast update to all connected clients
    await manager.broadcast(game_code, {
        "type": "game_reset",
        "gamePhase": game.phase
    })

    return {
        "message": "Game reset successfully",
        "gamePhase": game.phase
    }

@app.delete("/api/games/{game_code}")
def delete_game(game_code: str):
    """
    Delete a game (cleanup).
    """
    game = game_manager.get_game(game_code)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    game_manager.delete_game(game_code)

    return {"message": "Game deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
