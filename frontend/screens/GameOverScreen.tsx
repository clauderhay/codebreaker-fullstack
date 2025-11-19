import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface GameOverScreenProps {
  isVictory: boolean;
  secretCode: number[];
  onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  isVictory,
  secretCode,
  onPlayAgain,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isVictory ? 'You Win! You cracked the code.' : 'You Lost! The code was too strong.'}
      </Text>
      <Text style={styles.secretCodeText}>
        The secret code was: {secretCode.join(' ')}
      </Text>
      <Button title="Play Again" onPress={onPlayAgain} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eefcff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  secretCodeText: {
    fontSize: 20,
    color: '#555',
    marginBottom: 30,
  },
});

export default GameOverScreen;
