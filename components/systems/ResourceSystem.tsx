
import React, { useState, useEffect } from 'react';
import { ClassLevel } from '../../types';

interface FeatureItem {
  id: string;
  label: string;
  pdf?: string;
  audio?: string;
  video?: string;
  image?: string;
}

interface ResourceSystemProps {
  systemId: string;
  title: string;
  malayalamTitle: string;
  selectedClass: ClassLevel;
  classConfig: any;
  onClose: () => void;
  accentColor?: string;
}

const ResourceSystem: React.FC<ResourceSystemProps> = ({ 
  systemId, 
  title, 
  malayalamTitle, 
  selectedClass, 
  classConfig, 
  onClose,
  accentColor = "#2D235C"
}) => {
  const [items, setItems] = useState<FeatureItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeatureItem | null>(null);
  const [activeMedia, setActiveMedia] = useState<'pdf' | 'audio' | 'video' | 'image'>('pdf');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  useEffect(() => {
    if (classConfig && classConfig[selectedClass]) {
      const feats = classConfig[selectedClass]?.features?.[systemId] || [];
      setItems(feats);
    }
  }, [selectedClass, classConfig, systemId]);

  const toggleAudio = (url: string) => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = url;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleItemSelect = (item: FeatureItem) => {
    setSelectedItem(item);
    // Auto-select first available media
    if (item.pdf) setActiveMedia('pdf');
    else if (item.video) setActiveMedia('video');
    else if (item.image) setActiveMedia('image');
    else if (item.audio) setActiveMedia('audio');
  };

  if (selectedItem) {
    return (
      <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-500">
        <div style={{ backgroundColor: accentColor }} className="p-6 text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => {setSelectedItem(null); audio.pause(); setIsPlaying(false);}} className="p-3 bg-white/10 rounded-2xl active:scale-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-bold truncate max-w-[200px] leading-tight">{selectedItem.label}</h2>
              <p className="text-white/60 text-[10px] uppercase font-black tracking-widest">{selectedClass} Academy</p>
            </div>
          </div>
          {selectedItem.audio && (
            <button 
              onClick={() => toggleAudio(selectedItem.audio!)}
              className={`p-3 rounded-2xl transition-all ${isPlaying ? 'bg-amber-400 text-[#2D235C]' : 'bg-white/10 text-white'}`}
            >
              {isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
            </button>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100">
          {selectedItem.pdf && <button onClick={() => setActiveMedia('pdf')} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'pdf' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>PDF</button>}
          {selectedItem.video && <button onClick={() => setActiveMedia('video')} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'video' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>Video</button>}
          {selectedItem.image && <button onClick={() => setActiveMedia('image')} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'image' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>Image</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="bg-white rounded-[32px] shadow-xl overflow-hidden min-h-[60vh] flex flex-col">
            {activeMedia === 'pdf' && selectedItem.pdf && (
              <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedItem.pdf)}&embedded=true`} className="w-full flex-1 border-none min-h-[70vh]" />
            )}
            {activeMedia === 'video' && selectedItem.video && (
              <div className="w-full aspect-video bg-black flex items-center justify-center">
                <video src={selectedItem.video} controls className="w-full h-full" poster={selectedItem.image} />
              </div>
            )}
            {activeMedia === 'image' && selectedItem.image && (
              <img src={selectedItem.image} className="w-full h-auto object-contain p-4" alt="Resource" />
            )}
            {(!selectedItem[activeMedia]) && <div className="p-20 text-center text-gray-300 font-bold">Content Loading...</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] overflow-hidden">
      <div style={{ backgroundColor: accentColor }} className="p-8 text-white flex justify-between items-center rounded-b-[56px] shadow-2xl sticky top-0 z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{malayalamTitle}</h2>
          <p className="text-white/70 text-xs uppercase tracking-[0.2em] font-black mt-1">{title}</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item)}
              className="group flex items-center gap-5 p-6 bg-white rounded-[32px] shadow-sm border border-gray-100 text-left transition-all hover:translate-y-[-4px] active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#2D235C] group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#2D235C]">{item.label}</h3>
                <div className="flex gap-2 mt-1">
                  {item.pdf && <span className="text-[8px] bg-red-50 text-red-500 font-black px-1.5 py-0.5 rounded uppercase">PDF</span>}
                  {item.video && <span className="text-[8px] bg-blue-50 text-blue-500 font-black px-1.5 py-0.5 rounded uppercase">Video</span>}
                  {item.audio && <span className="text-[8px] bg-green-50 text-green-500 font-black px-1.5 py-0.5 rounded uppercase">Audio</span>}
                </div>
              </div>
              <div className="text-gray-200 group-hover:text-amber-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}
          {items.length === 0 && (
            <div className="py-20 text-center text-gray-300">
               <p className="font-bold">No items found</p>
               <p className="text-xs">Add content in the Admin Panel to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceSystem;
