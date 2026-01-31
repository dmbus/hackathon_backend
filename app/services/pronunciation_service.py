"""Pronunciation analysis service for German language learning."""

import logging
import uuid
import json
from io import BytesIO
from typing import List, Optional, Tuple
from pydub import AudioSegment
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from elevenlabs.client import ElevenLabs
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.models.pronunciation import (
    PhonemeError,
    PronunciationAnalysisResult,
)

logger = logging.getLogger(__name__)

# S3 Configuration
S3_ENDPOINT = "https://fsn1.your-objectstorage.com"
S3_BUCKET = "sprache-hackathon-audio"
S3_PRONUNCIATION_PREFIX = "users/pronunciation"

# German phoneme articulatory tips
GERMAN_PHONEME_TIPS = {
    "ʃt": {
        "description": "Initial St cluster",
        "tip": "Round your lips slightly like 'sh' and immediately follow with a sharp 't'.",
        "common_errors": ["st"],
    },
    "ʃp": {
        "description": "Initial Sp cluster",
        "tip": "Form 'sh' with rounded lips, then close lips tightly for the 'p'.",
        "common_errors": ["sp"],
    },
    "ç": {
        "description": "Ich-Laut (voiceless palatal fricative)",
        "tip": "Spread lips in a smile, raise middle of tongue to hard palate, let air hiss through.",
        "common_errors": ["ʃ", "k", "x"],
    },
    "x": {
        "description": "Ach-Laut (voiceless velar fricative)",
        "tip": "Like Scottish 'loch'. Air friction at back of mouth, not a 'k'.",
        "common_errors": ["k", "h"],
    },
    "y": {
        "description": "Close front rounded vowel (ü)",
        "tip": "Say 'ee' but round your lips like saying 'oo'. Keep tongue forward.",
        "common_errors": ["i", "u"],
    },
    "ø": {
        "description": "Close-mid front rounded vowel (ö)",
        "tip": "Say 'e' (as in 'bed') but round your lips. Tongue stays forward.",
        "common_errors": ["e", "o"],
    },
    "ʁ": {
        "description": "Voiced uvular fricative (German R)",
        "tip": "Gargling sound at back of throat. Don't roll with tongue tip.",
        "common_errors": ["r", "ɹ"],
    },
}


class PronunciationService:
    """Service for German pronunciation analysis."""

    def __init__(self):
        self.llm: Optional[ChatOpenAI] = None
        self.elevenlabs_client: Optional[ElevenLabs] = None
        self._initialized = False

    def _ensure_initialized(self):
        """Initialize API clients if not already done."""
        if self._initialized:
            return

        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")
        if not settings.ELEVEN_LABS_KEY:
            raise ValueError("ELEVEN_LABS_KEY not configured")

        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            api_key=settings.OPENAI_API_KEY
        )
        self.elevenlabs_client = ElevenLabs(api_key=settings.ELEVEN_LABS_KEY)
        self._initialized = True
        logger.info("Pronunciation service initialized")

    def _get_s3_client(self):
        """Create S3 client for Hetzner Object Storage."""
        return boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4')
        )

    def transcribe_audio(self, audio_bytes: bytes) -> str:
        """
        Transcribe audio using ElevenLabs Speech-to-Text API.

        Returns:
            str: Transcription text in German
        """
        self._ensure_initialized()

        try:
            audio_file = BytesIO(audio_bytes)
            result = self.elevenlabs_client.speech_to_text.convert(
                file=audio_file,
                model_id="scribe_v1",
            )

            transcription = result.text if hasattr(result, 'text') else str(result)
            logger.info(f"Transcription completed: {transcription}")
            return transcription
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise ValueError(f"Failed to transcribe audio: {e}")

    def generate_benchmark_audio(
        self,
        text: str,
        voice_id: str = "onwK4e9ZLuTAKqWW03F9"  # German voice
    ) -> Tuple[bytes, str]:
        """
        Generate TTS audio for benchmark pronunciation.

        Args:
            text: German text to synthesize
            voice_id: ElevenLabs voice ID

        Returns:
            Tuple of (audio_bytes, s3_url)
        """
        self._ensure_initialized()

        try:
            audio_response = self.elevenlabs_client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id="eleven_multilingual_v2",
            )

            audio_data = b"".join(audio_response)

            # Upload to S3
            filename = f"benchmark_{uuid.uuid4()}.mp3"
            s3_key = f"{S3_PRONUNCIATION_PREFIX}/benchmarks/{filename}"

            s3_client = self._get_s3_client()
            s3_client.upload_fileobj(
                BytesIO(audio_data),
                S3_BUCKET,
                s3_key,
                ExtraArgs={'ContentType': 'audio/mpeg', 'ACL': 'public-read'}
            )

            bucket_url = f"{S3_ENDPOINT}/{S3_BUCKET}/{s3_key}"
            logger.info(f"Benchmark audio uploaded: {bucket_url}")
            return audio_data, bucket_url

        except Exception as e:
            logger.error(f"Failed to generate benchmark audio: {e}")
            raise ValueError(f"Failed to generate benchmark audio: {e}")

    def upload_user_audio(self, audio_bytes: bytes) -> Tuple[str, str]:
        """
        Upload user audio recording to S3.

        Returns:
            Tuple of (s3_path, public_url)
        """
        if not settings.S3_ACCESS_KEY or not settings.S3_SECRET_KEY:
            raise ValueError("S3 credentials not configured")

        filename = f"user_{uuid.uuid4()}.mp3"
        s3_key = f"{S3_PRONUNCIATION_PREFIX}/user/{filename}"
        hetzner_path = f"/{s3_key}"
        bucket_url = f"{S3_ENDPOINT}/{S3_BUCKET}/{s3_key}"

        s3_client = self._get_s3_client()

        try:
            s3_client.upload_fileobj(
                BytesIO(audio_bytes),
                S3_BUCKET,
                s3_key,
                ExtraArgs={'ContentType': 'audio/mpeg', 'ACL': 'public-read'}
            )
            logger.info(f"User audio uploaded: {s3_key}")
            return hetzner_path, bucket_url
        except ClientError as e:
            logger.error(f"Failed to upload user audio: {e}")
            raise ValueError(f"Failed to upload audio: {e}")

    def validate_audio(self, audio_bytes: bytes) -> float:
        """
        Validate audio and return duration in seconds.
        Max duration: 30 seconds for pronunciation practice.
        """
        try:
            audio = AudioSegment.from_file(BytesIO(audio_bytes))
            duration_seconds = len(audio) / 1000.0

            if duration_seconds > 30:
                raise ValueError(f"Audio duration ({duration_seconds:.1f}s) exceeds 30 seconds")

            if duration_seconds < 0.5:
                raise ValueError("Audio is too short (minimum 0.5 seconds)")

            return duration_seconds
        except Exception as e:
            if "exceeds" in str(e) or "too short" in str(e):
                raise
            logger.error(f"Failed to validate audio: {e}")
            raise ValueError(f"Invalid audio file: {e}")

    def _ipa_to_phoneme_list(self, ipa: str) -> List[str]:
        """Convert IPA string to list of phonemes."""
        # Remove stress marks and spaces
        ipa = ipa.replace("ˈ", "").replace("ˌ", "").replace(" ", "").replace(".", "")

        # Handle common multi-character phonemes
        multi_phonemes = ["aɪ", "aʊ", "ɔɪ", "ts", "tʃ", "pf", "ʃt", "ʃp", "ŋk", "ŋɡ"]
        phonemes = []
        i = 0
        while i < len(ipa):
            matched = False
            # Try to match multi-character phonemes first
            for mp in sorted(multi_phonemes, key=len, reverse=True):
                if ipa[i:].startswith(mp):
                    phonemes.append(mp)
                    i += len(mp)
                    matched = True
                    break
            if not matched:
                # Skip length marks and ties
                if ipa[i] not in "ː͡ˑ":
                    phonemes.append(ipa[i])
                i += 1
        return phonemes

    def _levenshtein_distance(self, s1: List[str], s2: List[str]) -> int:
        """Calculate Levenshtein distance between two phoneme sequences."""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (0 if c1 == c2 else 1)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]

    def _align_and_find_errors(
        self,
        target_phones: List[str],
        user_phones: List[str]
    ) -> List[PhonemeError]:
        """
        Align phoneme sequences and identify errors.
        Uses simple alignment for now.
        """
        errors = []
        max_len = max(len(target_phones), len(user_phones))

        for i in range(max_len):
            target = target_phones[i] if i < len(target_phones) else ""
            user = user_phones[i] if i < len(user_phones) else ""

            if target != user:
                errors.append(PhonemeError(
                    target=target if target else "(missing)",
                    produced=user if user else "(extra)",
                    position=i
                ))

        return errors

    def calculate_phoneme_similarity(
        self,
        target_ipa: str,
        user_ipa: str
    ) -> Tuple[float, List[PhonemeError]]:
        """
        Calculate similarity between target and user IPA.

        Returns:
            Tuple of (similarity_score 0-100, list of errors)
        """
        target_phones = self._ipa_to_phoneme_list(target_ipa)
        user_phones = self._ipa_to_phoneme_list(user_ipa)

        if not target_phones:
            return 0.0, []

        # Calculate Levenshtein distance
        distance = self._levenshtein_distance(target_phones, user_phones)
        max_len = max(len(target_phones), len(user_phones))
        similarity = 1.0 - (distance / max_len) if max_len > 0 else 0.0

        # Find specific errors
        errors = self._align_and_find_errors(target_phones, user_phones)

        # Convert to 0-100 score
        score = round(similarity * 100, 1)

        return score, errors

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=lambda retry_state: logger.warning(
            f"Feedback generation failed, retrying (attempt {retry_state.attempt_number})..."
        ),
    )
    def generate_feedback(
        self,
        word: str,
        target_ipa: str,
        user_transcription: str,
        similarity_score: float,
        phoneme_errors: List[PhonemeError],
        articulatory_tip: str,
        phoneme_ipa: str
    ) -> Tuple[str, List[str]]:
        """
        Generate personalized feedback using GPT-4o.

        Returns:
            Tuple of (general_feedback, list of tips)
        """
        self._ensure_initialized()

        errors_text = ", ".join(
            [f"Expected '{e.target}' but heard '{e.produced}'" for e in phoneme_errors[:5]]
        ) if phoneme_errors else "No significant errors detected"

        template = """You are a German pronunciation coach helping English speakers.

Target word: "{word}"
Target IPA: {target_ipa}
What we heard: "{user_transcription}"
Similarity score: {score:.0f}%
Phoneme errors: {errors}
Focus phoneme: {phoneme_ipa}
Articulatory guidance: {articulatory_tip}

Provide:
1. A brief encouraging feedback (2-3 sentences) about the attempt
2. 2-3 specific articulatory tips to improve (focus on the phoneme errors)

Respond in JSON format:
{{
  "feedback": "Your feedback here...",
  "tips": ["tip1", "tip2", "tip3"]
}}

Focus on practical mouth/tongue/lip positioning advice. Be encouraging but honest."""

        prompt = PromptTemplate(
            template=template,
            input_variables=[
                "word", "target_ipa", "user_transcription",
                "score", "errors", "phoneme_ipa", "articulatory_tip"
            ],
        )

        chain = prompt | self.llm

        result = chain.invoke({
            "word": word,
            "target_ipa": target_ipa,
            "user_transcription": user_transcription,
            "score": similarity_score,
            "errors": errors_text,
            "phoneme_ipa": phoneme_ipa,
            "articulatory_tip": articulatory_tip
        })

        # Parse JSON response
        content = result.content
        # Extract JSON from potential markdown code blocks
        if "```" in content:
            parts = content.split("```")
            for part in parts:
                if "{" in part and "}" in part:
                    content = part
                    if content.startswith("json"):
                        content = content[4:]
                    break

        try:
            data = json.loads(content.strip())
            return data.get("feedback", ""), data.get("tips", [])
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse feedback JSON: {content}")
            return content.strip(), []

    def analyze_pronunciation(
        self,
        audio_bytes: bytes,
        word: str,
        sentence: str,
        target_ipa: str,
        phoneme_ipa: str,
        articulatory_tip: str
    ) -> PronunciationAnalysisResult:
        """
        Complete pronunciation analysis pipeline.

        Args:
            audio_bytes: User's recorded audio
            word: The target word
            sentence: The example sentence
            target_ipa: Expected IPA for the word
            phoneme_ipa: The focus phoneme for this module
            articulatory_tip: The module's articulatory guidance

        Returns:
            PronunciationAnalysisResult with score, errors, and feedback
        """
        # 1. Validate audio
        self.validate_audio(audio_bytes)

        # 2. Transcribe user audio
        user_transcription = self.transcribe_audio(audio_bytes)

        # 3. Get approximate IPA for user's pronunciation
        # Since we're using STT, we compare transcription similarity
        # For MVP, we use string matching on transcription
        user_ipa = self._approximate_ipa_from_transcription(user_transcription, word)

        # 4. Calculate similarity and find errors
        score, phoneme_errors = self.calculate_phoneme_similarity(target_ipa, user_ipa)

        # 5. Generate AI feedback
        feedback, tips = self.generate_feedback(
            word=word,
            target_ipa=target_ipa,
            user_transcription=user_transcription,
            similarity_score=score,
            phoneme_errors=phoneme_errors,
            articulatory_tip=articulatory_tip,
            phoneme_ipa=phoneme_ipa
        )

        return PronunciationAnalysisResult(
            overall_score=score,
            target_ipa=target_ipa,
            user_ipa=user_ipa,
            phoneme_errors=phoneme_errors,
            ai_feedback=feedback,
            articulatory_tips=tips
        )

    def _approximate_ipa_from_transcription(self, transcription: str, target_word: str) -> str:
        """
        Approximate IPA from transcription.
        Uses simple heuristics to estimate pronunciation quality.
        """
        # Clean up transcription
        transcription = transcription.strip().lower()
        target = target_word.strip().lower()

        # If transcription matches target, assume correct IPA
        if target in transcription:
            # Return a "correct" placeholder - actual IPA would need G2P
            return f"[match:{target}]"

        # Otherwise, return the transcription as-is for comparison
        return f"[heard:{transcription}]"


# Singleton instance
pronunciation_service = PronunciationService()
