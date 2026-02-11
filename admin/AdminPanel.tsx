
import React, { useState, useEffect, useRef } from 'react';
import { ClassLevel } from '../types';
import { supabase, getSetting, saveSetting } from '../lib/supabase';

interface FeatureItem {
  id: string;
  label: string;
  pdf?: string;
  audio?: string;
  video?: string;
  image?: string;
}

interface ClassConfig {
  hiddenFeatures: string[];
  features: Record<string, FeatureItem[]>;
}

interface AppImages {
  videoClasses: string;
  quran: string;
  bookGuide: string;
  translatedGuide: string;
  dua: string;
  toLearn: string;
}

const ALL_CLASSES: ClassLevel[] = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
  'Plus One', 'Plus Two'
];

const APP_FEATURES = [
  { id: 'videoClasses', label: 'Video Classes', malayalam: 'വീഡിയോ ക്ലാസുകൾ' },
  { id: 'bookGuide', label: 'Book Guide', malayalam: 'പുസ്തക സഹായി' },
  { id: 'translatedGuide', label: 'Translated Guide', malayalam: 'വിവർത്തനം' },
  { id: 'dua', label: 'Dua', malayalam: 'പ്രാർത്ഥനകൾ' },
  { id: 'syl', label: 'Syllabus', malayalam: 'സിലബസ്' },
  { id: 'tim', label: 'Timetable', malayalam: 'ടൈംടേബിൾ' },
  { id: 'mod', label: 'Model Papers', malayalam: 'മോഡൽ പേപ്പേഴ്സ്' },
  { id: 'alphabets', label: 'Alphabets', malayalam: 'അക്ഷരങ്ങൾ' },
  { id: 'rhymes', label: 'Rhymes', malayalam: 'പാട്ടുകൾ' }
];

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [terminalId, setTerminalId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'home' | 'customization'>('home');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('Class 1');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [classConfigs, setClassConfigs] = useState<Record<string, ClassConfig>>({});
  const [banners, setBanners] = useState<string[]>([]);
  const [appImages, setAppImages] = useState<AppImages>({
    videoClasses: "",
    quran: "",
    bookGuide: "",
    translatedGuide: "",
    dua: "",
    toLearn: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  useEffect(() => {
    const loadAllData = async () => {
      const [cloudUsers, cloudConfig, cloudBanners, cloudImages] = await Promise.all([
        supabase.from('students').select('name'),
        getSetting('class_config'),
        getSetting('banners'),
        getSetting('app_images')
      ]);
      if (cloudUsers.data) setUsers(cloudUsers.data.map((u: any) => u.name));
      if (cloudConfig) setClassConfigs(cloudConfig);
      if (cloudBanners) setBanners(cloudBanners);
      if (cloudImages) setAppImages(cloudImages);
    };
    loadAllData();
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminalId === '198755') setIsAuthenticated(true);
    else alert('Invalid Terminal ID');
  };

  const saveAllToStorage = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting('class_config', classConfigs),
        saveSetting('banners', banners),
        saveSetting('app_images', appImages)
      ]);
      alert('Changes synced successfully!');
    } catch (err) { alert('Failed to sync. Check connection.'); }
    finally { setIsSaving(false); }
  };

  const addItem = () => {
    if (!selectedFeatureId) return;
    const current = classConfigs[selectedClass] || { hiddenFeatures: [], features: {} };
    const items = current.features[selectedFeatureId] || [];
    const newItem = { id: Date.now().toString(), label: 'New Resource' };
    setClassConfigs({ ...classConfigs, [selectedClass]: { ...current, features: { ...current.features, [selectedFeatureId]: [...items, newItem] } } });
  };

  const updateItem = (id: string, field: string, val: string) => {
    if (!selectedFeatureId) return;
    const current = classConfigs[selectedClass];
    const items = current.features[selectedFeatureId].map(i => i.id === id ? { ...i, [field]: val } : i);
    setClassConfigs({ ...classConfigs, [selectedClass]: { ...current, features: { ...current.features, [selectedFeatureId]: items } } });
  };

  const addBanner = () => {
    if (newBannerUrl.trim()) {
      setBanners([...banners, newBannerUrl.trim()]);
      setNewBannerUrl('');
    }
  };

  const removeBanner = (idx: number) => {
    setBanners(banners.filter((_, i) => i !== idx));
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#2D235C] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#2D235C] text-center mb-8">Admin Portal</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="password" placeholder="••••••" value={terminalId} onChange={e => setTerminalId(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none" />
          <button className="w-full h-14 bg-[#2D235C] text-white rounded-2xl font-bold">Verify Identity</button>
          <button type="button" onClick={onClose} className="w-full text-gray-400 text-sm py-2">Return</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-10 flex flex-col">
      <div className="bg-[#2D235C] text-white px-8 pt-10 pb-20 rounded-b-[64px]">
        <h1 className="text-3xl font-bold mb-10 text-center">Control Center</h1>
        <div className="grid grid-cols-3 gap-2 bg-white/10 p-1.5 rounded-[32px] backdrop-blur-xl">
          <button onClick={() => setActiveTab('users')} className={`py-4 rounded-3xl font-bold text-xs ${activeTab === 'users' ? 'bg-white text-[#2D235C]' : 'text-white/60'}`}>Users</button>
          <button onClick={() => setActiveTab('home')} className={`py-4 rounded-3xl font-bold text-xs ${activeTab === 'home' ? 'bg-white text-[#2D235C]' : 'text-white/60'}`}>Resources</button>
          <button onClick={() => setActiveTab('customization')} className={`py-4 rounded-3xl font-bold text-xs ${activeTab === 'customization' ? 'bg-white text-[#2D235C]' : 'text-white/60'}`}>Customization</button>
        </div>
      </div>

      <div className="px-8 -mt-10 flex-1">
        {activeTab === 'home' && (
          <div className="space-y-6 pb-20">
            <div className="bg-white p-6 rounded-[40px] shadow-xl flex flex-wrap gap-2 mb-6">
              {ALL_CLASSES.map(cls => (
                <button key={cls} onClick={() => {setSelectedClass(cls); setSelectedFeatureId(null);}} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${selectedClass === cls ? 'bg-[#2D235C] text-white' : 'bg-gray-50 text-gray-400'}`}>{cls}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[48px] shadow-xl space-y-4">
                <h3 className="font-bold text-[#2D235C]">Select Category</h3>
                {APP_FEATURES.map(f => (
                  <button key={f.id} onClick={() => setSelectedFeatureId(f.id)} className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${selectedFeatureId === f.id ? 'bg-[#2D235C] text-white shadow-lg' : 'bg-gray-50 text-[#2D235C]'}`}>
                    <span className="font-bold">{f.label}</span>
                    <span className="text-[10px] opacity-60 uppercase font-black">{f.malayalam}</span>
                  </button>
                ))}
              </div>

              <div className="bg-white p-8 rounded-[48px] shadow-xl flex flex-col min-h-[500px]">
                <h3 className="font-bold text-[#2D235C] mb-6">Items Management</h3>
                {selectedFeatureId ? (
                  <div className="space-y-4">
                    <button onClick={addItem} className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold mb-4">+ Add New Button</button>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                      {(classConfigs[selectedClass]?.features?.[selectedFeatureId] || []).map(item => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-[32px] space-y-3">
                          <input type="text" value={item.label} onChange={e => updateItem(item.id, 'label', e.target.value)} placeholder="Label..." className="w-full h-11 px-4 rounded-xl border-none font-bold text-sm shadow-sm" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="PDF URL" value={item.pdf || ''} onChange={e => updateItem(item.id, 'pdf', e.target.value)} className="h-10 px-3 text-[10px] rounded-xl border-none shadow-sm" />
                            <input type="text" placeholder="Video URL" value={item.video || ''} onChange={e => updateItem(item.id, 'video', e.target.value)} className="h-10 px-3 text-[10px] rounded-xl border-none shadow-sm" />
                            <input type="text" placeholder="Audio URL" value={item.audio || ''} onChange={e => updateItem(item.id, 'audio', e.target.value)} className="h-10 px-3 text-[10px] rounded-xl border-none shadow-sm" />
                            <input type="text" placeholder="Image URL" value={item.image || ''} onChange={e => updateItem(item.id, 'image', e.target.value)} className="h-10 px-3 text-[10px] rounded-xl border-none shadow-sm" />
                          </div>
                          <button onClick={() => {
                            const current = classConfigs[selectedClass];
                            const items = current.features[selectedFeatureId!].filter(i => i.id !== item.id);
                            setClassConfigs({ ...classConfigs, [selectedClass]: { ...current, features: { ...current.features, [selectedFeatureId!]: items } } });
                          }} className="w-full py-1 text-[10px] text-red-400 font-bold uppercase tracking-widest">Delete Item</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <div className="flex-1 flex items-center justify-center text-gray-300 font-bold">Select a category on the left</div>}
              </div>
            </div>
            <div className="flex justify-center pt-8">
              <button onClick={saveAllToStorage} disabled={isSaving} className="px-16 py-5 bg-[#FFC107] text-[#2D235C] rounded-full font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">{isSaving ? 'Saving...' : 'Sync to Database'}</button>
            </div>
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="space-y-8 pb-32 max-w-4xl mx-auto w-full">
            {/* Banner Slider Management */}
            <div className="bg-white p-8 rounded-[48px] shadow-xl">
              <h3 className="text-xl font-bold text-[#2D235C] mb-6 flex items-center gap-2">
                <span className="p-2 bg-amber-50 rounded-xl text-amber-500">🖼️</span>
                Home Banner Slider
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Image URL..." 
                    value={newBannerUrl}
                    onChange={e => setNewBannerUrl(e.target.value)}
                    className="flex-1 h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none"
                  />
                  <button onClick={addBanner} className="px-8 bg-[#2D235C] text-white rounded-2xl font-bold">Add</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  {banners.map((url, idx) => (
                    <div key={idx} className="relative aspect-[21/9] rounded-2xl overflow-hidden group border border-gray-100">
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeBanner(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resource Card Covers */}
            <div className="bg-white p-8 rounded-[48px] shadow-xl">
              <h3 className="text-xl font-bold text-[#2D235C] mb-6 flex items-center gap-2">
                <span className="p-2 bg-indigo-50 rounded-xl text-indigo-500">📱</span>
                Resource Card Covers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(appImages).map((key) => {
                  const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={appImages[key as keyof AppImages]} 
                          onChange={e => setAppImages({...appImages, [key]: e.target.value})}
                          placeholder="Image URL..." 
                          className="flex-1 h-12 px-4 bg-gray-50 rounded-2xl text-xs focus:outline-none"
                        />
                        {appImages[key as keyof AppImages] && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                            <img src={appImages[key as keyof AppImages]} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button onClick={saveAllToStorage} disabled={isSaving} className="px-16 py-5 bg-[#FFC107] text-[#2D235C] rounded-full font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">{isSaving ? 'Saving...' : 'Update App Customization'}</button>
            </div>
          </div>
        )}

        {activeTab === 'users' && <div className="text-center py-20 text-gray-400 font-bold">Manage users coming soon...</div>}
      </div>
    </div>
  );
};

export default AdminPanel;
