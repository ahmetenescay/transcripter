from pydantic import BaseModel
from typing import List, Optional

class ExtractRequest(BaseModel):
    url: str
    language: str = "en"
    force_whisper: bool = False

class SummarizeRequest(BaseModel):
    transcripts: List[str]
    video_id: Optional[str] = None
    language: Optional[str] = None

class QARequest(BaseModel):
    transcripts: List[str]
    question: str

class TranscriptResponse(BaseModel):
    status: str
    video_id: Optional[str] = None
    title: Optional[str] = None
    language: str
    transcript_text: Optional[str] = None
    summary: Optional[str] = None
    available_languages: Optional[List[str]] = None

class GeminiResponse(BaseModel):
    status: str
    result: str
