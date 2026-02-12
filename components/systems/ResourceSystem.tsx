
import React, { useState, useEffect } from 'react';
import { ClassLevel } from '../../types';

interface FeatureItem {
  id: string;
  label: string;
  pdf?: string;
  audio?: string;
  video?: string;
  image?: string;
  children?: FeatureItem[];
}

interface FeatureConfig {
  rootMedia?: {
    pdf?: string;
    audio?: string;
    video?: string;
    image?: string;
  };
  items: FeatureItem[];
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
  const [rootItems, setRootItems] = useState<FeatureItem[]>([]);
  const [rootMedia, setRootMedia] = useState<any>(null);
  const [navigationStack, setNavigationStack] = useState<FeatureItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeatureItem | null>(null);
  const [activeMedia, setActiveMedia] = useState<'pdf' | 'audio' | 'video' | 'image'>('pdf');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [audio] = useState(new Audio());

  useEffect(() => {
    if (classConfig && classConfig[selectedClass]) {
      const featData = classConfig[selectedClass]?.features?.[systemId];
      
      let items: FeatureItem[] = [];
      let media: any = null;

      if (Array.isArray(featData)) {
        items = featData;
      } else if (featData) {
        items = featData.items || [];
        media = featData.rootMedia || null;
      }

      setRootItems(items);
      setRootMedia(media);

      // Auto-open logic: If there's root media and NO items, jump straight to the media viewer
      if (media && items.length === 0 && (media.pdf || media.video || media.audio || media.image)) {
        openMedia({ 
          id: 'root', 
          label: title, 
          ...media 
        });
      }
    }
  }, [selectedClass, classConfig, systemId, title]);

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
    if (item.children && item.children.length > 0) {
      setNavigationStack([...navigationStack, item]);
    } else {
      openMedia(item);
    }
  };

  const openMedia = (item: FeatureItem) => {
    setSelectedItem(item);
    setIsMediaLoading(true);
    // Auto-select first available media
    if (item.pdf) setActiveMedia('pdf');
    else if (item.video) setActiveMedia('video');
    else if (item.image) setActiveMedia('image');
    else if (item.audio) setActiveMedia('audio');
  }

  const goBack = () => {
    if (selectedItem) {
      if (selectedItem.id === 'root' && navigationStack.length === 0 && rootItems.length === 0) {
        onClose();
        return;
      }
      setSelectedItem(null);
      audio.pause();
      setIsPlaying(false);
    } else if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      newStack.pop();
      setNavigationStack(newStack);
    } else {
      onClose();
    }
  };

  const currentItems = navigationStack.length > 0 
    ? navigationStack[navigationStack.length - 1].children || [] 
    : rootItems;

  const currentParent = navigationStack.length > 0 
    ? navigationStack[navigationStack.length - 1] 
    : null;

  const currentTitle = selectedItem 
    ? selectedItem.label 
    : navigationStack.length > 0 
      ? navigationStack[navigationStack.length - 1].label 
      : title;

  const hasMedia = (item: any) => !!(item.pdf || item.video || item.audio || item.image);

  if (selectedItem) {
    return (
      <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-500">
        <div style={{ backgroundColor: accentColor }} className="p-6 text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-3 bg-white/10 rounded-2xl active:scale-90 transition-transform">
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
          {selectedItem.pdf && <button onClick={() => {setActiveMedia('pdf'); setIsMediaLoading(true);}} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'pdf' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>PDF</button>}
          {selectedItem.video && <button onClick={() => {setActiveMedia('video'); setIsMediaLoading(true);}} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'video' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>Video</button>}
          {selectedItem.image && <button onClick={() => {setActiveMedia('image'); setIsMediaLoading(true);}} className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeMedia === 'image' ? 'bg-[#2D235C] text-white shadow-md' : 'bg-white text-gray-400'}`}>Image</button>}
          
          {selectedItem.pdf && (
            <a 
              href={selectedItem.pdf} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-auto px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              Open PDF
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
          <div className="bg-white rounded-[32px] shadow-xl overflow-hidden flex-1 flex flex-col relative">
            {isMediaLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Media...</p>
              </div>
            )}

            {activeMedia === 'pdf' && selectedItem.pdf && (
              <object 
                data={selectedItem.pdf} 
                type="application/pdf" 
                className="w-full h-full min-h-[70vh] flex-1"
                onLoad={() => setIsMediaLoading(false)}
              >
                <div className="p-10 text-center flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center text-3xl">📄</div>
                  <p className="text-gray-500 font-bold">Unable to preview PDF directly.</p>
                  <a href={selectedItem.pdf} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-[#2D235C] text-white rounded-xl font-bold text-sm">Download PDF to View</a>
                </div>
              </object>
            )}

            {activeMedia === 'video' && selectedItem.video && (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <video 
                  src={selectedItem.video} 
                  controls 
                  className="w-full h-full" 
                  poster={selectedItem.image}
                  onLoadedData={() => setIsMediaLoading(false)}
                />
              </div>
            )}

            {activeMedia === 'image' && selectedItem.image && (
              <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                <img 
                  src={selectedItem.image} 
                  className="max-w-full h-auto object-contain rounded-xl" 
                  alt="Resource" 
                  onLoad={() => setIsMediaLoading(false)}
                />
              </div>
            )}
            
            {(!selectedItem[activeMedia]) && !isMediaLoading && (
              <div className="p-20 text-center text-gray-300 font-bold">No {activeMedia} content available.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] overflow-hidden">
      <div style={{ backgroundColor: accentColor }} className="p-8 text-white flex justify-between items-center rounded-b-[56px] shadow-2xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {navigationStack.length > 0 && (
            <button onClick={goBack} className="p-3 bg-white/10 rounded-2xl active:scale-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{navigationStack.length > 0 ? currentTitle : malayalamTitle}</h2>
            <p className="text-white/70 text-xs uppercase tracking-[0.2em] font-black mt-1">{navigationStack.length > 0 ? title : title}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="grid grid-cols-1 gap-4">
          {navigationStack.length === 0 && rootMedia && hasMedia(rootMedia) && (
             <button
              onClick={() => openMedia({ id: 'root', label: title, ...rootMedia })}
              className="group flex items-center gap-5 p-6 bg-indigo-50 rounded-[32px] shadow-sm border border-indigo-100 text-left transition-all hover:translate-y-[-4px] active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-md">
                 <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-indigo-900 leading-tight">View Main Resource</h3>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Primary file for this category</p>
              </div>
              <div className="text-indigo-200 group-hover:text-indigo-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          )}

          {currentParent && hasMedia(currentParent) && (
            <button
              onClick={() => openMedia(currentParent)}
              className="group flex items-center gap-5 p-6 bg-amber-50 rounded-[32px] shadow-sm border border-amber-100 text-left transition-all hover:translate-y-[-4px] active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-[#2D235C] shadow-md">
                 <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-amber-900 leading-tight">View Lesson Content</h3>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mt-0.5">Primary resources for {currentParent.label}</p>
              </div>
              <div className="text-amber-300 group-hover:text-amber-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          )}

          {currentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item)}
              className="group flex items-center gap-5 p-6 bg-white rounded-[32px] shadow-sm border border-gray-100 text-left transition-all hover:translate-y-[-4px] active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#2D235C] group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                {item.children && item.children.length > 0 ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#2D235C]">{item.label}</h3>
                <div className="flex gap-2 mt-1">
                  {item.children && item.children.length > 0 ? (
                    <span className="text-[8px] bg-purple-50 text-purple-500 font-black px-1.5 py-0.5 rounded uppercase">{item.children.length} Folders</span>
                  ) : (
                    <>
                      {item.pdf && <span className="text-[8px] bg-red-50 text-red-500 font-black px-1.5 py-0.5 rounded uppercase">PDF</span>}
                      {item.video && <span className="text-[8px] bg-blue-50 text-blue-500 font-black px-1.5 py-0.5 rounded uppercase">Video</span>}
                      {item.audio && <span className="text-[8px] bg-green-50 text-green-500 font-black px-1.5 py-0.5 rounded uppercase">Audio</span>}
                    </>
                  )}
                  {item.children && item.children.length > 0 && hasMedia(item) && (
                    <span className="text-[8px] bg-amber-50 text-amber-600 font-black px-1.5 py-0.5 rounded uppercase">+ Resources</span>
                  )}
                </div>
              </div>
              <div className="text-gray-200 group-hover:text-amber-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}
          {currentItems.length === 0 && !currentParent && !rootMedia && (
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
