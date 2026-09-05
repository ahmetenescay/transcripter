# Transcripter

## Proje Hakkında (About the Project)
Transcripter, YouTube videolarından, bilgisayarınızdaki yerel video/ses dosyalarından ve YouTube dışındaki diğer platformlardaki videolardan transkript (altyazı) çıkarmanızı sağlayan, kişisel kullanım için tasarlanmış bir yerel web uygulamasıdır. Elde edilen transkriptleri Google Gemini API kullanarak özetleyebilir veya bu transkriptler üzerinde soru-cevap (Q&A) yapabilirsiniz.

## Nasıl Başlatılır? (How to Start)

Projeyi çalıştırmak için bilgisayarınızda **Python 3**, **Node.js** ve **FFmpeg** yüklü olmalıdır.

### 1. Backend (FastAPI) Başlatma
Backend klasörüne gidin, sanal ortamı aktif edin ve Uvicorn sunucusunu başlatın:

```bash
cd backend
source venv/bin/activate
# NOT: İlk defa başlatmadan önce `backend/` içine `.env` dosyası oluşturup 
# GEMINI_API_KEY=sizin_api_anahtariniz şeklinde anahtarınızı eklemeyi unutmayın!
uvicorn main:app --reload --port 8000
```
*API sunucusu `http://localhost:8000` adresinde çalışacaktır.*

### 2. Frontend (React/Vite) Başlatma
Yeni bir terminal penceresi açın, frontend klasörüne gidin ve geliştirme sunucusunu başlatın:

```bash
cd frontend
npm run dev
```
*Arayüz `http://localhost:5173` adresinde çalışacaktır.*

---

## Agent / AI Developer Context (Sistem Mimarisi & Kod Akışı)
*This section is intended for the AI Agent (me) to quickly recall the project structure and technical decisions.*

### Tech Stack
- **Backend**: Python, FastAPI, Uvicorn, `youtube-transcript-api`, `yt-dlp` (for non-youtube links), `openai-whisper` (for local ML transcription), `google-generativeai`.
- **Frontend**: React, Vite, TailwindCSS, Axios, `react-markdown`.

### Folder Structure
```text
transcripter/
├── backend/
│   ├── main.py              # FastAPI app entry point. Includes CORS config & router.
│   ├── requirements.txt     # Python dependencies.
│   ├── .env                 # GEMINI_API_KEY goes here.
│   ├── temp_audio/          # Auto-generated dir for temporary yt-dlp & upload audio processing.
│   ├── api/
│   │   ├── routes.py        # Holds API endpoints (extract, upload, summarize, qa).
│   │   └── schemas.py       # Pydantic schemas (ExtractRequest, TranscriptResponse, etc).
│   └── services/
│       ├── transcript.py    # Abstraction for extracting transcripts (YouTube, yt-dlp, Whisper).
│       └── gemini.py        # Wrapper around google.generativeai for QA and summarization.
└── frontend/
    ├── package.json
    ├── vite.config.js       # Vite config.
    ├── tailwind.config.js   # Tailwind configuration.
    └── src/
        ├── App.jsx          # Main React component, global state container.
        ├── api.js           # Axios wrapper for backend calls.
        └── components/      # React components (VideoInput, TranscriptPanel, ActionPanel, ResultPanel).
```

### Data Flow / Logic Flow
1. **Extraction (`POST /api/transcripts/extract`)**:
   - Frontend sends `{ "url": "...", "language": "en" }`.
   - Backend checks if it's YouTube. If so, uses `youtube_transcript_api`.
   - If it's not YouTube OR the official transcript fails, it falls back to `yt-dlp` to download audio to `temp_audio/`, then runs `openai-whisper` on it.
   - Cleans up temporary audio and returns `{ "transcript_text": "...", ... }`.

2. **Local Upload (`POST /api/transcripts/upload`)**:
   - Frontend sends `multipart/form-data` containing the file and `language`.
   - Backend saves to `temp_audio/`, runs `whisper.load_model('base').transcribe(...)`, cleans up, and returns transcript.

3. **Gemini AI (`POST /api/gemini/summarize` & `/qa`)**:
   - Frontend sends an array of transcript texts.
   - Backend formats a prompt appending all transcripts.
   - For QA, appends the user's question at the end.
   - Queries `gemini-1.5-flash` model and returns the response text.

### State Management
- All critical state (`videoList`, `geminiResult`, `isLoading`, `selectedLanguage`) lives in `App.jsx` and is passed down via props.
- `videoList` elements look like: `{ id: "...", url: "...", type: "url|file", language: "en", transcriptText: "...", status: "success|error" }`
