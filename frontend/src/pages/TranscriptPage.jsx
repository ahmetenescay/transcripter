import { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TranscriptContext } from '../context/TranscriptContext';
import { summarizeTranscripts } from '../services/api';
import { exportTxt, exportPdf, exportWord } from '../utils/exportUtils';
import { ArrowLeft, Download, FileText, Sparkles, Loader2, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function TranscriptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { videoList, updateVideo } = useContext(TranscriptContext);
  const [video, setVideo] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const found = videoList.find(v => v.id === id);
    if (!found) {
      navigate('/');
    } else {
      setVideo(found);
      if (found.summary) {
        setSummary(found.summary);
      }
    }
  }, [id, videoList, navigate]);

  if (!video) return null;

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const data = await summarizeTranscripts([video.transcriptText], video.id, video.language);
      setSummary(data.result);
      // Update local state to persist summary
      updateVideo(video.id, { summary: data.result });
    } catch (err) {
      const apiError = err.response?.data?.detail || err.message;
      setSummary(`Error: ${apiError}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </Link>
        <h2 className="text-2xl font-bold text-slate-100 truncate flex-1">{video.title || video.url}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                <FileText size={20} />
                Raw Transcript
              </h3>
              <div className="flex gap-2">
                <button onClick={() => exportTxt(video.transcriptText, `transcript_${video.id}`)} className="btn bg-slate-700 hover:bg-slate-600 text-xs flex gap-1 items-center px-3 py-1.5"><FileDown size={14}/> TXT</button>
                <button onClick={() => exportPdf(video.transcriptText, `transcript_${video.id}`)} className="btn bg-slate-700 hover:bg-slate-600 text-xs flex gap-1 items-center px-3 py-1.5"><FileDown size={14}/> PDF</button>
                <button onClick={() => exportWord(video.transcriptText, `transcript_${video.id}`)} className="btn bg-slate-700 hover:bg-slate-600 text-xs flex gap-1 items-center px-3 py-1.5"><FileDown size={14}/> DOCX</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {video.transcriptText}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-secondary mb-4">
              <Sparkles size={20} />
              Expert Summary
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Generate an expert summary for this specific transcript.
            </p>
            <button 
              onClick={handleSummarize}
              disabled={isLoading || summary !== ''}
              className={`btn w-full flex items-center justify-center gap-2 ${summary ? 'btn-secondary opacity-50' : 'btn-primary'}`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {summary ? 'Summary Generated' : 'Summarize Content'}
            </button>
          </div>

          {summary && (
            <div className="panel p-6 max-h-[400px] flex flex-col">
              <h3 className="font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Result</h3>
              <div className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TranscriptPage;
