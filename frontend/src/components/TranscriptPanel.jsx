import { FileText, XCircle, CheckCircle, Trash2 } from 'lucide-react';

function TranscriptPanel({ videoList, onRemove }) {
  if (videoList.length === 0) {
    return (
      <div className="panel p-6 min-h-[200px] flex flex-col items-center justify-center text-slate-500">
        <FileText size={48} className="mb-4 opacity-50" />
        <p>No transcripts loaded yet.</p>
      </div>
    );
  }

  return (
    <div className="panel p-6 max-h-[600px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center gap-2">
        <FileText size={20} className="text-primary" />
        Loaded Transcripts
      </h2>
      <div className="space-y-4">
        {videoList.map((video) => (
          <div key={video.id} className="bg-surface-light rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {video.status === 'success' ? (
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                )}
                <span className="font-medium text-sm truncate" title={video.url}>{video.url}</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 shrink-0">
                  {video.language.toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => onRemove(video.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
            {video.status === 'success' ? (
              <div className="text-xs text-slate-400 line-clamp-3 bg-surface p-2 rounded border border-slate-700">
                {video.transcriptText}
              </div>
            ) : (
              <div className="text-xs text-rose-400 bg-rose-400/10 p-2 rounded">
                Error: {video.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TranscriptPanel;
