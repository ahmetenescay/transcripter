import { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TranscriptContext } from '../context/TranscriptContext';
import { qaTranscripts } from '../services/api';
import { ArrowLeft, MessageSquare, Loader2, LayoutGrid, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaces, videoList } = useContext(TranscriptContext);
  const [workspace, setWorkspace] = useState(null);
  const [sources, setSources] = useState([]);
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const foundWs = workspaces.find(w => w.id === id);
    if (!foundWs) {
      navigate('/');
      return;
    }
    setWorkspace(foundWs);
    const relatedVideos = videoList.filter(v => foundWs.videoIds.includes(v.id));
    setSources(relatedVideos);
  }, [id, workspaces, videoList, navigate]);

  if (!workspace) return null;

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQ }]);
    setIsLoading(true);

    try {
      const texts = sources.map(s => s.transcriptText);
      const data = await qaTranscripts(texts, userQ);
      setChatHistory(prev => [...prev, { role: 'expert', content: data.result }]);
    } catch (err) {
      const apiError = err.response?.data?.detail || err.message;
      setChatHistory(prev => [...prev, { role: 'expert', content: `Error: ${apiError}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-h-[800px]">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link to="/" className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutGrid className="text-primary" />
            {workspace.name}
          </h2>
          <p className="text-sm text-slate-400">{sources.length} sources linked</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Left sidebar: sources */}
        <div className="panel p-4 overflow-y-auto hidden lg:block">
          <h3 className="font-semibold text-slate-300 mb-4 text-sm uppercase tracking-wider">Sources</h3>
          <ul className="space-y-3">
            {sources.map(s => (
              <li key={s.id} className="bg-surface-light p-3 rounded text-xs truncate text-slate-400 border border-slate-700" title={s.url}>
                {s.url}
              </li>
            ))}
          </ul>
        </div>

        {/* Main chat area */}
        <div className="panel lg:col-span-3 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Bot size={48} className="mb-4 opacity-50" />
                <p>Expert mode initialized.</p>
                <p className="text-sm mt-2 max-w-md text-center">I am ready to answer questions based strictly on the {sources.length} sources provided in this workspace.</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'expert' && <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0"><Bot size={18} className="text-secondary"/></div>}
                  <div className={`p-4 rounded-xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface-light border border-slate-700 rounded-tl-none'}`}>
                    <div className={msg.role === 'expert' ? 'prose prose-invert prose-sm max-w-none' : 'text-sm whitespace-pre-wrap'}>
                      {msg.role === 'expert' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0"><Bot size={18} className="text-secondary"/></div>
                <div className="p-4 rounded-xl bg-surface-light border border-slate-700 rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Analyzing sources...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-surface-light border-t border-slate-700 shrink-0">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input 
                type="text"
                placeholder="Ask your expert anything about these sources..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={isLoading}
                className="input-field flex-1"
              />
              <button 
                type="submit"
                disabled={!question.trim() || isLoading}
                className="btn btn-primary"
              >
                <MessageSquare size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
