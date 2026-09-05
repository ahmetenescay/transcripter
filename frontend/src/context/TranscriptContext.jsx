import { createContext, useState, useEffect } from 'react';

export const TranscriptContext = createContext();

export function TranscriptProvider({ children }) {
  const [videoList, setVideoList] = useState(() => {
    const saved = localStorage.getItem('transcripter_videos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('transcripter_workspaces');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transcripter_videos', JSON.stringify(videoList));
  }, [videoList]);

  useEffect(() => {
    localStorage.setItem('transcripter_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  const addVideo = (video) => setVideoList(prev => {
    // Prevent duplicate entries by id if exists
    const existingIndex = prev.findIndex(v => v.id === video.id);
    if (existingIndex >= 0) {
      const newList = [...prev];
      newList[existingIndex] = video;
      return newList;
    }
    return [...prev, video];
  });
  const removeVideo = (id) => setVideoList(prev => prev.filter(v => v.id !== id));
  
  const updateVideo = (id, updates) => {
    setVideoList(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };
  
  const createWorkspace = (name, selectedVideoIds) => {
    const newWorkspace = {
      id: Date.now().toString(),
      name,
      videoIds: selectedVideoIds,
      createdAt: new Date().toISOString()
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace.id;
  };
  
  const removeWorkspace = (id) => setWorkspaces(prev => prev.filter(w => w.id !== id));

  return (
    <TranscriptContext.Provider value={{
      videoList, addVideo, removeVideo, updateVideo,
      workspaces, createWorkspace, removeWorkspace
    }}>
      {children}
    </TranscriptContext.Provider>
  );
}
