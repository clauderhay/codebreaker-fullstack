import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface GuessInputProps {
  code: (number | null)[];
  onCodeChange: (code: (number | null)[]) => void;
}

const GuessInput: React.FC<GuessInputProps> = ({ code, onCodeChange }) => {
  const handleNumberPress = (num: number) => {
    const newCode = [...code];
    const emptyIndex = newCode.findIndex((val) => val === null);
    if (emptyIndex !== -1) {
      newCode[emptyIndex] = num;
      onCodeChange(newCode);
    }
  };

  const handleClear = () => {
    onCodeChange([null, null, null, null]);
  };

  const handleBackspace = () => {
    const newCode = [...code];
    for (let i = newCode.length - 1; i >= 0; i--) {
      if (newCode[i] !== null) {
        newCode[i] = null;
        break;
      }
    }
    onCodeChange(newCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <View key={index} style={styles.slot}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </View>
      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Pressable
            key={num}
            style={({ pressed }) => [styles.key, pressed && styles.pressed]}
            onPress={() => handleNumberPress(num)}
            role="button"
          >
            <Text style={styles.keyText}>{num}</Text>
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
          onPress={handleClear}
          role="button"
        >
          <Text style={styles.keyText}>Clear</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
          onPress={handleBackspace}
          role="button"
        >
          <Text style={styles.keyText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  slot: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  digit: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
  },
  key: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 37.5,
    margin: 8,
  },
  keyText: {
    fontSize: 24,
    color: '#555',
  },
  pressed: {
    backgroundColor: '#ddd',
  },
});

export default GuessInput;
