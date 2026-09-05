import os
import uuid
from youtube_transcript_api import YouTubeTranscriptApi
import yt_dlp
import whisper

# Load whisper model globally (might take some time on first start)
# We will use 'base' or 'small' model by default to balance speed and accuracy
MODEL_NAME = "base"
print(f"Loading Whisper model '{MODEL_NAME}'...")
whisper_model = whisper.load_model(MODEL_NAME)
print("Whisper model loaded.")

class LanguageMismatchError(Exception):
    def __init__(self, message, available_languages):
        super().__init__(message)
        self.available_languages = available_languages

def get_video_title(url: str) -> str:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            return info.get('title', 'Unknown Title')
        except Exception:
            return 'Unknown Title'

def extract_youtube_transcript(url: str, language: str = 'en') -> str:
    """
    Extracts transcript from a YouTube URL if available.
    Returns the transcript as a string.
    """
    try:
        # Simple extraction of video ID from common youtube url formats
        video_id = None
        if "v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
        
        if not video_id:
            raise ValueError("Could not extract video ID from URL")

        api = YouTubeTranscriptApi()
        
        try:
            transcript_list = api.list(video_id)
        except Exception as e:
            raise RuntimeError(f"Could not list transcripts: {str(e)}")

        try:
            transcript = transcript_list.find_transcript([language])
            fetched = transcript.fetch()
            if isinstance(fetched, list):
                full_transcript = " ".join([item['text'] for item in fetched])
            else:
                full_transcript = " ".join([item.text for item in fetched.snippets])
            return full_transcript
        except Exception as e:
            # Language not found natively
            available = [t.language_code for t in transcript_list]
            raise LanguageMismatchError(f"Language '{language}' not found.", available)
    except LanguageMismatchError:
        raise
    except Exception as e:
        raise RuntimeError(f"YouTube transcript extraction failed: {str(e)}")

def download_audio(url: str, output_dir: str) -> str:
    """
    Downloads audio from a URL using yt-dlp and returns the path to the downloaded file.
    """
    filename_template = os.path.join(output_dir, f"{uuid.uuid4().hex}.%(ext)s")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': filename_template,
        'quiet': True,
        'no_warnings': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        base, _ = os.path.splitext(filename)
        return base + ".mp3"

def transcribe_audio_file(file_path: str, language: str = None) -> str:
    """
    Transcribes a local audio/video file using Whisper.
    """
    try:
        # If language is provided, we can pass it to Whisper to skip language detection
        options = {}
        if language:
            options['language'] = language
            
        result = whisper_model.transcribe(file_path, **options)
        return result["text"]
    except Exception as e:
        raise RuntimeError(f"Whisper transcription failed: {str(e)}")
