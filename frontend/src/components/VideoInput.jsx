import { useState, useRef } from 'react';
import { Link, Upload, Loader2 } from 'lucide-react';

function VideoInput({ onAddUrl, onUploadFile, isLoading }) {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const fileInputRef = useRef(null);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onAddUrl(url, language);
      setUrl('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadFile(file, language);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="panel p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center gap-2">
        <Upload size={20} className="text-primary" />
        Add Video Source
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-400 mb-1">Target Language (Code)</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="input-field w-full max-w-xs"
        >
          <option value="en">English (en)</option>
          <option value="tr">Turkish (tr)</option>
          <option value="es">Spanish (es)</option>
          <option value="fr">French (fr)</option>
          <option value="de">German (de)</option>
        </select>
      </div>

      <div className="space-y-4">
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Paste YouTube or other video URL..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button type="submit" disabled={!url || isLoading} className="btn btn-primary flex items-center gap-2">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Link size={18} />}
            Extract URL
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-surface text-sm text-slate-400">OR</span>
          </div>
        </div>

        <div>
          <input 
            type="file" 
            accept="video/*,audio/*"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Upload Local Video/Audio
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoInput;
