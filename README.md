# Code Breaker - Full Stack Implementation

A multiplayer code-breaking game built with Python FastAPI backend and React Native (Expo) frontend.

## Overview

This project transforms a local pass-and-play game into a true client-server application where players can create and join games from different devices. One player sets a secret 4-digit code, and the other player has 10 attempts to crack it with detailed feedback on each guess.

## Project Structure

```
codebreaker-challenge/
├── backend/              # Python FastAPI server
│   ├── main.py          # API endpoints and application setup
│   ├── game_logic.py    # Core game logic (checkGuess algorithm)
│   ├── game_state.py    # In-memory game state management
│   ├── models.py        # Pydantic models for requests/responses
│   ├── requirements.txt # Python dependencies
│   └── venv/           # Python virtual environment
│
└── frontend/            # React Native (Expo) application
    ├── App.tsx         # Main app component with backend integration
    ├── services/       # API service layer
    │   └── api.ts      # Backend API client
    ├── screens/        # Game screens (Setup, Guessing, GameOver, etc.)
    ├── components/     # Reusable UI components
    ├── utils/          # Utility functions
    └── package.json    # Node dependencies
```

## Features

- **Stateful Backend**: All game logic and state managed server-side
- **True Multiplayer**: Create games and join via game codes from different devices
- **Real-Time Updates**: WebSocket support for instant synchronization between players
- **RESTful API**: Clean API design with OpenAPI documentation
- **Beautiful UI**: Modern welcome screen with create/join game flow
- **Connection Indicator**: Visual feedback for WebSocket connection status
- **Cross-Platform**: Run on web, iOS, or Android via Expo
- **Error Handling**: Comprehensive error handling and user feedback

## Prerequisites

- **Python 3.12+** (for backend)
- **Node.js 16+** and **npm** (for frontend)
- **Expo CLI** (will be installed with dependencies)

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python3 -m venv venv

   # For bash/zsh:
   source venv/bin/activate

   # For fish shell:
   source venv/bin/activate.fish

   # For Windows:
   venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:

   ```bash
   python3 main.py
   ```

   The server will start on `http://localhost:8000`

5. Verify the server is running:

   ```bash
   curl http://localhost:8000/
   ```

   You should see: `{"status":"ok","message":"Code Breaker API is running"}`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. **Important**: Configure the API URL in `frontend/services/api.ts`:

   - For local development: `http://localhost:8000` (default)
   - For iOS simulator: `http://localhost:8000`
   - For Android emulator: `http://10.0.2.2:8000`
   - For physical device: Use your computer's IP address

4. Start the Expo development server:

   ```bash
   npm start
   ```

5. Run on your desired platform:
   - **Web**: Press `w` in the terminal or run `npm run web`
   - **iOS**: Press `i` or run `npm run ios` (requires Xcode)
   - **Android**: Press `a` or run `npm run android` (requires Android Studio)

## API Documentation

### Interactive API Docs

Once the backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### API Endpoints

#### Core Endpoints

| Method   | Endpoint                                | Description                     |
| -------- | --------------------------------------- | ------------------------------- |
| `GET`    | `/`                                     | Health check                    |
| `POST`   | `/api/games`                            | Create a new game               |
| `GET`    | `/api/games/{game_code}`                | Get game state                  |
| `POST`   | `/api/games/{game_code}/set-secret`     | Set secret code (Player 1)      |
| `POST`   | `/api/games/{game_code}/start-guessing` | Start guessing phase (Player 2) |
| `POST`   | `/api/games/{game_code}/guess`          | Submit a guess (Player 2)       |
| `POST`   | `/api/games/{game_code}/reset`          | Reset game for replay           |
| `DELETE` | `/api/games/{game_code}`                | Delete game                     |

#### Example API Usage

**Create a game:**

```bash
curl -X POST http://localhost:8000/api/games
```

Response:

```json
{
  "gameCode": "ABC123",
  "message": "Game created successfully. Share this code with other players."
}
```

**Set secret code:**

```bash
curl -X POST http://localhost:8000/api/games/ABC123/set-secret \
  -H "Content-Type: application/json" \
  -d '{"secretCode": [1, 2, 3, 4]}'
```

**Submit a guess:**

```bash
curl -X POST http://localhost:8000/api/games/ABC123/guess \
  -H "Content-Type: application/json" \
  -d '{"guess": [1, 2, 5, 6]}'
```

Response:

```json
{
  "guess": {
    "id": 1,
    "guess": [1, 2, 5, 6],
    "wellPlaced": 2,
    "misplaced": 0
  },
  "gamePhase": "GUESSING",
  "isVictory": null
}
```

## How to Play

### Single Device (Pass-and-Play)

1. Start both backend and frontend
2. **Player 1**: Set a 4-digit secret code
3. Pass the device to **Player 2**
4. **Player 2**: Make guesses to crack the code
5. Get feedback: "Well Placed" (correct digit, correct position) and "Misplaced" (correct digit, wrong position)
6. Win by guessing correctly within 10 attempts

### Multiple Devices (True Multiplayer)

1. **Player 1**: Click "Create New Game" and note the game code
2. **Player 2**: Click "Join Existing Game" and enter the game code
3. Both players are now connected via WebSocket (green dot indicator)
4. **Player 1** sets the secret code - **Player 2** sees the update instantly
5. **Player 2** makes guesses - **Player 1** sees each guess in real-time
6. Both players see game over simultaneously

**See `MULTIPLAYER_DEMO.md` for detailed demo instructions!**

## Game Rules

- **Secret Code**: 4 digits, each from 0-9
- **Duplicates**: Allowed (e.g., [1, 1, 2, 3] is valid)
- **Max Attempts**: 10 guesses
- **Feedback**:
  - "Well Placed": Correct digit in correct position
  - "Misplaced": Correct digit in wrong position

## Development Notes

### State Management

- **Backend**: In-memory dictionary (GameStateManager)
  - Production-ready improvement: Redis, PostgreSQL, or MongoDB
- **Frontend**: Local React state synchronized with backend

### Security Considerations

- Secret codes are never exposed in API responses
- CORS configured for development (should be restricted in production)
- Input validation on both client and server

### Code Quality

- TypeScript for frontend type safety
- Pydantic for backend data validation
- Comprehensive error handling
- Clean separation of concerns

## Testing

### Backend Testing

```bash
# Health check
curl http://localhost:8000/

# Create and test full game flow
curl -X POST http://localhost:8000/api/games
# Use the returned game code in subsequent requests
```

### Frontend Testing

1. Run the app on web browser for quick testing
2. Test on iOS/Android simulators for mobile experience
3. Verify error states by stopping the backend

## Future Improvements

See `IMPROVEMENTS.md` for detailed enhancement proposals.

### High Priority

- [x] Join game by code in frontend UI **IMPLEMENTED**
- [x] Real-time updates (WebSocket) **IMPLEMENTED**
- [ ] Persistent storage (Redis/PostgreSQL)
- [ ] Player authentication
- [ ] Game lobby system

### Nice to Have

- [ ] Game history and statistics
- [ ] Leaderboard
- [ ] Custom game settings (code length, max attempts)
- [ ] Hints system
- [ ] Timer mode
- [ ] Docker containerization
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline

## Troubleshooting

### Backend won't start

- Ensure Python 3.12+ is installed: `python3 --version`
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend can't connect to backend

- Verify backend is running: `curl http://localhost:8000/`
- Check API_BASE_URL in `frontend/services/api.ts`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address

### TypeScript errors

- Ensure dependencies are installed: `npm install`
- Check tsconfig.json includes necessary lib options

## Technologies Used

### Backend

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
- **Python 3.12**: Programming language

### Frontend

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform
- **TypeScript**: Type-safe JavaScript
- **React Hooks**: Modern state management

## License

This project is for technical assessment purposes.

## Author

Developed as a technical assessment for demonstrating full-stack development capabilities.

---

**Time Investment**: ~4 hours
**Key Achievement**: Transformed local prototype into networked multiplayer game with clean architecture
