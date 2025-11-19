import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface Guess {
  id: number;
  guess: number[];
  wellPlaced: number;
  misplaced: number;
}

interface GuessHistoryProps {
  guesses: Guess[];
}

const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses }) => {
  if (guesses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Make your first guess!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={guesses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.guessItem}>
          <Text style={styles.guessText}>Guess #{item.id}: {item.guess.join(' ')}</Text>
          <Text style={styles.resultText}>
            Well Placed: {item.wellPlaced}, Misplaced: {item.misplaced}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  list: {
    width: '100%',
  },
  guessItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  guessText: {
    fontSize: 16,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
  },
});

export default GuessHistory;
