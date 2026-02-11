import React, { useState, useEffect, useRef } from 'react';
import { ClassLevel } from '../types';
import { supabase, getSetting, saveSetting } from '../lib/supabase';

interface AdminPanelProps {
  onClose: () => void;
}

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

const ALL_CLASSES: ClassLevel[] = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
  'Plus One', 'Plus Two'
];

const APP_FEATURES = [
  { id: 'videoClasses', label: 'Video Classes', malayalam: 'വീഡിയോ ക്ലാസുകൾ' },
  { id: 'quran', label: 'Holy Quran', malayalam: 'വിശുദ്ധ ഖുർആൻ' },
  { id: 'bookGuide', label: 'Book Guide', malayalam: 'പുസ്തക സഹായി' },
  { id: 'translatedGuide', label: 'Translated Guide', malayalam: 'വിവർത്തനം' },
  { id: 'dua', label: 'Dua', malayalam: 'ദുആകൾ' },
  { id: 'toLearn', label: 'To Learn List', malayalam: 'പഠന പട്ടിക' }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [terminalId, setTerminalId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'home' | 'customization'>('home');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('Class 1');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  
  // Storage States
  const [users, setUsers] = useState<string[]>([]);
  const [classConfigs, setClassConfigs] = useState<Record<string, ClassConfig>>({});
  const [banners, setBanners] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editing States
  const [newUserName, setNewUserName] = useState('');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{type: 'pdf' | 'audio' | 'video' | 'image', itemId: string} | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      const [cloudUsers, cloudConfig, cloudBanners] = await Promise.all([
        supabase.from('students').select('name'),
        getSetting('class_config'),
        getSetting('banners')
      ]);

      if (cloudUsers.data) setUsers(cloudUsers.data.map((u: any) => u.name));
      if (cloudConfig) setClassConfigs(cloudConfig);
      if (cloudBanners) setBanners(cloudBanners);
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
        saveSetting('banners', banners)
      ]);
      const usersToUpsert = users.map(name => ({ name }));
      await supabase.from('students').upsert(usersToUpsert, { onConflict: 'name' });
      alert('All changes saved successfully to Supabase!');
    } catch (err) {
      console.error(err);
      alert('Failed to save some changes. Check console.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeatureVisibility = (featureId: string) => {
    const current = classConfigs[selectedClass] || { hiddenFeatures: [], features: {} };
    const isHidden = current.hiddenFeatures.includes(featureId);
    const updatedHidden = isHidden 
      ? current.hiddenFeatures.filter(id => id !== featureId)
      : [...current.hiddenFeatures, featureId];
    
    setClassConfigs({
      ...classConfigs,
      [selectedClass]: { ...current, hiddenFeatures: updatedHidden }
    });
  };

  const addButtonToFeature = () => {
    if (!selectedFeatureId) return;
    const current = classConfigs[selectedClass] || { hiddenFeatures: [], features: {} };
    const featureItems = current.features[selectedFeatureId] || [];
    const newItem: FeatureItem = { id: Date.now().toString(), label: 'New Button' };
    
    setClassConfigs({
      ...classConfigs,
      [selectedClass]: {
        ...current,
        features: { ...current.features, [selectedFeatureId]: [...featureItems, newItem] }
      }
    });
  };

  const updateItem = (itemId: string, field: keyof FeatureItem, value: string) => {
    if (!selectedFeatureId) return;
    const current = classConfigs[selectedClass];
    const updatedItems = current.features[selectedFeatureId].map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );

    setClassConfigs({
      ...classConfigs,
      [selectedClass]: {
        ...current,
        features: { ...current.features, [selectedFeatureId]: updatedItems }
      }
    });
  };

  const deleteItem = (itemId: string) => {
    if (!selectedFeatureId) return;
    const current = classConfigs[selectedClass];
    const updatedItems = current.features[selectedFeatureId].filter(item => item.id !== itemId);
    setClassConfigs({
      ...classConfigs,
      [selectedClass]: {
        ...current,
        features: { ...current.features, [selectedFeatureId]: updatedItems }
      }
    });
  };

  const triggerUpload = (itemId: string, type: 'pdf' | 'audio' | 'video' | 'image') => {
    setUploadTarget({ itemId, type });
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large for database storage (Max 2MB). Please use a URL instead.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateItem(uploadTarget.itemId, uploadTarget.type, result);
      setIsUploading(false);
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
  };

  // Visibility Filter strictly following your request
  const getVisibleFeatures = () => {
    const hardHiddenRules: Record<string, string[]> = {
      'Class 1': ['videoClasses', 'bookGuide', 'translatedGuide'],
      'Class 2': ['videoClasses', 'translatedGuide'],
      'Class 3': ['videoClasses', 'translatedGuide'],
      'Class 4': ['videoClasses', 'translatedGuide'],
      'Plus Two': ['translatedGuide']
    };

    const hardHidden = hardHiddenRules[selectedClass] || [];
    return APP_FEATURES.filter(f => !hardHidden.includes(f.id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2D235C] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95">
          <h2 className="text-2xl font-bold text-[#2D235C] text-center mb-8">Admin Portal</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password" placeholder="••••••" value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none"
            />
            <button className="w-full h-14 bg-[#2D235C] text-white rounded-2xl font-bold hover:bg-[#3D336C]">Verify Identity</button>
            <button type="button" onClick={onClose} className="w-full text-gray-400 text-sm py-2">Return</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredFeatures = getVisibleFeatures();

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-10 flex flex-col">
      <div className="bg-[#2D235C] text-white px-8 pt-10 pb-20 rounded-b-[64px] shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Control Center</h1>
            <p className="text-indigo-200 text-sm opacity-80">Connected to Supabase Cloud</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 p-1.5 bg-white/10 rounded-[32px] backdrop-blur-xl">
          <button onClick={() => setActiveTab('users')} className={`py-4 rounded-3xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-[#2D235C] shadow-lg' : 'text-white/60 hover:text-white'}`}>Users</button>
          <button onClick={() => setActiveTab('home')} className={`py-4 rounded-3xl font-bold text-sm transition-all ${activeTab === 'home' ? 'bg-white text-[#2D235C] shadow-lg' : 'text-white/60 hover:text-white'}`}>Home</button>
          <button onClick={() => setActiveTab('customization')} className={`py-4 rounded-3xl font-bold text-sm transition-all ${activeTab === 'customization' ? 'bg-white text-[#2D235C] shadow-lg' : 'text-white/60 hover:text-white'}`}>Customization</button>
        </div>
      </div>

      <div className="px-8 -mt-10 flex-1 flex flex-col gap-6">
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50">
              <h3 className="text-lg font-bold text-[#2D235C] mb-6">Enroll New Student</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newUserName.trim() && !users.includes(newUserName)) {
                  setUsers([...users, newUserName.trim()]);
                  setNewUserName('');
                }
              }} className="flex gap-4">
                <input type="text" placeholder="Student Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="flex-1 h-14 px-6 bg-gray-50 border border-gray-100 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                <button className="px-10 bg-[#2D235C] text-white rounded-[24px] font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-transform">Enroll</button>
              </form>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#2D235C]">Student Database</h3>
                <span className="text-xs font-bold bg-indigo-50 text-[#2D235C] px-3 py-1 rounded-full">{users.length} Users</span>
              </div>
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u} className="flex justify-between items-center p-6 bg-gray-50 rounded-[28px] group transition-all hover:bg-white hover:shadow-md hover:ring-1 hover:ring-indigo-50">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-[#2D235C] shadow-sm">{u.charAt(0)}</div>
                       <span className="font-bold text-[#2D235C]">{u}</span>
                    </div>
                    <button onClick={async () => {
                      setUsers(users.filter(usr => usr !== u));
                      await supabase.from('students').delete().eq('name', u);
                    }} className="text-red-300 p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pb-24">
            <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-50 flex flex-wrap gap-2">
              {ALL_CLASSES.map(cls => (
                <button 
                  key={cls} onClick={() => {setSelectedClass(cls); setSelectedFeatureId(null);}}
                  className={`px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${selectedClass === cls ? 'bg-[#2D235C] text-white shadow-lg shadow-indigo-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {cls}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
              <div className="bg-white p-8 rounded-[48px] shadow-xl border border-gray-50 flex flex-col">
                <h3 className="text-lg font-bold text-[#2D235C] mb-6">Features Visibility for {selectedClass}</h3>
                <div className="space-y-4 flex-1">
                  {filteredFeatures.map(feat => {
                    const isHidden = (classConfigs[selectedClass]?.hiddenFeatures || []).includes(feat.id);
                    return (
                      <div key={feat.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[32px] hover:bg-white hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => setSelectedFeatureId(feat.id)}
                             className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedFeatureId === feat.id ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white text-indigo-200 hover:text-indigo-400'}`}
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                           </button>
                           <div>
                             <p className="font-bold text-[#2D235C] text-sm">{feat.label}</p>
                             <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{feat.malayalam}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => toggleFeatureVisibility(feat.id)}
                          className={`w-14 h-8 rounded-full transition-all relative ${isHidden ? 'bg-gray-200' : 'bg-emerald-400 shadow-md shadow-emerald-100'}`}
                        >
                          <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isHidden ? 'left-1.5' : 'left-7.5'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[48px] shadow-xl border border-gray-50 flex flex-col">
                <h3 className="text-lg font-bold text-[#2D235C] mb-2">Content Management</h3>
                <p className="text-gray-400 text-xs mb-8">
                  {selectedFeatureId 
                    ? `Managing Custom Buttons for ${APP_FEATURES.find(f => f.id === selectedFeatureId)?.label}` 
                    : "Select a feature icon (pencil) to manage its buttons"}
                </p>

                {selectedFeatureId && filteredFeatures.some(f => f.id === selectedFeatureId) ? (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <button 
                      onClick={addButtonToFeature}
                      className="w-full h-14 bg-indigo-50 text-indigo-600 rounded-[28px] font-bold flex items-center justify-center gap-3 hover:bg-indigo-100 active:scale-95 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                      Add New Button
                    </button>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {(classConfigs[selectedClass]?.features[selectedFeatureId] || []).map(item => (
                        <div key={item.id} className="p-6 bg-gray-50 rounded-[40px] border border-gray-100 space-y-4 animate-in slide-in-from-top-4">
                          <div className="flex justify-between items-center gap-4">
                            <input 
                              type="text" value={item.label} 
                              onChange={e => updateItem(item.id, 'label', e.target.value)}
                              placeholder="Button Label (e.g. Chapter 1)"
                              className="bg-white px-4 h-12 rounded-2xl font-bold text-[#2D235C] border border-transparent focus:border-indigo-200 focus:outline-none w-full shadow-sm"
                            />
                            <button onClick={() => deleteItem(item.id)} className="w-12 h-12 bg-white text-red-300 hover:text-red-500 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: 'pdf', label: 'PDF', icon: '📄' },
                              { key: 'audio', label: 'Audio', icon: '🎵' },
                              { key: 'video', label: 'Video', icon: '🎥' },
                              { key: 'image', label: 'Image', icon: '🖼️' }
                            ].map(media => (
                              <div key={media.key} className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{media.label}</label>
                                <div className="flex gap-1.5">
                                  <input 
                                    type="text" placeholder="URL..." 
                                    value={item[media.key as keyof FeatureItem] || ''} 
                                    onChange={e => updateItem(item.id, media.key as keyof FeatureItem, e.target.value)}
                                    className="flex-1 h-11 px-4 text-[11px] bg-white border border-gray-100 rounded-2xl focus:outline-none shadow-sm"
                                  />
                                  <button 
                                    onClick={() => triggerUpload(item.id, media.key as any)}
                                    className="w-11 h-11 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-indigo-50 active:scale-90 transition-all shadow-sm"
                                  >
                                    {isUploading && uploadTarget?.itemId === item.id && uploadTarget?.type === media.key ? (
                                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <span className="text-sm grayscale opacity-60">{media.icon}</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 mb-6 shadow-sm">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <p className="text-gray-300 font-bold text-sm px-10 text-center leading-relaxed">Select a feature icon (pencil) on the left panel to manage its buttons for this class.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
               <button 
                 onClick={saveAllToStorage}
                 disabled={isSaving}
                 className="px-20 py-5 bg-[#FFC107] text-[#2D235C] rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-amber-200 hover:scale-[1.03] active:scale-95 transition-all ring-4 ring-white disabled:opacity-50 disabled:scale-100"
               >
                 {isSaving ? 'Saving to Cloud...' : 'Save All Changes'}
               </button>
            </div>
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-20">
            <div className="bg-white p-10 rounded-[48px] shadow-xl border border-gray-50">
              <h3 className="text-lg font-bold text-[#2D235C] mb-8">Home Banner Slider</h3>
              <div className="flex gap-4 mb-10">
                <input type="text" placeholder="Paste Image URL..." value={newBannerUrl} onChange={e => setNewBannerUrl(e.target.value)} className="flex-1 h-16 px-6 bg-gray-50 border border-gray-100 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-amber-100" />
                <button onClick={() => {
                   if (!newBannerUrl.trim()) return;
                   setBanners([...banners, newBannerUrl.trim()]);
                   setNewBannerUrl('');
                }} className="px-10 bg-[#2D235C] text-white rounded-[24px] font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-transform">Add Banner</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((b, i) => (
                  <div key={i} className="relative group rounded-[36px] overflow-hidden aspect-[21/9] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
                    <img src={b} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => setBanners(banners.filter((_, idx) => idx !== i))} className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                         <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-6">
               <button 
                 onClick={saveAllToStorage}
                 disabled={isSaving}
                 className="px-20 py-5 bg-[#FFC107] text-[#2D235C] rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-amber-200 hover:scale-[1.03] active:scale-95 transition-all ring-4 ring-white disabled:opacity-50"
               >
                 {isSaving ? 'Syncing...' : 'Save Application Assets'}
               </button>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf,audio/mpeg,video/mp4" />
    </div>
  );
};

export default AdminPanel;