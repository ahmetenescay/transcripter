import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TranscriptPage from './pages/TranscriptPage';
import WorkspacePage from './pages/WorkspacePage';

function App() {
  return (
    <div className="container mx-auto p-4 max-w-6xl min-h-screen flex flex-col">
      <header className="mb-8 mt-4 text-center">
        <Link to="/">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary inline-block hover:opacity-80 transition-opacity">
            Transcripter
          </h1>
        </Link>
        <p className="text-slate-400 mt-2">Extract, summarize, and query video transcripts locally</p>
      </header>
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/transcript/:id" element={<TranscriptPage />} />
          <Route path="/workspace/:id" element={<WorkspacePage />} />
        </Routes>
      </main>
      
      <footer className="mt-12 py-6 border-t border-slate-800 text-center text-sm text-slate-500">
        Transcripter V2 &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
