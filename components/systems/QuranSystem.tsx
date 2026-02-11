import React, { useState, useEffect, useMemo } from 'react';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
}

const QuranSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  // Fetch All Surahs on Mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch surahs", error);
      }
    };
    fetchSurahs();
  }, []);

  // Fetch Ayahs when a Surah is selected
  useEffect(() => {
    if (!selectedSurah) {
      setAyahs([]);
      setTranslations({});
      return;
    }

    const fetchAyahData = async () => {
      setLoading(true);
      try {
        // Fetch Arabic
        const resArabic = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}`);
        const dataArabic = await resArabic.json();
        
        // Fetch English Translation
        const resTrans = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.asad`);
        const dataTrans = await resTrans.json();

        if (dataArabic.code === 200 && dataTrans.code === 200) {
          setAyahs(dataArabic.data.ayahs);
          const transMap: Record<number, string> = {};
          dataTrans.data.ayahs.forEach((a: any) => {
            transMap[a.numberInSurah] = a.text;
          });
          setTranslations(transMap);
        }
      } catch (error) {
        console.error("Failed to fetch ayahs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAyahData();
  }, [selectedSurah]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.number.toString() === searchQuery
    );
  }, [surahs, searchQuery]);

  const toggleAudio = () => {
    if (!selectedSurah) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Use standard global recitation API
      audio.src = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${selectedSurah.number}.mp3`;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-[120]">
        <div className="flex items-center gap-4">
          {selectedSurah && (
            <button 
              onClick={() => setSelectedSurah(null)}
              className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold">{selectedSurah ? selectedSurah.englishName : 'Holy Quran'}</h2>
            <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">
              {selectedSurah ? `Surah ${selectedSurah.number}` : 'Divine Guidance'}
            </p>
          </div>
        </div>
        {!selectedSurah ? (
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-95 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-sm">
            {selectedSurah.number}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {!selectedSurah ? (
          <div className="space-y-4 pb-24 animate-in fade-in duration-500">
            {/* Search Bar */}
            <div className="relative mb-6">
              <input 
                type="text"
                placeholder="Search Surah by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D235C11] font-medium text-[#2D235C]"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 mb-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold text-amber-800 text-sm mb-1 uppercase tracking-tighter">Gateway to Paradise</h3>
                <p className="text-amber-900 text-xl font-bold">The Holy Quran</p>
                <p className="text-amber-700/70 text-xs mt-1 max-w-[200px]">Read, study, and listen to all 114 Surahs from the divine revelation.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 text-amber-200/20 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Index of Revelation</h3>
            <div className="space-y-3">
              {filteredSurahs.map(surah => (
                <div 
                  key={surah.number} 
                  onClick={() => setSelectedSurah(surah)}
                  className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer group hover:border-[#2D235C33] hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-[#2D235C] text-sm group-hover:bg-[#2D235C] group-hover:text-white transition-all shadow-sm">
                    {surah.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#2D235C] text-base">{surah.englishName}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-tighter">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-lg font-arabic font-bold text-[#2D235C] leading-none mb-1">{surah.name}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${surah.revelationType === 'Meccan' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {surah.revelationType}
                    </span>
                  </div>
                </div>
              ))}
              {filteredSurahs.length === 0 && (
                <div className="text-center py-12 text-gray-400 italic">
                  No Surahs found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pb-32 animate-in fade-in slide-in-from-right duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-[#2D235C22] border-t-[#2D235C] rounded-full animate-spin"></div>
                <p className="text-[#2D235C] font-bold text-sm animate-pulse">Loading Sacred Verses...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-3 bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFC107] to-transparent"></div>
                  <h2 className="text-3xl font-bold text-[#2D235C]">{selectedSurah.englishName}</h2>
                  <p className="text-gray-400 italic font-medium">"{selectedSurah.englishNameTranslation}"</p>
                  <div className="flex justify-center items-center gap-3">
                    <span className="text-[10px] font-bold bg-[#2D235C0a] text-[#2D235C] px-3 py-1 rounded-full uppercase tracking-widest">{selectedSurah.revelationType}</span>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">{selectedSurah.numberOfAyahs} Ayahs</span>
                  </div>
                </div>

                {/* Bismillah - Don't show for Surah At-Tawbah (9) */}
                {selectedSurah.number !== 9 && (
                  <div className="text-center py-8">
                    <p className="text-4xl font-arabic leading-[4.5rem] text-[#2D235C] drop-shadow-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                    <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">In the name of Allah, the Entirely Merciful, the Especially Merciful.</p>
                  </div>
                )}

                <div className="space-y-12">
                   {ayahs.map(ayah => (
                     <div key={ayah.number} className="space-y-6 group">
                       <div className="flex justify-between items-start gap-6">
                         <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300 group-hover:border-[#2D235C44] group-hover:text-[#2D235C] transition-all">
                           {ayah.numberInSurah}
                         </div>
                         <p className="text-3xl text-right leading-[3.8rem] text-[#2D235C] flex-1 font-arabic" dir="rtl">
                           {/* Remove Bismillah from text if it's the first ayah of a surah (handled separately above) */}
                           {selectedSurah.number !== 1 && selectedSurah.number !== 9 && ayah.numberInSurah === 1 
                            ? ayah.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim()
                            : ayah.text}
                         </p>
                       </div>
                       <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-50 group-hover:shadow-md transition-shadow">
                         <p className="text-sm text-gray-600 leading-relaxed italic">
                           {translations[ayah.numberInSurah] || 'Translation loading...'}
                         </p>
                       </div>
                     </div>
                   ))}
                </div>

                {/* Sticky Audio Control */}
                <div className="fixed bottom-10 left-6 right-6 z-[110] animate-in slide-in-from-bottom duration-700">
                  <div className="glass-card bg-[#2D235C]/95 backdrop-blur-2xl p-4 rounded-[32px] flex items-center gap-4 shadow-2xl border border-white/10 ring-1 ring-white/10">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-white font-bold text-xs">Mishary Rashid Alafasy</p>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">{selectedSurah.englishName}</p>
                      </div>

                      <button 
                        onClick={toggleAudio}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-400 text-[#2D235C] scale-105' : 'bg-white text-[#2D235C] hover:scale-105 active:scale-95'}`}
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranSystem;