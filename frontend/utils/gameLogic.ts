export const checkGuess = (guess: number[], secretCode: number[]): { wellPlaced: number; misplaced: number } => {
  const guessCopy = [...guess];
  const secretCodeCopy = [...secretCode];
  let wellPlaced = 0;
  let misplaced = 0;

  // First pass for well-placed digits
  for (let i = 0; i < secretCodeCopy.length; i++) {
    if (secretCodeCopy[i] === guessCopy[i]) {
      wellPlaced++;
      secretCodeCopy[i] = -1; // Mark as checked
      guessCopy[i] = -1; // Mark as checked
    }
  }

  // Second pass for misplaced digits
  for (let i = 0; i < secretCodeCopy.length; i++) {
    if (guessCopy[i] !== -1) {
      const misplacedIndex = secretCodeCopy.indexOf(guessCopy[i]);
      if (misplacedIndex !== -1) {
        misplaced++;
        secretCodeCopy[misplacedIndex] = -1; // Mark as checked
      }
    }
  }

  return { wellPlaced, misplaced };
};
