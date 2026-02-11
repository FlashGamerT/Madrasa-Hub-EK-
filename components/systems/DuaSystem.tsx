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

interface DuaSystemProps {
  selectedClass: ClassLevel;
  classConfig: any;
  onClose: () => void;
}

const DuaSystem: React.FC<DuaSystemProps> = ({ selectedClass, classConfig, onClose }) => {
  const [items, setItems] = useState<FeatureItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeatureItem | null>(null);
  const [activeMedia, setActiveMedia] = useState<'pdf' | 'audio' | 'video' | 'image'>('pdf');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  useEffect(() => {
    // Priority: Prop-based config (from Supabase/App state)
    if (classConfig && classConfig[selectedClass]) {
      const classFeats = classConfig[selectedClass]?.features?.dua || [];
      setItems(classFeats);
    } else {
      // Fallback: Local storage (for offline or cached access)
      const stored = localStorage.getItem('madrasa_hub_class_config');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const classFeats = parsed[selectedClass]?.features?.dua || [];
          setItems(classFeats);
        } catch (e) {}
      }
    }
  }, [selectedClass, classConfig]);

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

  if (selectedItem) {
    return (
      <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-500">
        <div className="p-6 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => {setSelectedItem(null); audio.pause(); setIsPlaying(false);}} className="p-3 bg-white/10 rounded-2xl active:scale-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-bold truncate max-w-[200px] leading-tight">{selectedItem.label}</h2>
              <p className="text-indigo-200 text-[10px] uppercase font-black tracking-widest opacity-70">{selectedClass} Study Kit</p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedItem.audio && (
              <button 
                onClick={() => toggleAudio(selectedItem.audio!)}
                className={`p-3 rounded-2xl transition-all ${isPlaying ? 'bg-amber-400 text-[#2D235C]' : 'bg-white/10 text-white'}`}
              >
                {isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50/80 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100">
          {selectedItem.pdf && (
            <button onClick={() => setActiveMedia('pdf')} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'pdf' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>PDF Document</button>
          )}
          {selectedItem.video && (
            <button onClick={() => setActiveMedia('video')} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'video' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>Video Class</button>
          )}
          {selectedItem.image && (
            <button onClick={() => setActiveMedia('image')} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'image' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>Visual Guide</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F9F6F2]">
          <div className="bg-white rounded-[40px] shadow-2xl shadow-[#2D235C0a] overflow-hidden border border-gray-100 min-h-[70vh] flex items-center justify-center">
            {activeMedia === 'pdf' && selectedItem.pdf && (
              <object data={selectedItem.pdf} type="application/pdf" className="w-full h-[70vh] border-none">
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">📄</div>
                  <h4 className="font-bold text-[#2D235C]">Preview Not Available</h4>
                  <button onClick={() => window.open(selectedItem.pdf, '_blank')} className="mt-6 px-8 py-3 bg-[#2D235C] text-white rounded-xl font-bold">Open Manually</button>
                </div>
              </object>
            )}
            {activeMedia === 'video' && selectedItem.video && (
              <div className="w-full aspect-video bg-black flex items-center justify-center">
                <video src={selectedItem.video} controls className="w-full h-full" poster={selectedItem.image} />
              </div>
            )}
            {activeMedia === 'image' && selectedItem.image && (
              <img src={selectedItem.image} alt="Dua Guide" className="max-w-full max-h-full object-contain p-4" />
            )}
            {(!selectedItem[activeMedia]) && (
              <div className="text-gray-300 font-bold text-center p-12">No content available for this media type.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="p-8 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[56px] shadow-2xl sticky top-0 z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">പ്രാർത്ഥനകൾ</h2>
          <p className="text-indigo-200 text-xs uppercase tracking-[0.2em] font-black opacity-80 mt-1">{selectedClass} Supplications</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 gap-5 pb-32">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {setSelectedItem(item); setActiveMedia(item.pdf ? 'pdf' : item.video ? 'video' : item.image ? 'image' : 'pdf');}}
              className="group relative flex items-center gap-6 p-6 bg-white rounded-[40px] shadow-lg shadow-[#2D235C06] border border-gray-100/50 transition-all hover:translate-y-[-6px] active:scale-[0.97] text-left"
            >
              <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-[#2D235C] group-hover:rotate-6 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2D235C] font-['Noto Sans Malayalam'] leading-tight mb-1">{item.label}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Study Guide Available
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#2D235C22] group-hover:bg-[#FFC107] group-hover:text-[#2D235C] transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}

          {items.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="font-bold text-[#2D235C] opacity-40">No items added yet.</h4>
              <p className="text-gray-400 text-xs mt-1">Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuaSystem;