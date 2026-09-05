import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from api.schemas import ExtractRequest, SummarizeRequest, QARequest, TranscriptResponse, GeminiResponse
from services.transcript import extract_youtube_transcript, download_audio, transcribe_audio_file, get_video_title, LanguageMismatchError
from services.gemini import summarize_transcripts, qa_transcripts
from services.database import get_transcript, save_transcript, save_summary

router = APIRouter()

TEMP_AUDIO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "temp_audio"))
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)

@router.post("/transcripts/extract", response_model=TranscriptResponse)
def extract_transcript(request: ExtractRequest):
    url = request.url
    language = request.language
    force_whisper = request.force_whisper
    
    try:
        # Simple ID extraction for DB lookup
        video_id = url
        if "youtube.com" in url or "youtu.be" in url:
            if "v=" in url:
                video_id = url.split("v=")[1].split("&")[0]
            elif "youtu.be/" in url:
                video_id = url.split("youtu.be/")[1].split("?")[0]
                
        # 1. Check DB Cache
        cached = get_transcript(video_id, language)
        if cached:
            return TranscriptResponse(
                status="success",
                video_id=video_id,
                title=cached['title'],
                language=language,
                transcript_text=cached['raw_text'],
                summary=cached['summary']
            )
            
        # If not cached, process
        title = get_video_title(url) if ("youtube.com" in url or "youtu.be" in url) else url
        
        if ("youtube.com" in url or "youtu.be" in url) and not force_whisper:
            try:
                transcript_text = extract_youtube_transcript(url, language)
                save_transcript(video_id, url, title, language, transcript_text)
                return TranscriptResponse(
                    status="success", 
                    video_id=video_id,
                    title=title,
                    language=language, 
                    transcript_text=transcript_text
                )
            except LanguageMismatchError as lme:
                return TranscriptResponse(
                    status="language_mismatch",
                    video_id=video_id,
                    title=title,
                    language=language,
                    available_languages=lme.available_languages
                )
            except Exception as yt_err:
                print(f"YouTube official transcript failed: {yt_err}. Falling back to Whisper...")
                pass
                
        # Fallback to Whisper or if force_whisper is true
        audio_path = download_audio(url, TEMP_AUDIO_DIR)
        transcript_text = transcribe_audio_file(audio_path, language)
        
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        save_transcript(video_id, url, title, language, transcript_text)
        return TranscriptResponse(
            status="success", 
            video_id=video_id,
            title=title,
            language=language, 
            transcript_text=transcript_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcripts/upload", response_model=TranscriptResponse)
def upload_transcript(file: UploadFile = File(...), language: str = Form("en")):
    try:
        file_path = os.path.join(TEMP_AUDIO_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        transcript_text = transcribe_audio_file(file_path, language)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
        video_id = f"upload_{file.filename}"
        save_transcript(video_id, file.filename, file.filename, language, transcript_text)
            
        return TranscriptResponse(
            status="success", 
            video_id=video_id,
            title=file.filename,
            language=language, 
            transcript_text=transcript_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gemini/summarize", response_model=GeminiResponse)
def summarize(request: SummarizeRequest):
    try:
        summary = summarize_transcripts(request.transcripts)
        if request.video_id and request.language:
            save_summary(request.video_id, request.language, summary)
        return GeminiResponse(status="success", result=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gemini/qa", response_model=GeminiResponse)
def qa(request: QARequest):
    try:
        answer = qa_transcripts(request.transcripts, request.question)
        return GeminiResponse(status="success", result=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
