import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface WelcomeScreenProps {
  onCreateGame: () => void;
  onJoinGame: (gameCode: string) => void;
}

export default function WelcomeScreen({ onCreateGame, onJoinGame }: WelcomeScreenProps) {
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinGame = () => {
    const trimmedCode = gameCode.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter a game code');
      return;
    }

    if (trimmedCode.length !== 6) {
      setError('Game code must be 6 characters');
      return;
    }

    setError('');
    onJoinGame(trimmedCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Code Breaker</Text>
        <Text style={styles.subtitle}>Crack the secret code!</Text>

        <View style={styles.section}>
          <TouchableOpacity style={styles.primaryButton} onPress={onCreateGame}>
            <Text style={styles.primaryButtonText}>Create New Game</Text>
          </TouchableOpacity>
          <Text style={styles.description}>Start a new game and share the code with a friend</Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Join Existing Game</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-character game code"
            placeholderTextColor="#999"
            value={gameCode}
            onChangeText={(text) => {
              setGameCode(text.toUpperCase());
              setError('');
            }}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.secondaryButton, !gameCode && styles.buttonDisabled]}
            onPress={handleJoinGame}
            disabled={!gameCode}
          >
            <Text style={styles.secondaryButtonText}>Join Game</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A classic code-breaking game for 2 players
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 48,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 4,
    color: '#2c3e50',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#95a5a6',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 32,
  },
  footerText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 14,
  },
});
