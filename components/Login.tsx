
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const logoUrl = "https://d1yei2z3i6k35z.cloudfront.net/13101957/698c0ed8a38ea_eaba61fa-e729-44b3-bcb3-99d33eccd551.png";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F5] px-6">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in fade-in duration-700 delay-100">
        <div className="text-center">
          <div className="w-40 h-40 bg-white glass-card rounded-[48px] flex items-center justify-center mx-auto mb-8 p-4 shadow-xl shadow-[#2D235C0a] hover:scale-105 transition-transform duration-500 cursor-pointer">
             <img 
              src={logoUrl} 
              alt="Madrasa Hub Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://photostock.skssf.in/preview/111605.jpg';
              }}
             />
          </div>
          <h1 className="text-3xl font-bold text-[#2D235C] mb-2">Madrasa Hub (EK)</h1>
          <p className="text-gray-500">Welcome back! Please enter your name to begin learning.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full h-16 px-6 bg-white border border-gray-100 rounded-[24px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D235C33] focus:border-[#2D235C] transition-all text-lg font-medium text-[#2D235C] placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-16 bg-[#2D235C] text-white rounded-[24px] font-bold text-lg shadow-xl shadow-[#2D235C33] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
          >
            Get Started
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Login;
