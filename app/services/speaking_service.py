"""Speaking practice service for language learning."""

import logging
import uuid
from io import BytesIO
from typing import List, Optional
from pydub import AudioSegment
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from elevenlabs.client import ElevenLabs
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.models.speaking import (
    TargetWord,
    OpenAIAnalysisResponse,
    SpeakingAnalysis,
    WordUsageAnalysis,
)

logger = logging.getLogger(__name__)

# S3 Configuration
S3_ENDPOINT = "https://fsn1.your-objectstorage.com"
S3_BUCKET = "sprache-hackathon-audio"
S3_SPEAKING_PREFIX = "users/speaking"


class SpeakingService:
    """Service for speaking practice functionality."""

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
            temperature=0.3,  # Lower temperature for more consistent analysis
            api_key=settings.OPENAI_API_KEY
        )
        self.elevenlabs_client = ElevenLabs(api_key=settings.ELEVEN_LABS_KEY)
        self._initialized = True
        logger.info("Speaking service initialized")

    def _get_s3_client(self):
        """Create S3 client for Hetzner Object Storage."""
        return boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4')
        )

    def validate_audio_duration(self, audio_bytes: bytes) -> float:
        """
        Validate audio duration and return duration in seconds.
        Raises ValueError if duration exceeds 60 seconds.
        """
        try:
            audio = AudioSegment.from_file(BytesIO(audio_bytes))
            duration_seconds = len(audio) / 1000.0
            
            if duration_seconds > 60:
                raise ValueError(f"Audio duration ({duration_seconds:.1f}s) exceeds maximum of 60 seconds")
            
            return duration_seconds
        except Exception as e:
            if "exceeds maximum" in str(e):
                raise
            logger.error(f"Failed to validate audio: {e}")
            raise ValueError(f"Invalid audio file: {e}")

    def upload_audio_to_s3(self, audio_bytes: bytes, filename: Optional[str] = None) -> tuple[str, str]:
        """
        Upload audio to Hetzner S3 bucket.
        
        Returns:
            tuple: (hetzner_path, bucket_url)
        """
        if not settings.S3_ACCESS_KEY or not settings.S3_SECRET_KEY:
            raise ValueError("S3 credentials not configured")

        if filename is None:
            filename = f"{uuid.uuid4()}.mp3"
        
        s3_key = f"{S3_SPEAKING_PREFIX}/{filename}"
        hetzner_path = f"/{s3_key}"
        bucket_url = f"{S3_ENDPOINT}/{S3_BUCKET}/{s3_key}"

        s3_client = self._get_s3_client()
        
        try:
            s3_client.upload_fileobj(
                BytesIO(audio_bytes),
                S3_BUCKET,
                s3_key,
                ExtraArgs={
                    'ContentType': 'audio/mpeg',
                    'ACL': 'public-read'
                }
            )
            logger.info(f"Audio uploaded to S3: {s3_key}")
            return hetzner_path, bucket_url
        except ClientError as e:
            logger.error(f"Failed to upload audio to S3: {e}")
            raise ValueError(f"Failed to upload audio: {e}")

    def transcribe_audio(self, audio_bytes: bytes) -> str:
        """
        Transcribe audio using ElevenLabs Speech-to-Text API.
        
        Returns:
            str: Transcription text
        """
        self._ensure_initialized()
        
        try:
            # ElevenLabs STT API - file parameter expects a file-like object
            audio_file = BytesIO(audio_bytes)
            result = self.elevenlabs_client.speech_to_text.convert(
                file=audio_file,
                model_id="scribe_v1",  # ElevenLabs Scribe model for STT
            )
            
            transcription = result.text if hasattr(result, 'text') else str(result)
            logger.info(f"Transcription completed: {len(transcription)} characters")
            return transcription
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise ValueError(f"Failed to transcribe audio: {e}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=lambda retry_state: logger.warning(
            f"Analysis failed, retrying (attempt {retry_state.attempt_number})..."
        ),
    )
    def analyze_speaking(
        self,
        transcription: str,
        question: str,
        target_words: List[TargetWord]
    ) -> SpeakingAnalysis:
        """
        Analyze the speaking practice using OpenAI.
        
        Returns:
            SpeakingAnalysis: Complete analysis of the speaking attempt
        """
        self._ensure_initialized()

        parser = PydanticOutputParser(pydantic_object=OpenAIAnalysisResponse)

        # Format target words for the prompt
        words_list = ", ".join([f'"{w.word}" ({w.translation})' for w in target_words])

        template = """You are a strict language examiner for German language learners.

Task: Analyze the user's spoken answer.

Inputs:
1. Question: "{question}"
2. Transcription: "{transcription}"
3. Target Words: {target_words}

Instructions:
- The answer must be assessed for grammar, relevance, and vocabulary.
- Check if the specific "Target Words" were used correctly.
- Assign a CEFR level (A1-C2) based on the complexity and accuracy of the response.
- Provide a corrected version of the text that is grammatically perfect.
- Score the response from 0-100 based on:
  - Grammar accuracy (25%)
  - Vocabulary usage (25%)
  - Relevance to the question (25%)
  - Use of target words (25%)

{format_instructions}
"""

        prompt = PromptTemplate(
            template=template,
            input_variables=["question", "transcription", "target_words"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        chain = prompt | self.llm | parser

        logger.info("Analyzing speaking practice...")
        result: OpenAIAnalysisResponse = chain.invoke({
            "question": question,
            "transcription": transcription,
            "target_words": words_list,
        })
        logger.info(f"Analysis completed: score={result.score}, level={result.cefr_level}")

        # Convert OpenAI response to SpeakingAnalysis model
        word_usage = [
            WordUsageAnalysis(
                word=wu.word,
                isUsed=wu.used,
                isUsedCorrectly=wu.correct_usage,
                feedback=wu.comment
            )
            for wu in result.word_usage_analysis
        ]

        return SpeakingAnalysis(
            transcription=result.transcription,
            correctedText=result.corrected_text,
            cefrLevel=result.cefr_level,
            score=result.score,
            generalFeedback=result.feedback,
            wordUsage=word_usage
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=lambda retry_state: logger.warning(
            f"Question generation failed, retrying (attempt {retry_state.attempt_number})..."
        ),
    )
    def generate_question(self, words: List[dict]) -> str:
        """
        Generate a contextual question based on the target words.
        
        Args:
            words: List of word dictionaries with 'word' and 'translation' keys
            
        Returns:
            str: A question that encourages using the target words
        """
        self._ensure_initialized()

        words_text = ", ".join([f'"{w["word"]}" ({w["translation"]})' for w in words])

        template = """You are a German language teacher creating speaking practice exercises.

Generate a single question in German that naturally encourages the use of these vocabulary words:
{words}

Requirements:
- The question should be appropriate for intermediate German learners (B1-B2 level)
- The question should be open-ended to allow for a 30-60 second spoken response
- The question should create a natural context where the target words can be used
- Write only the question, nothing else
- The question must be in German

Question:"""

        prompt = PromptTemplate(
            template=template,
            input_variables=["words"],
        )

        chain = prompt | self.llm

        logger.info("Generating practice question...")
        result = chain.invoke({"words": words_text})
        question = result.content.strip()
        logger.info(f"Question generated: {question[:50]}...")
        
        return question


# Singleton instance
speaking_service = SpeakingService()
