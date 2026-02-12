
import React, { useState, useEffect } from 'react';
import { ClassLevel } from '../types';
import { supabase, getSetting, saveSetting, uploadFile } from '../lib/supabase';

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

interface ClassConfig {
  hiddenFeatures: string[];
  features: Record<string, FeatureConfig | FeatureItem[]>;
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
  const [showMainMediaEdit, setShowMainMediaEdit] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const [adminPath, setAdminPath] = useState<FeatureItem[]>([]);
  
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

  const getTargetList = (): FeatureItem[] => {
    if (!selectedFeatureId) return [];
    const feature = classConfigs[selectedClass]?.features?.[selectedFeatureId];
    const rootItems = Array.isArray(feature) ? feature : (feature?.items || []);
    
    if (adminPath.length === 0) {
      return rootItems;
    }
    const lastNode = adminPath[adminPath.length - 1];
    return lastNode.children || [];
  };

  const updateTargetList = (newList: FeatureItem[]) => {
    if (!selectedFeatureId) return;
    
    if (adminPath.length === 0) {
      const current = classConfigs[selectedClass] || { hiddenFeatures: [], features: {} };
      const currentFeature = current.features[selectedFeatureId] || { items: [] };
      const featureObj: FeatureConfig = Array.isArray(currentFeature) 
        ? { items: currentFeature } 
        : currentFeature;

      setClassConfigs({
        ...classConfigs,
        [selectedClass]: {
          ...current,
          features: {
            ...current.features,
            [selectedFeatureId]: {
              ...featureObj,
              items: newList
            }
          }
        }
      });
      return;
    }

    const updateRecursive = (items: FeatureItem[], path: FeatureItem[]): FeatureItem[] => {
      const targetId = path[0].id;
      return items.map(item => {
        if (item.id === targetId) {
          if (path.length === 1) {
            return { ...item, children: newList };
          } else {
            return { ...item, children: updateRecursive(item.children || [], path.slice(1)) };
          }
        }
        return item;
      });
    };

    const feature = classConfigs[selectedClass]?.features?.[selectedFeatureId];
    const rootList = Array.isArray(feature) ? feature : (feature?.items || []);
    const updatedRoot = updateRecursive(rootList, adminPath);
    
    const currentConfig = classConfigs[selectedClass];
    const featureVal = currentConfig.features[selectedFeatureId];
    const featureObj: FeatureConfig = Array.isArray(featureVal) 
      ? { items: featureVal } 
      : featureVal;

    setClassConfigs({
      ...classConfigs,
      [selectedClass]: {
        ...currentConfig,
        features: {
          ...currentConfig.features,
          [selectedFeatureId]: {
            ...featureObj,
            items: updatedRoot
          }
        }
      }
    });

    const newPath = [...adminPath];
    newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], children: newList };
    setAdminPath(newPath);
  };

  const updateRootMedia = (field: string, val: string) => {
    if (!selectedFeatureId) return;
    const current = classConfigs[selectedClass] || { hiddenFeatures: [], features: {} };
    const feature = current.features[selectedFeatureId] || { items: [] };
    const featureObj: FeatureConfig = Array.isArray(feature) 
      ? { items: feature } 
      : (feature as FeatureConfig);

    setClassConfigs({
      ...classConfigs,
      [selectedClass]: {
        ...current,
        features: {
          ...current.features,
          [selectedFeatureId]: {
            ...featureObj,
            rootMedia: {
              ...(featureObj.rootMedia || {}),
              [field]: val
            }
          }
        }
      }
    });
  };

  const getRootMedia = () => {
    if (!selectedFeatureId) return {};
    const feature = classConfigs[selectedClass]?.features?.[selectedFeatureId];
    if (!feature || Array.isArray(feature)) return {};
    return feature.rootMedia || {};
  };

  const addItem = () => {
    const list = getTargetList();
    const newItem = { id: Date.now().toString(), label: 'New Resource', children: [] };
    updateTargetList([...list, newItem]);
  };

  const updateItem = (id: string, field: string, val: string) => {
    const list = getTargetList();
    const newList = list.map(i => i.id === id ? { ...i, [field]: val } : i);
    updateTargetList(newList);
  };

  const deleteItem = (id: string) => {
    const list = getTargetList();
    updateTargetList(list.filter(i => i.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string, itemId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uniqueKey = itemId ? `${itemId}-${targetField}` : `root-${targetField}`;
    setUploadingField(uniqueKey);

    try {
      const publicUrl = await uploadFile(file, 'resources');
      if (itemId) {
        updateItem(itemId, targetField, publicUrl);
      } else {
        updateRootMedia(targetField, publicUrl);
      }
    } catch (err: any) {
      console.error("Upload Error Details:", err);
      if (err.message.includes('RLS_ERROR')) {
        setShowSetupGuide(true);
      } else {
        alert(`Upload Failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setUploadingField(null);
    }
  };

  const FileUploadInput = ({ field, itemId }: { field: string, itemId?: string }) => {
    const uniqueKey = itemId ? `${itemId}-${field}` : `root-${field}`;
    const isUploading = uploadingField === uniqueKey;
    
    return (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
        <label className={`cursor-pointer p-1.5 rounded-lg transition-all ${isUploading ? 'bg-gray-100' : 'hover:bg-gray-100 text-[#2D235C]/40 hover:text-[#2D235C]'}`}>
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          <input 
            type="file" 
            className="hidden" 
            disabled={isUploading}
            onChange={(e) => handleFileUpload(e, field, itemId)} 
            accept={field === 'pdf' ? '.pdf' : field === 'video' ? 'video/*' : field === 'audio' ? 'audio/*' : 'image/*'}
          />
        </label>
      </div>
    );
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

  const sqlPolicy = `-- 1. Allow Anyone to View Files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'resources' );

-- 2. Allow Anyone to Upload Files
create policy "Public Insert"
on storage.objects for insert
with check ( bucket_id = 'resources' );`;

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#2D235C] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#2D235C] text-center mb-8">Admin Portal</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="password" placeholder="••••••" value={terminalId} onChange={e => setTerminalId(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#2D235C22]" />
          <button className="w-full h-14 bg-[#2D235C] text-white rounded-2xl font-bold">Verify Identity</button>
          <button type="button" onClick={onClose} className="w-full text-gray-400 text-sm py-2">Return</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-10 flex flex-col">
      {/* RLS Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/10 rounded-2xl">🛡️</div>
                <button onClick={() => setShowSetupGuide(false)} className="text-white/60 hover:text-white">✕</button>
              </div>
              <h2 className="text-2xl font-bold">Fix Storage Policy (RLS)</h2>
              <p className="text-indigo-100 text-sm mt-2">Supabase requires a manual policy update to allow the app to upload files.</p>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-[#2D235C] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">1</span>
                  Copy this SQL Code
                </h3>
                <div className="relative group">
                  <pre className="bg-gray-900 text-indigo-300 p-4 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto">
                    {sqlPolicy}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(sqlPolicy);
                      alert('Copied to clipboard!');
                    }}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-[#2D235C] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">2</span>
                  Paste in Supabase
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Go to your <strong>Supabase Dashboard</strong>, open the <strong>SQL Editor</strong>, paste the code above, and click <strong>Run</strong>. This will instantly enable public uploads for the app.
                </p>
              </div>
              <button 
                onClick={() => setShowSetupGuide(false)}
                className="w-full py-4 bg-[#2D235C] text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 active:scale-95 transition-all"
              >
                I've applied the policy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#2D235C] text-white px-8 pt-8 pb-16 rounded-b-[64px] relative shadow-2xl">
        <div className="absolute top-8 left-8">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7 7-7" />
            </svg>
            Exit to Home
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">Control Center</h1>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 bg-black/20 p-1.5 rounded-[32px] backdrop-blur-xl border border-white/50">
          <button onClick={() => setActiveTab('users')} className={`py-4 rounded-3xl font-bold text-xs transition-all ${activeTab === 'users' ? 'bg-white text-[#2D235C] shadow-lg shadow-black/10' : 'text-white/60 hover:text-white/80'}`}>Users</button>
          <button onClick={() => setActiveTab('home')} className={`py-4 rounded-3xl font-bold text-xs transition-all ${activeTab === 'home' ? 'bg-white text-[#2D235C] shadow-lg shadow-black/10' : 'text-white/60 hover:text-white/80'}`}>Resources</button>
          <button onClick={() => setActiveTab('customization')} className={`py-4 rounded-3xl font-bold text-xs transition-all ${activeTab === 'customization' ? 'bg-white text-[#2D235C] shadow-lg shadow-black/10' : 'text-white/60 hover:text-white/80'}`}>Customization</button>
        </div>
      </div>

      <div className="px-8 mt-12 flex-1">
        {activeTab === 'home' && (
          <div className="space-y-6 pb-20">
            <div className="bg-white p-3 rounded-[32px] shadow-xl flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar border border-white/50">
              {ALL_CLASSES.map(cls => (
                <button 
                  key={cls} 
                  onClick={() => {setSelectedClass(cls); setSelectedFeatureId(null); setAdminPath([]); setShowMainMediaEdit(false);}} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedClass === cls ? 'bg-[#2D235C] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {cls}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="bg-white p-8 rounded-[48px] shadow-xl border border-white/50">
                <h3 className="font-bold text-[#2D235C] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#2D235C11] flex items-center justify-center text-[#2D235C] text-xs">📁</span>
                  Select Category
                </h3>
                <div className="space-y-3">
                  {APP_FEATURES.filter(f => {
                    const hiddenMap: Record<string, string[]> = {
                      'Class 1': ['videoClasses', 'bookGuide', 'translatedGuide'],
                      'Class 2': ['videoClasses', 'translatedGuide'],
                      'Class 3': ['videoClasses', 'translatedGuide'],
                      'Class 4': ['videoClasses', 'translatedGuide'],
                      'Plus Two': ['translatedGuide']
                    };
                    return !(hiddenMap[selectedClass] || []).includes(f.id);
                  }).map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => {setSelectedFeatureId(f.id); setAdminPath([]); setShowMainMediaEdit(false);}} 
                      className={`w-full p-5 rounded-[24px] flex justify-between items-center transition-all group ${selectedFeatureId === f.id ? 'bg-[#2D235C] text-white shadow-xl shadow-[#2D235C33]' : 'bg-gray-50 text-[#2D235C] hover:bg-gray-100'}`}
                    >
                      <span className="font-bold">{f.label}</span>
                      <span className={`text-[10px] uppercase font-black tracking-widest ${selectedFeatureId === f.id ? 'opacity-60' : 'text-gray-400'}`}>{f.malayalam}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[48px] shadow-xl border border-white/50 min-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-[#2D235C] flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-[#2D235C11] flex items-center justify-center text-[#2D235C] text-xs">🛠️</span>
                     {adminPath.length > 0 ? (
                       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-sm">
                         <button onClick={() => setAdminPath([])} className="text-gray-400 hover:text-indigo-600 font-bold transition-colors">Root</button>
                         {adminPath.map((node, i) => (
                           <React.Fragment key={node.id}>
                             <span className="text-gray-200">/</span>
                             <button onClick={() => setAdminPath(adminPath.slice(0, i + 1))} className={i === adminPath.length - 1 ? 'text-indigo-600 font-black' : 'text-gray-400 font-bold'}>{node.label}</button>
                           </React.Fragment>
                         ))}
                       </div>
                     ) : 'Resources Management'}
                   </h3>
                   {adminPath.length > 0 && (
                     <button onClick={() => setAdminPath(adminPath.slice(0, -1))} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase text-gray-400 tracking-widest border border-gray-100">Back</button>
                   )}
                </div>

                {selectedFeatureId ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <button 
                        onClick={addItem} 
                        className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all border-2 border-dashed border-indigo-200"
                      >
                        + Add Item Here
                      </button>
                      <button 
                        onClick={() => setShowMainMediaEdit(!showMainMediaEdit)} 
                        className={`w-full py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all border-2 border-dashed ${showMainMediaEdit ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-amber-50 text-amber-600 border-amber-200'}`}
                      >
                        {showMainMediaEdit ? 'Hide Main File Editor' : 'Add File To Main Button'}
                      </button>
                    </div>

                    {showMainMediaEdit && (
                      <div className="p-6 bg-amber-50/50 rounded-[40px] space-y-5 border border-amber-100 shadow-sm animate-in fade-in duration-300 mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest">Main Media for {APP_FEATURES.find(f => f.id === selectedFeatureId)?.label}</h4>
                          <span className="text-[8px] bg-amber-100 text-amber-600 px-2 py-1 rounded-full uppercase font-black">No Label Needed</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">PDF URL</label>
                            <div className="relative">
                              <input type="text" placeholder="URL" value={getRootMedia().pdf || ''} onChange={e => updateRootMedia('pdf', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-amber-200" />
                              <FileUploadInput field="pdf" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Video URL</label>
                            <div className="relative">
                              <input type="text" placeholder="URL" value={getRootMedia().video || ''} onChange={e => updateRootMedia('video', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-amber-200" />
                              <FileUploadInput field="video" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Audio URL</label>
                            <div className="relative">
                              <input type="text" placeholder="URL" value={getRootMedia().audio || ''} onChange={e => updateRootMedia('audio', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-amber-200" />
                              <FileUploadInput field="audio" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Cover Image</label>
                            <div className="relative">
                              <input type="text" placeholder="URL" value={getRootMedia().image || ''} onChange={e => updateRootMedia('image', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-amber-200" />
                              <FileUploadInput field="image" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
                      {getTargetList().map(item => (
                        <div key={item.id} className="p-6 bg-gray-50 rounded-[40px] space-y-5 border border-white shadow-sm hover:shadow-md transition-all">
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              value={item.label} 
                              onChange={e => updateItem(item.id, 'label', e.target.value)} 
                              placeholder="Label..." 
                              className="flex-1 h-14 px-6 rounded-2xl border-none font-bold text-sm shadow-inner bg-white focus:ring-2 focus:ring-[#2D235C22]" 
                            />
                            <button 
                              onClick={() => setAdminPath([...adminPath, item])} 
                              className="px-6 bg-[#2D235C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#2D235C33] active:scale-95 transition-all"
                            >
                              Manage Subs
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">PDF URL</label>
                              <div className="relative">
                                <input type="text" placeholder="URL" value={item.pdf || ''} onChange={e => updateItem(item.id, 'pdf', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-indigo-200" />
                                <FileUploadInput field="pdf" itemId={item.id} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Video URL</label>
                              <div className="relative">
                                <input type="text" placeholder="URL" value={item.video || ''} onChange={e => updateItem(item.id, 'video', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-indigo-200" />
                                <FileUploadInput field="video" itemId={item.id} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Audio URL</label>
                              <div className="relative">
                                <input type="text" placeholder="URL" value={item.audio || ''} onChange={e => updateItem(item.id, 'audio', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-indigo-200" />
                                <FileUploadInput field="audio" itemId={item.id} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image</label>
                              <div className="relative">
                                <input type="text" placeholder="URL" value={item.image || ''} onChange={e => updateItem(item.id, 'image', e.target.value)} className="w-full h-11 pl-4 pr-10 text-xs rounded-xl border-none shadow-inner bg-white focus:ring-1 focus:ring-indigo-200" />
                                <FileUploadInput field="image" itemId={item.id} />
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => deleteItem(item.id)} 
                            className="w-full py-2 text-[10px] text-red-400 font-black uppercase tracking-widest hover:text-red-600 transition-colors border-t border-white pt-4 mt-2"
                          >
                            Delete This Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl">📚</div>
                    <p className="font-bold text-center">Select a category on the left<br/><span className="text-xs font-normal opacity-60">to begin editing resources</span></p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center pt-8">
              <button onClick={saveAllToStorage} disabled={isSaving} className="px-16 py-6 bg-[#FFC107] text-[#2D235C] rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-[#FFD54F]">{isSaving ? 'Syncing...' : 'Save to Cloud'}</button>
            </div>
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="space-y-8 pb-32 max-w-4xl mx-auto w-full">
            <div className="bg-white p-10 rounded-[48px] shadow-xl border border-white/50">
              <h3 className="text-xl font-black text-[#2D235C] mb-8 flex items-center gap-3">
                <span className="p-3 bg-amber-50 rounded-2xl text-amber-500">🖼️</span>
                Banner Slider Configuration
              </h3>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Paste Image URL here..." 
                    value={newBannerUrl}
                    onChange={e => setNewBannerUrl(e.target.value)}
                    className="flex-1 h-16 px-6 bg-gray-50 border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-[#FFC10722] transition-all font-medium"
                  />
                  <button onClick={addBanner} className="px-10 bg-[#2D235C] text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-[#2D235C22] active:scale-95 transition-all">Add</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  {banners.map((url, idx) => (
                    <div key={idx} className="relative aspect-[21/9] rounded-[32px] overflow-hidden group border-4 border-white shadow-lg bg-gray-50">
                      <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => removeBanner(idx)}
                          className="w-14 h-14 bg-red-500 text-white rounded-full shadow-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all active:scale-90"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] shadow-xl border border-white/50">
              <h3 className="text-xl font-black text-[#2D235C] mb-8 flex items-center gap-3">
                <span className="p-3 bg-indigo-50 rounded-2xl text-indigo-500">📱</span>
                App Interface Imagery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.keys(appImages).map((key) => {
                  const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                  return (
                    <div key={key} className="space-y-3 p-4 bg-gray-50 rounded-[32px] border border-gray-100">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={(appImages as any)[key]} 
                          onChange={e => setAppImages({...appImages, [key]: e.target.value})}
                          placeholder="Image URL..." 
                          className="flex-1 h-14 px-4 bg-white rounded-2xl text-xs focus:ring-1 focus:ring-indigo-100 shadow-inner"
                        />
                        {(appImages as any)[key] && (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                            <img src={(appImages as any)[key]} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-indigo-50 p-10 rounded-[48px] border border-indigo-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">🛠️</div>
                <div>
                  <h3 className="text-xl font-black text-indigo-900">Storage Setup Guide</h3>
                  <p className="text-indigo-600 text-sm font-medium">Configure Supabase for public uploads</p>
                </div>
              </div>
              <p className="text-sm text-indigo-800/70 mb-8 leading-relaxed">
                If you encounter "Row-Level Security" errors when uploading files, you need to apply a storage policy in your Supabase dashboard.
              </p>
              <button 
                onClick={() => setShowSetupGuide(true)}
                className="w-full py-5 bg-white text-indigo-600 border-2 border-indigo-200 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-sm"
              >
                View SQL Setup Steps
              </button>
            </div>

            <div className="flex justify-center pt-8">
              <button onClick={saveAllToStorage} disabled={isSaving} className="px-16 py-6 bg-[#FFC107] text-[#2D235C] rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-[#FFD54F]">{isSaving ? 'Syncing...' : 'Publish Branding Updates'}</button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="max-w-2xl mx-auto py-20 bg-white rounded-[48px] shadow-xl border border-white/50 text-center flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl">👥</div>
            <div>
              <h3 className="text-xl font-bold text-[#2D235C]">User Management Coming Soon</h3>
              <p className="text-gray-400 mt-2">We are currently integrating cloud student databases.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
