#!/usr/bin/env python3
"""
Test script to verify the pronunciation analysis fix.
Run this directly with: uv run test_pronunciation_fix.py
"""

def test_pronunciation_analysis():
    """Test the fixed text-comparison approach with edit distance."""
    
    def edit_distance_similarity(s1: str, s2: str) -> float:
        """Calculate similarity using Levenshtein edit distance."""
        if not s1 or not s2:
            return 0.0
        if s1 == s2:
            return 1.0
        
        # Calculate edit distance
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i-1] == s2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
        
        distance = dp[m][n]
        max_len = max(m, n)
        return 1.0 - (distance / max_len)
    
    test_cases = [
        # (transcription, target_word, expected_result)
        ("zehn", "zehn", "100% - exact match"),
        ("Zehn.", "zehn", "100% - case/punct normalized"),
        ("zehn zehn", "zehn", "100% - word in transcription"),
        ("zehen", "zehn", "80% - close match (edit distance handles insertion)"),
        ("zhen", "zehn", "75% - transposition"),
        ("something else", "zehn", "low% - mismatch"),
        ("", "zehn", "0% - empty transcription"),
    ]
    
    print("=" * 60)
    print("Testing Pronunciation Analysis Fix (edit distance similarity)")
    print("=" * 60)
    
    for transcription, target_word, expected in test_cases:
        # Clean transcription
        clean_transcription = transcription.strip().lower()
        clean_transcription = ' '.join(clean_transcription.replace('.', '').replace(',', '').split())
        target = target_word.strip().lower()
        
        # Check match
        transcription_words = clean_transcription.split() if clean_transcription else []
        is_correct = (target == clean_transcription or target in transcription_words)
        
        if not is_correct and transcription_words:
            best_similarity = max((edit_distance_similarity(w, target) for w in transcription_words), default=0.0)
            is_close = best_similarity >= 0.6  # Lowered threshold for edit distance
        else:
            is_close = False
            best_similarity = 1.0 if is_correct else 0.0
        
        # Determine result
        if is_correct:
            score = 100.0
            errors = []
            result_type = "EXACT MATCH"
        elif is_close:
            score = round(best_similarity * 100, 1)
            errors = [f"Expected '{target}' heard '{clean_transcription}'"]
            result_type = "CLOSE MATCH"
        else:
            score = round(best_similarity * 50, 1)
            errors = [f"Expected '{target}' heard '{clean_transcription}'"]
            result_type = "MISMATCH"
        
        print(f"\nTranscription: '{transcription}' -> Target: '{target_word}'")
        print(f"  Result: {result_type}, Score: {score}%")
        print(f"  Similarity: {best_similarity:.2f}")
        print(f"  Errors: {errors if errors else 'None'}")
        print(f"  Expected: {expected}")
    
    print("\n" + "=" * 60)
    print("If 'zehen' vs 'zehn' now shows ~80% score (close match),")
    print("the fix is working correctly!")
    print("=" * 60)

if __name__ == "__main__":
    test_pronunciation_analysis()
