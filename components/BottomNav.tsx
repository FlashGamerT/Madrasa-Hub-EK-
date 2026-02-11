
import React from 'react';
import { Tab } from '../types';
import { ICONS } from '../constants';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: Tab.Home, label: 'Home', icon: ICONS.Home },
    { id: Tab.Academic, label: 'Academic', icon: ICONS.Academic },
    { id: Tab.Kids, label: 'Kids', icon: ICONS.Kids },
    { id: Tab.Profile, label: 'Profile', icon: ICONS.Profile },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] max-w-lg mx-auto">
      <nav className="glass-card px-4 py-3 rounded-[32px] flex items-center justify-between border border-white/50 shadow-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1"
            >
              <div className={`transition-all duration-300 ${
                isActive ? 'mb-1 -translate-y-1' : ''
              }`}>
                <tab.icon className={`w-6 h-6 ${
                  isActive ? 'text-[#2D235C]' : 'text-gray-400'
                }`} />
              </div>
              
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                isActive ? 'opacity-100 scale-100 text-[#2D235C]' : 'opacity-0 scale-50 pointer-events-none text-gray-400'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#FFC107] shadow-lg shadow-[#FFC107CC]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
