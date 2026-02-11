
import React, { useState, useRef, useEffect } from 'react';
import { ClassLevel } from '../types';
import { ICONS } from '../constants';

interface ClassPickerProps {
  selected: ClassLevel;
  onSelect: (level: ClassLevel) => void;
}

const classes: ClassLevel[] = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
  'Plus One', 'Plus Two'
];

const ClassPicker: React.FC<ClassPickerProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-16 px-6 glass-card rounded-[24px] flex items-center justify-between group hover:border-[#2D235C33] transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D235C] flex items-center justify-center text-white shadow-lg shadow-[#2D235C33]">
             <ICONS.Academic className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Current Level</p>
            <p className="text-lg font-bold text-[#2D235C]">{selected}</p>
          </div>
        </div>
        <ICONS.ChevronDown className={`w-6 h-6 text-[#2D235C] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-20 left-0 right-0 z-[60] glass-card rounded-[32px] p-4 max-h-[300px] overflow-y-auto custom-scrollbar border border-white/50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-2 gap-2">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onSelect(c);
                  setIsOpen(false);
                }}
                className={`p-4 rounded-2xl text-left font-bold transition-all ${
                  selected === c 
                    ? 'bg-[#2D235C] text-white shadow-md' 
                    : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPicker;
