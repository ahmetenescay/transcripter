import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';

function ResultPanel({ result }) {
  if (!result) {
    return (
      <div className="panel p-6 min-h-[300px] flex flex-col items-center justify-center text-slate-500">
        <Bot size={48} className="mb-4 opacity-50" />
        <p>Gemini responses will appear here.</p>
      </div>
    );
  }

  return (
    <div className="panel p-6 min-h-[300px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center gap-2 border-b border-slate-700 pb-2">
        <Bot size={20} className="text-secondary" />
        AI Response
      </h2>
      <div className="prose prose-invert prose-slate max-w-none flex-1 overflow-y-auto pr-2">
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ResultPanel;
