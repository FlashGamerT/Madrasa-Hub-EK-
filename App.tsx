
import React, { useState, useEffect, useCallback } from 'react';
import { Tab, ClassLevel } from './types';
import { COLORS, ICONS } from './constants';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ClassPicker from './components/ClassPicker';
import ResourceCard from './components/ResourceCard';
import KidsZone from './components/KidsZone';
import UtilityGrid from './components/UtilityGrid';
import Login from './components/Login';
import AdminPanel from './admin/AdminPanel';
import Splash from './components/Splash';
import ToLearnList from './components/ToLearnList';
import DigitalSlate from './components/DigitalSlate';
import About from './components/About';
import ResourceSystem from './components/systems/ResourceSystem';
import QuranSystem from './components/systems/QuranSystem';
import TranslatorSystem from './components/systems/TranslatorSystem';
import BannerSlider from './components/BannerSlider';
import { supabase, getSetting } from './lib/supabase';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('Class 5');
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [banners, setBanners] = useState<string[]>([]);
  const [classConfig, setClassConfig] = useState<any>({});

  // System Overlay States
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  // Dynamic Content State
  const [appImages, setAppImages] = useState({
    videoClasses: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    quran: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop",
    bookGuide: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    translatedGuide: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=800&auto=format&fit=crop",
    dua: "https://images.unsplash.com/photo-1597933534024-16478985c88c?q=80&w=800&auto=format&fit=crop",
    toLearn: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800&auto=format&fit=crop"
  });

  const loadData = useCallback(async () => {
    const storedName = localStorage.getItem('madrasa_hub_username');
    const storedClass = localStorage.getItem('madrasa_hub_class');
    if (storedName) { 
      setUserName(storedName); 
      setIsLoggedIn(true); 
    }
    if (storedClass) setSelectedClass(storedClass as ClassLevel);

    try {
      const [cloudBanners, cloudConfig, cloudImages] = await Promise.all([
        getSetting('banners'),
        getSetting('class_config'),
        getSetting('app_images')
      ]);
      
      if (cloudBanners) setBanners(cloudBanners);
      
      if (cloudConfig) {
        setClassConfig(cloudConfig);
        localStorage.setItem('madrasa_hub_class_config', JSON.stringify(cloudConfig));
      } else {
        const localConfig = localStorage.getItem('madrasa_hub_class_config');
        if (localConfig) setClassConfig(JSON.parse(localConfig));
      }

      if (cloudImages) {
        setAppImages(prev => ({ ...prev, ...cloudImages }));
        localStorage.setItem('madrasa_hub_app_images', JSON.stringify(cloudImages));
      }
    } catch (e) { 
      console.error("Data load error", e);
      const localConfig = localStorage.getItem('madrasa_hub_class_config');
      if (localConfig) setClassConfig(JSON.parse(localConfig));
    }
  }, []);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    loadData();

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadData]);

  useEffect(() => {
    if (adminTapCount >= 10) {
      setIsAdmin(true);
      setAdminTapCount(0);
    }
    
    const timer = setTimeout(() => {
      if (adminTapCount > 0) setAdminTapCount(0);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [adminTapCount]);

  const handleLogin = async (name: string) => {
    const cleanName = name.trim();
    setUserName(cleanName); 
    setIsLoggedIn(true);
    localStorage.setItem('madrasa_hub_username', cleanName);

    try {
      const { data: existingUser } = await supabase
        .from('students')
        .select('*')
        .eq('name', cleanName)
        .maybeSingle();

      if (!existingUser) {
        await supabase.from('students').insert([{ name: cleanName }]);
      }
    } catch (e) {
      console.error("Cloud user sync failed during login", e);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    setUserName('');
    localStorage.removeItem('madrasa_hub_username');
    setActiveTab(Tab.Home);
  };

  const handleClassSelect = (level: ClassLevel) => {
    setSelectedClass(level);
    localStorage.setItem('madrasa_hub_class', level);
  };

  const isVisible = (id: string) => {
    const hardHiddenRules: Record<string, string[]> = {
      'Class 1': ['videoClasses', 'bookGuide', 'translatedGuide'],
      'Class 2': ['videoClasses', 'translatedGuide'],
      'Class 3': ['videoClasses', 'translatedGuide'],
      'Class 4': ['videoClasses', 'translatedGuide'],
      'Plus Two': ['translatedGuide']
    };
    if ((hardHiddenRules[selectedClass] || []).includes(id)) return false;
    return !(classConfig[selectedClass]?.hiddenFeatures || []).includes(id);
  };

  const renderContent = () => {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    switch (activeTab) {
      case Tab.Home:
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <section className="px-6 pt-4"><ClassPicker selected={selectedClass} onSelect={handleClassSelect} /></section>
            {banners.length > 0 && <section className="px-6"><BannerSlider images={banners} /></section>}
            <section className="px-6">
              <h2 className="text-xl font-bold text-[#2D235C] mb-4">Learning Resources</h2>
              <div className="grid grid-cols-2 gap-4">
                {isVisible('videoClasses') && <div onClick={() => setActiveOverlay('videoClasses')}><ResourceCard title="Video Classes" malayalamTitle="വീഡിയോ ക്ലാസുകൾ" description="Interactive video lessons." icon={<ICONS.Play className="w-6 h-6 text-white" />} color="#2D235C" image={appImages.videoClasses} /></div>}
                {isVisible('quran') && <div onClick={() => setActiveOverlay('quran')}><ResourceCard title="Holy Quran" malayalamTitle="വിശുദ്ധ ഖുർആൻ" description="Read and listen." icon={<ICONS.Quran className="w-6 h-6 text-white" />} color="#FFC107" image={appImages.quran} /></div>}
                {isVisible('bookGuide') && <div onClick={() => setActiveOverlay('bookGuide')}><ResourceCard title="Book Guide" malayalamTitle="പുസ്തക സഹായി" description="Full textbook guides." icon={<ICONS.Book className="w-6 h-6 text-white" />} color="#1976D2" image={appImages.bookGuide} /></div>}
                {isVisible('translatedGuide') && <div onClick={() => setActiveOverlay('translatedGuide')}><ResourceCard title="Translated Guide" malayalamTitle="വിവർത്തനം" description="Study guides in Malayalam." icon={<ICONS.Translate className="w-6 h-6 text-white" />} color="#00796B" image={appImages.translatedGuide} /></div>}
                {isVisible('dua') && <div onClick={() => setActiveOverlay('dua')}><ResourceCard title="Dua" malayalamTitle="ദുആകൾ" description="Important daily supplications." icon={<ICONS.Dua className="w-6 h-6 text-white" />} color="#D32F2F" image={appImages.dua} /></div>}
                {isVisible('toLearn') && <div onClick={() => setActiveOverlay('toLearn')}><ResourceCard title="To Learn List" malayalamTitle="പഠന പട്ടിക" description="Plan your study schedule." icon={<ICONS.List className="w-6 h-6 text-white" />} color="#7B1FA2" image={appImages.toLearn} /></div>}
              </div>
            </section>
            <section className="px-6"><h2 className="text-xl font-bold text-[#2D235C] mb-4">Academic Hub</h2><UtilityGrid selectedClass={selectedClass} onSelect={setActiveOverlay} /></section>
            <section className="px-6 pb-12"><h2 className="text-xl font-bold text-[#2D235C] mb-4">Kids Zone</h2><KidsZone onSelectSlate={() => setActiveOverlay('digitalSlate')} onSelectAbout={() => setActiveOverlay('about')} onSelectSystem={setActiveOverlay} /></section>
          </div>
        );
      case Tab.Academic:
        return (
          <div className="px-6 py-8 pb-32 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#2D235C] mb-6">Academic Center</h2>
            <UtilityGrid 
              selectedClass={selectedClass} 
              onSelect={setActiveOverlay} 
              variant="large" 
            />
          </div>
        );
      case Tab.Kids:
        return <div className="px-6 py-8 pb-32"><h2 className="text-2xl font-bold text-[#2D235C] mb-6">Kids Adventure</h2><KidsZone onSelectSlate={() => setActiveOverlay('digitalSlate')} onSelectAbout={() => setActiveOverlay('about')} onSelectSystem={setActiveOverlay} /></div>;
      case Tab.Profile:
        return (
          <div className="px-6 py-8 pb-32">
            <div className="glass-card p-8 rounded-[40px] text-center shadow-2xl">
              <div 
                onPointerDown={() => setAdminTapCount(prev => prev + 1)} 
                className="w-24 h-24 bg-[#2D235C] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold uppercase cursor-pointer select-none active:scale-90 shadow-lg border-4 border-white transition-all"
              >
                {userName.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-[#2D235C]">{userName}</h3>
              <p className="text-gray-400 text-xs mt-1 font-medium">{today}</p>
              <button onClick={handleLogout} className="mt-8 w-full py-4 px-6 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 active:scale-95">Logout</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const getSystemProps = (id: string) => {
    const systems: Record<string, { title: string, malayalamTitle: string, color: string }> = {
      videoClasses: { title: "Video Classes", malayalamTitle: "വീഡിയോ ക്ലാസുകൾ", color: "#2D235C" },
      bookGuide: { title: "Book Guide", malayalamTitle: "പുസ്തക സഹായി", color: "#1976D2" },
      translatedGuide: { title: "Translated Guide", malayalamTitle: "വിവർത്തനം", color: "#00796B" },
      dua: { title: "Dua", malayalamTitle: "പ്രാർത്ഥനകൾ", color: "#D32F2F" },
      syl: { title: "Syllabus", malayalamTitle: "സിലബസ്", color: "#3949AB" },
      tim: { title: "Timetable", malayalamTitle: "ടൈംടേബിൾ", color: "#8E24AA" },
      mod: { title: "Model Papers", malayalamTitle: "മോഡൽ പേപ്പേഴ്സ്", color: "#0288D1" },
      alphabets: { title: "Alphabets", malayalamTitle: "അക്ഷരങ്ങൾ", color: "#00897B" },
      rhymes: { title: "Rhymes", malayalamTitle: "പാട്ടുകൾ", color: "#F4511E" }
    };
    const props = systems[id] || { title: "System", malayalamTitle: "സഹായി", color: "#2D235C" };
    return { ...props, malayalamTitle: props.malayalamTitle };
  };

  if (showSplash) return <Splash />;
  
  if (isAdmin) return <AdminPanel onClose={() => { setIsAdmin(false); loadData(); }} onRefresh={loadData} />;
  
  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen max-w-2xl mx-auto relative bg-[#FDF8F5]">
      <Header scrolled={scrolled} />
      <main className="pt-24">{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeOverlay === 'toLearn' && <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-500"><ToLearnList onClose={() => setActiveOverlay(null)} /></div>}
      {activeOverlay === 'digitalSlate' && <div className="fixed inset-0 z-[200] bg-[#1a1a1a] animate-in slide-in-from-bottom duration-500"><DigitalSlate onClose={() => setActiveOverlay(null)} /></div>}
      {activeOverlay === 'about' && <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-500"><About onClose={() => setActiveOverlay(null)} /></div>}
      {activeOverlay === 'quran' && <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-500"><QuranSystem onClose={() => setActiveOverlay(null)} /></div>}
      {activeOverlay === 'translator' && <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-500"><TranslatorSystem onClose={() => setActiveOverlay(null)} /></div>}
      
      {activeOverlay && !['toLearn', 'digitalSlate', 'about', 'quran', 'translator'].includes(activeOverlay) && (
        <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-500">
          <ResourceSystem 
            systemId={activeOverlay} 
            {...getSystemProps(activeOverlay)}
            selectedClass={selectedClass} 
            classConfig={classConfig} 
            onClose={() => setActiveOverlay(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default App;
