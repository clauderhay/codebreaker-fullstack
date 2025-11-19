import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ActivityIndicator } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import SetupScreen from './screens/SetupScreen';
import TransitionScreen from './screens/TransitionScreen';
import GuessingScreen from './screens/GuessingScreen';
import GameOverScreen from './screens/GameOverScreen';
import { api, GamePhase, Guess } from './services/api';
import { gameWebSocket, WebSocketMessage } from './services/websocket';

const MAX_ATTEMPTS = 10;

type AppPhase = 'WELCOME' | 'GAME';

export default function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('WELCOME');
  const [gamePhase, setGamePhase] = useState<GamePhase>('SETUP');
  const [gameCode, setGameCode] = useState<string>('');
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Hints & Timer state
  const [hintsRemaining, setHintsRemaining] = useState<number>(2);
  const [revealedHints, setRevealedHints] = useState<Array<{ position: number; digit: number }>>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);

  // Setup WebSocket message handler
  useEffect(() => {
    gameWebSocket.onMessage((message: WebSocketMessage) => {
      console.log('Received WebSocket message:', message);

      switch (message.type) {
        case 'connected':
          // Initial connection - sync state
          if (message.gamePhase) {
            setGamePhase(message.gamePhase as GamePhase);
          }
          if (message.guesses) {
            setGuesses(message.guesses);
          }
          break;

        case 'secret_code_set':
          setGamePhase('TRANSITION');
          break;

        case 'guessing_started':
          setGamePhase('GUESSING');
          break;

        case 'guess_submitted':
          if (message.guess) {
            setGuesses((prev) => [...prev, message.guess!]);
          }
          if (message.gamePhase) {
            setGamePhase(message.gamePhase as GamePhase);
          }
          break;

        case 'hint_used':
          if (message.hint) {
            const hint = message.hint as any;
            setRevealedHints((prev) => [...prev, { position: hint.position, digit: hint.digit }]);
            setHintsRemaining(hint.hints_remaining);
          }
          break;

        case 'game_reset':
          setGamePhase('SETUP');
          setGuesses([]);
          setSecretCode([]);
          setRevealedHints([]);
          setHintsRemaining(2);
          setElapsedTime(0);
          break;
      }
    });

    gameWebSocket.onConnected(() => {
      console.log('WebSocket connected');
      setWsConnected(true);
    });

    gameWebSocket.onDisconnected(() => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    });

    return () => {
      gameWebSocket.disconnect();
    };
  }, []);

  const handleCreateGame = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.createGame();
      setGameCode(response.gameCode);
      setGamePhase('SETUP');
      setGuesses([]);
      setSecretCode([]);
      setAppPhase('GAME');

      // Connect to WebSocket
      gameWebSocket.connect(response.gameCode);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (code: string) => {
    try {
      setLoading(true);
      setError('');

      // Verify game exists
      const gameState = await api.getGame(code);

      setGameCode(code);
      setGamePhase(gameState.gamePhase);
      setGuesses(gameState.guesses);
      setAppPhase('GAME');

      // Connect to WebSocket
      gameWebSocket.connect(code);
    } catch (err) {
      setError('Game not found. Please check the code and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSet = async (code: number[]) => {
    try {
      setLoading(true);
      setError('');
      await api.setSecretCode(gameCode, code);
      setSecretCode(code);
      setGamePhase('TRANSITION');
    } catch (err) {
      setError('Failed to set secret code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGuessing = async () => {
    try {
      setLoading(true);
      setError('');
      await api.startGuessing(gameCode);
      setGamePhase('GUESSING');

      // Start timer
      setElapsedTime(0);
      const timerInterval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      // Clean up timer on unmount
      return () => clearInterval(timerInterval);
    } catch (err) {
      setError('Failed to start guessing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHint = async () => {
    try {
      const hint = await api.requestHint(gameCode);
      setRevealedHints((prev) => [...prev, { position: hint.position, digit: hint.digit }]);
      setHintsRemaining(hint.hints_remaining);
    } catch (err: any) {
      setError(err.message || 'Failed to get hint');
      console.error(err);
      setTimeout(() => setError(''), 3000); // Clear error after 3s
    }
  };

  const handleSubmitGuess = async (guess: number[]) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.submitGuess(gameCode, guess);
      setGuesses([...guesses, response.guess]);
      setGamePhase(response.gamePhase);
    } catch (err) {
      setError('Failed to submit guess');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    try {
      setLoading(true);
      setError('');
      await api.resetGame(gameCode);
      setGamePhase('SETUP');
      setSecretCode([]);
      setGuesses([]);
    } catch (err) {
      setError('Failed to reset game');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    gameWebSocket.disconnect();
    setAppPhase('WELCOME');
    setGameCode('');
    setGamePhase('SETUP');
    setGuesses([]);
    setSecretCode([]);
    setError('');
  };

  const renderContent = () => {
    // Show welcome screen
    if (appPhase === 'WELCOME') {
      return (
        <WelcomeScreen onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
      );
    }

    // Show loading state
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>
            {gameCode ? 'Loading game...' : 'Creating game...'}
          </Text>
        </View>
      );
    }

    // Show error state
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    // Render game screens
    switch (gamePhase) {
      case 'SETUP':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <Text style={styles.gameCodeText}>Game Code: {gameCode}</Text>
              {wsConnected && <View style={styles.connectedIndicator} />}
            </View>
            <SetupScreen onCodeSet={handleCodeSet} />
          </View>
        );
      case 'TRANSITION':
        return <TransitionScreen onStartGuessing={handleStartGuessing} />;
      case 'GUESSING':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <Text style={styles.gameCodeText}>Game Code: {gameCode}</Text>
              {wsConnected && <View style={styles.connectedIndicator} />}
            </View>
            <GuessingScreen
              guesses={guesses}
              maxAttempts={MAX_ATTEMPTS}
              onSubmitGuess={handleSubmitGuess}
              onRequestHint={handleRequestHint}
              hintsRemaining={hintsRemaining}
              revealedHints={revealedHints}
              elapsedTime={elapsedTime}
              timeLimit={timeLimit}
            />
          </View>
        );
      case 'GAME_OVER':
        const isVictory = guesses[guesses.length - 1]?.wellPlaced === 4;
        return (
          <GameOverScreen
            isVictory={isVictory}
            secretCode={secretCode}
            onPlayAgain={handlePlayAgain}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  content: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  gameCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  connectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 8,
  },
});
