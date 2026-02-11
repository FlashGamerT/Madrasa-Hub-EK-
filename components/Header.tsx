import React from 'react';

interface HeaderProps {
  scrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ scrolled }) => {
  // Using the requested brand logo URL
  const logoUrl = "https://d1yei2z3i6k35z.cloudfront.net/13101957/698c0ed8a38ea_eaba61fa-e729-44b3-bcb3-99d33eccd551.png";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 max-w-2xl mx-auto ${
      scrolled 
        ? 'py-3 bg-white/80 backdrop-blur-lg border-b border-white/30 shadow-sm' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Madrasa Hub (EK)</h1>
          <div className="flex items-center gap-1">
            <p className="text-xl font-bold text-[#2D235C]">Your Digital Madrasa</p>
            <span className="text-xl animate-bounce">👋</span>
          </div>
        </div>
        
        <button className="w-14 h-14 rounded-2xl bg-white border border-white/50 shadow-sm flex items-center justify-center hover:scale-110 transition-transform active:scale-95 overflow-hidden p-1">
           <img 
            src={logoUrl} 
            alt="Madrasa Hub Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to the default SKSSF logo if the provided link is inaccessible
              (e.target as HTMLImageElement).src = 'https://photostock.skssf.in/preview/111605.jpg';
            }}
           />
        </button>
      </div>
    </header>
  );
};

export default Header;