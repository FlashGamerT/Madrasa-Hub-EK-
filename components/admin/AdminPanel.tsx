
import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [terminalId, setTerminalId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [images, setImages] = useState({
    videoClasses: "https://picsum.photos/seed/madrasa1/800/400",
    quran: "https://picsum.photos/seed/quran1/800/400"
  });
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

  useEffect(() => {
    const storedUsers = localStorage.getItem('madrasa_hub_users');
    const storedImages = localStorage.getItem('madrasa_hub_images');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedImages) setImages(JSON.parse(storedImages));
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminalId === '198755') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Terminal ID');
    }
  };

  const enrollUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim() && !users.includes(newUserName)) {
      const updated = [...users, newUserName];
      setUsers(updated);
      localStorage.setItem('madrasa_hub_users', JSON.stringify(updated));
      setNewUserName('');
    }
  };

  const deleteUser = (name: string) => {
    const updated = users.filter(u => u !== name);
    setUsers(updated);
    localStorage.setItem('madrasa_hub_users', JSON.stringify(updated));
  };

  const saveSettings = () => {
    localStorage.setItem('madrasa_hub_images', JSON.stringify(images));
    alert('Settings Saved Successfully!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2D235C] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#2D235C11] rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#2D235C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#2D235C]">Admin Portal</h2>
            <p className="text-gray-400 text-sm">Enter Terminal ID to proceed</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password"
              placeholder="••••••"
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#2D235C22]"
            />
            <button className="w-full h-14 bg-[#2D235C] text-white rounded-2xl font-bold">Verify Identity</button>
            <button type="button" onClick={onClose} className="w-full text-gray-400 text-sm py-2">Return to App</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-10">
      <div className="bg-[#2D235C] text-white px-6 pt-12 pb-24 rounded-b-[48px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Control Center</h1>
            <p className="text-indigo-200 text-sm">Terminal ID: 198755 • System Admin</p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-white/10 rounded-2xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-[#2D235C]' : 'text-white/60 hover:text-white'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-white text-[#2D235C]' : 'text-white/60 hover:text-white'}`}
          >
            App Customization
          </button>
        </div>
      </div>

      <div className="px-6 -mt-12 space-y-6">
        {activeTab === 'users' ? (
          <>
            <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-[#2D235C08] border border-gray-50">
              <h3 className="font-bold text-[#2D235C] mb-4">Enroll New Student</h3>
              <form onSubmit={enrollUser} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Student Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="flex-1 h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                />
                <button className="px-6 bg-[#2D235C] text-white rounded-xl font-bold text-sm">Enroll</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-[#2D235C08] border border-gray-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#2D235C]">Student Database</h3>
                <span className="bg-[#2D235C11] text-[#2D235C] text-xs font-bold px-3 py-1 rounded-full">{users.length} Users</span>
              </div>
              <div className="space-y-3">
                {users.length === 0 && <p className="text-gray-400 text-center py-8 italic">No students enrolled yet.</p>}
                {users.map((user) => (
                  <div key={user} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#2D235C] border border-gray-100">
                        {user.charAt(0)}
                      </div>
                      <span className="font-medium text-[#2D235C]">{user}</span>
                    </div>
                    <button onClick={() => deleteUser(user)} className="text-red-400 hover:text-red-600 p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-[#2D235C08] border border-gray-50 space-y-6">
            <div>
              <h3 className="font-bold text-[#2D235C] mb-4">Resource Image Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1 block">Video Classes Image URL</label>
                  <input 
                    type="text"
                    value={images.videoClasses}
                    onChange={(e) => setImages({...images, videoClasses: e.target.value})}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1 block">Holy Quran Image URL</label>
                  <input 
                    type="text"
                    value={images.quran}
                    onChange={(e) => setImages({...images, quran: e.target.value})}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-50">
              <button 
                onClick={saveSettings}
                className="w-full h-14 bg-[#FFC107] text-[#2D235C] rounded-2xl font-bold shadow-lg shadow-[#FFC10733]"
              >
                Update Application Assets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
