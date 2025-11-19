import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import GuessInput from '../components/GuessInput';
import GuessHistory from '../components/GuessHistory';

interface Guess {
  id: number;
  guess: number[];
  wellPlaced: number;
  misplaced: number;
}

interface GuessingScreenProps {
  guesses: Guess[];
  maxAttempts: number;
  onSubmitGuess: (guess: number[]) => void;
  onRequestHint?: () => void;
  hintsRemaining?: number;
  revealedHints?: Array<{ position: number; digit: number }>;
  elapsedTime?: number;
  timeLimit?: number;
}

const GuessingScreen: React.FC<GuessingScreenProps> = ({
  guesses,
  maxAttempts,
  onSubmitGuess,
  onRequestHint,
  hintsRemaining = 0,
  revealedHints = [],
  elapsedTime,
  timeLimit,
}) => {
  const [currentGuess, setCurrentGuess] = React.useState<(number | null)[]>([null, null, null, null]);

  const attemptsLeft = maxAttempts - guesses.length;
  const isGuessComplete = currentGuess.every((digit) => digit !== null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if time is running out (last 30 seconds)
  const isTimeRunningOut = timeLimit && elapsedTime && (timeLimit - elapsedTime) < 30;

  const handleSubmit = () => {
    if (isGuessComplete) {
      onSubmitGuess(currentGuess as number[]);
      setCurrentGuess([null, null, null, null]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Timer Display */}
        {elapsedTime !== undefined && (
          <View style={[styles.timerContainer, isTimeRunningOut && styles.timerWarning]}>
            <Text style={styles.timerText}>
              ⏱️ {formatTime(elapsedTime)}
              {timeLimit && ` / ${formatTime(timeLimit)}`}
            </Text>
          </View>
        )}

        {/* Hints Display */}
        {revealedHints.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>💡 Revealed Hints:</Text>
            {revealedHints.map((hint, idx) => (
              <Text key={idx} style={styles.hintText}>
                Position {hint.position + 1}: {hint.digit}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.historyContainer}>
          <GuessHistory guesses={guesses} />
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.inputContainer}>
            <GuessInput code={currentGuess} onCodeChange={setCurrentGuess} />

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  !isGuessComplete && styles.disabledButton,
                  pressed && styles.pressedButton,
                ]}
                onPress={handleSubmit}
                disabled={!isGuessComplete}
                role="button"
              >
                <Text style={styles.buttonText}>Submit Guess</Text>
              </Pressable>

              {onRequestHint && (
                <Pressable
                  style={({ pressed }) => [
                    styles.hintButton,
                    hintsRemaining === 0 && styles.disabledButton,
                    pressed && styles.pressedButton,
                  ]}
                  onPress={onRequestHint}
                  disabled={hintsRemaining === 0}
                  role="button"
                >
                  <Text style={styles.buttonText}>
                    💡 Hint ({hintsRemaining})
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
          <Text style={styles.attemptsText}>Attempts left: {attemptsLeft}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  historyContainer: {
    minHeight: 200,
    marginBottom: 20,
  },
  bottomContainer: {
    paddingVertical: 20,
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  attemptsText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    paddingVertical: 15,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  hintButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  pressedButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  timerWarning: {
    backgroundColor: '#ffe5e5',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  hintsContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 16,
    color: '#856404',
    marginVertical: 2,
  },
});

export default GuessingScreen;
