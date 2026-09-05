import { useState } from 'react';
import { Sparkles, MessageSquare, Loader2 } from 'lucide-react';

function ActionPanel({ onSummarize, onQA, isLoading, disabled }) {
  const [question, setQuestion] = useState('');

  const handleQASubmit = (e) => {
    e.preventDefault();
    if (question) {
      onQA(question);
    }
  };

  return (
    <div className="panel p-6">
      <h2 className="text-xl font-semibold mb-6 text-slate-100 flex items-center gap-2">
        <Sparkles size={20} className="text-secondary" />
        Gemini AI Actions
      </h2>
      
      <div className="space-y-6">
        <div>
          <button 
            onClick={onSummarize} 
            disabled={disabled || isLoading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Summarize All Transcripts
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-surface text-sm text-slate-400">OR ASK A QUESTION</span>
          </div>
        </div>

        <form onSubmit={handleQASubmit} className="flex flex-col gap-3">
          <textarea 
            placeholder="E.g. What are the key takeaways from these videos?" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-field min-h-[80px] resize-y"
            disabled={disabled || isLoading}
          />
          <button 
            type="submit" 
            disabled={disabled || !question || isLoading} 
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
            Ask Gemini
          </button>
        </form>
      </div>
    </div>
  );
}

export default ActionPanel;
