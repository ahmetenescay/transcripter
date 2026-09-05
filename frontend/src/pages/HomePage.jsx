import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TranscriptContext } from '../context/TranscriptContext';
import { extractTranscript, uploadTranscript } from '../services/api';
import VideoInput from '../components/VideoInput';
import { FileText, Trash2, CheckCircle, XCircle, ChevronRight, PlusSquare, LayoutGrid } from 'lucide-react';

function HomePage() {
  const { videoList, addVideo, removeVideo, workspaces, createWorkspace, removeWorkspace } = useContext(TranscriptContext);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const navigate = useNavigate();

  const [mismatchData, setMismatchData] = useState(null);

  const handleAddUrl = async (url, language, force_whisper = false) => {
    setIsLoading(true);
    try {
      const data = await extractTranscript(url, language, force_whisper);
      if (data.status === 'language_mismatch') {
        setMismatchData({
          url,
          requestedLanguage: language,
          availableLanguages: data.available_languages,
          title: data.title
        });
      } else {
        addVideo({ 
          id: data.video_id, 
          url, 
          title: data.title,
          type: 'url', 
          language, 
          transcriptText: data.transcript_text, 
          summary: data.summary,
          status: 'success' 
        });
      }
    } catch (error) {
      addVideo({ id: Date.now().toString(), url, title: url, type: 'url', language, transcriptText: '', status: 'error', error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file, language) => {
    setIsLoading(true);
    try {
      const data = await uploadTranscript(file, language);
      addVideo({ id: data.video_id, url: file.name, title: file.name, type: 'file', language, transcriptText: data.transcript_text, summary: data.summary, status: 'success' });
    } catch (error) {
      addVideo({ id: Date.now().toString(), url: file.name, title: file.name, type: 'file', language, transcriptText: '', status: 'error', error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id) => {
    if (selectedVideos.includes(id)) {
      setSelectedVideos(prev => prev.filter(vId => vId !== id));
    } else {
      setSelectedVideos(prev => [...prev, id]);
    }
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (workspaceName && selectedVideos.length > 0) {
      const wsId = createWorkspace(workspaceName, selectedVideos);
      navigate(`/workspace/${wsId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      {mismatchData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
          <div className="bg-surface border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-rose-400 mb-2">Language Not Found</h3>
            <p className="text-slate-300 text-sm mb-4">
              The video <strong>{mismatchData.title}</strong> does not have native <strong>{mismatchData.requestedLanguage.toUpperCase()}</strong> subtitles.
            </p>
            <p className="text-slate-400 text-sm mb-2">Available native languages:</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {mismatchData.availableLanguages.map(lang => (
                <button 
                  key={lang} 
                  onClick={() => {
                    handleAddUrl(mismatchData.url, lang, false);
                    setMismatchData(null);
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-200 transition-colors"
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
              <button 
                onClick={() => setMismatchData(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleAddUrl(mismatchData.url, mismatchData.requestedLanguage, true);
                  setMismatchData(null);
                }}
                className="btn btn-primary bg-rose-600 hover:bg-rose-700 text-sm"
              >
                Force Translate with Whisper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Column: Input and Transcripts */}
      <div className="space-y-6">
        <VideoInput onAddUrl={handleAddUrl} onUploadFile={handleUploadFile} isLoading={isLoading} />
        
        <div className="panel p-6 max-h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Loaded Transcripts
          </h2>
          {videoList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-500 py-8">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>No transcripts loaded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videoList.map((video) => (
                <div key={video.id} className="bg-surface-light rounded-lg p-4 border border-slate-600 flex gap-4 transition-colors hover:border-primary/50">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-500 text-primary focus:ring-primary bg-surface cursor-pointer"
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => toggleSelection(video.id)}
                      disabled={video.status !== 'success'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        {video.status === 'success' ? <CheckCircle size={16} className="text-emerald-400 shrink-0" /> : <XCircle size={16} className="text-rose-400 shrink-0" />}
                        <Link to={`/transcript/${video.id}`} className="font-medium text-sm truncate hover:text-primary transition-colors cursor-pointer" title={video.title || video.url}>
                          {video.title || video.url}
                        </Link>
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 shrink-0">
                          {video.language.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Link to={`/transcript/${video.id}`} className="text-slate-400 hover:text-primary" title="View details">
                          <ChevronRight size={18} />
                        </Link>
                        <button onClick={() => removeVideo(video.id)} className="text-slate-400 hover:text-rose-400" title="Remove">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {video.status === 'success' ? (
                      <p className="text-xs text-slate-400 line-clamp-2">{video.transcriptText}</p>
                    ) : (
                      <p className="text-xs text-rose-400">Error: {video.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Workspaces */}
      <div className="space-y-6">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center gap-2">
            <PlusSquare size={20} className="text-secondary" />
            Create Workspace
          </h2>
          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
            <p className="text-sm text-slate-400">
              Select one or more transcripts from the left, name your workspace, and start an expert chat.
            </p>
            <input 
              type="text" 
              placeholder="e.g. History Project Sources" 
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="input-field"
            />
            <button 
              type="submit" 
              disabled={selectedVideos.length === 0 || !workspaceName}
              className="btn btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary"
            >
              <LayoutGrid size={18} />
              Create Workspace ({selectedVideos.length} selected)
            </button>
          </form>
        </div>

        <div className="panel p-6 max-h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center gap-2">
            <LayoutGrid size={20} className="text-primary" />
            Your Workspaces
          </h2>
          {workspaces.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No workspaces created yet.</p>
          ) : (
            <div className="space-y-3">
              {workspaces.map(ws => (
                <div key={ws.id} className="bg-surface-light rounded-lg p-4 border border-slate-600 flex justify-between items-center group">
                  <div className="min-w-0 flex-1 pr-4">
                    <Link to={`/workspace/${ws.id}`} className="font-medium text-slate-200 hover:text-secondary truncate block">
                      {ws.name}
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">{ws.videoIds.length} sources linked</p>
                  </div>
                  <button onClick={() => removeWorkspace(ws.id)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
