import React from 'react';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  const logoUrl = "https://d1yei2z3i6k35z.cloudfront.net/13101957/698c0ed8a38ea_eaba61fa-e729-44b3-bcb3-99d33eccd551.png";

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] overflow-y-auto">
      <div className="p-6 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold">About Us</h2>
          <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">App Information</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-95 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-white glass-card rounded-[40px] p-4 shadow-xl mb-6">
            <img 
              src={logoUrl} 
              alt="Madrasa Hub Logo" 
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://photostock.skssf.in/preview/111605.jpg'; }}
            />
          </div>
          <h1 className="text-2xl font-bold text-[#2D235C]">Madrasa Hub (EK)</h1>
          <p className="text-gray-400 text-sm mt-1">Version 2.5.0 Gold Edition</p>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[32px] border-amber-100 bg-amber-50/30">
            <h3 className="font-bold text-[#2D235C] mb-2">Our Mission</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              To provide a modern, accessible, and high-quality digital learning environment for Madrasa students worldwide. We bridge the gap between traditional Islamic education and contemporary technology.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4 p-4 bg-white rounded-[24px] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">🎓</div>
              <div>
                <h4 className="font-bold text-[#2D235C] text-sm">Quality Content</h4>
                <p className="text-xs text-gray-400">Curated by top Islamic educators and scholars.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-[24px] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">🛡️</div>
              <div>
                <h4 className="font-bold text-[#2D235C] text-sm">Safe & Secure</h4>
                <p className="text-xs text-gray-400">A controlled environment dedicated solely to learning.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-[24px] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500">🌟</div>
              <div>
                <h4 className="font-bold text-[#2D235C] text-sm">User Friendly</h4>
                <p className="text-xs text-gray-400">Intuitive interface designed for children and parents.</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 pb-12">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Proudly Developed For</p>
            <p className="text-xs font-bold text-gray-400 mt-1">SAMASTHA KERALA ISLAM MATHA VIDYABHYASA BOARD</p>
            <div className="mt-8 flex justify-center gap-4">
               <div className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Support</div>
               <div className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Privacy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;