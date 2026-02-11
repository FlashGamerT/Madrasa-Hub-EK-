
import React, { useEffect, useState } from 'react';

const Splash: React.FC = () => {
  const [isExiting, setIsExiting] = useState(false);
  const logoUrl = "https://d1yei2z3i6k35z.cloudfront.net/13101957/698c0ed8a38ea_eaba61fa-e729-44b3-bcb3-99d33eccd551.png";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2500); // Start exit animation slightly before 3s to be smooth
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDF8F5] transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative">
        {/* Decorative Circles */}
        <div className="absolute -inset-8 bg-[#2D235C]/5 rounded-full animate-ping duration-[3s]" />
        <div className="absolute -inset-16 bg-[#FFC107]/5 rounded-full animate-ping duration-[4s]" />
        
        <div className={`w-48 h-48 bg-white glass-card rounded-[56px] flex items-center justify-center p-6 shadow-2xl transition-all duration-700 ${isExiting ? 'scale-75 translate-y-4' : 'scale-100 animate-float'}`}>
          <img 
            src={logoUrl} 
            alt="Madrasa Hub Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://photostock.skssf.in/preview/111605.jpg';
            }}
          />
        </div>
      </div>
      
      <div className={`mt-12 text-center transition-all duration-500 delay-200 ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
        <h1 className="text-2xl font-bold text-[#2D235C] tracking-tight">Madrasa Hub (EK)</h1>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#2D235C] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-bounce" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">Quality Islamic Education</p>
      </div>
    </div>
  );
};

export default Splash;
