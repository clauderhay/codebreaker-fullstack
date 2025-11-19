import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface TransitionScreenProps {
  onStartGuessing: () => void;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ onStartGuessing }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Code has been set! Pass the device to the Guesser.
      </Text>
      <Button title="Start Guessing" onPress={onStartGuessing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eefcff',
    padding: 20,
  },
  message: {
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 30,
  },
});

export default TransitionScreen;
