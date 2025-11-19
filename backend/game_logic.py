"""
Core game logic for Code Breaker game.
Ported from TypeScript utils/gameLogic.ts
"""

def check_guess(guess: list[int], secret_code: list[int]) -> dict[str, int]:
    """
    Check a guess against the secret code.

    Returns:
        dict with 'wellPlaced' (correct digit, correct position)
        and 'misplaced' (correct digit, wrong position)
    """
    guess_copy = guess.copy()
    secret_code_copy = secret_code.copy()
    well_placed = 0
    misplaced = 0

    # First pass: check for well-placed digits
    for i in range(len(secret_code_copy)):
        if secret_code_copy[i] == guess_copy[i]:
            well_placed += 1
            secret_code_copy[i] = -1  # Mark as checked
            guess_copy[i] = -1  # Mark as checked

    # Second pass: check for misplaced digits
    for i in range(len(guess_copy)):
        if guess_copy[i] != -1:
            try:
                misplaced_index = secret_code_copy.index(guess_copy[i])
                misplaced += 1
                secret_code_copy[misplaced_index] = -1  # Mark as checked
            except ValueError:
                # Digit not found in remaining secret code
                pass

    return {"wellPlaced": well_placed, "misplaced": misplaced}
