
import React from 'react';
import { ICONS } from '../constants';
import { ClassLevel } from '../types';

interface UtilityGridProps {
  selectedClass?: ClassLevel;
  onSelect?: (id: string) => void;
  variant?: 'compact' | 'large';
}

const utilities = [
  { id: 'syl', title: 'Syllabus', malayalam: 'സിലബസ്', icon: <ICONS.Syllabus />, color: '#E8EAF6', largeColor: '#E0F2F1', textColor: '#00695C' },
  { id: 'tim', title: 'Timetable', malayalam: 'ടൈംടേബിൾ', icon: <ICONS.Timetable />, color: '#F3E5F5', largeColor: '#F3E5F5', textColor: '#8E24AA' },
  { id: 'mod', title: 'Model Papers', malayalam: 'മോഡൽ പേപ്പേഴ്സ്', icon: <ICONS.ModelPapers />, color: '#E1F5FE', largeColor: '#E1F5FE', textColor: '#0288D1' },
  { id: 'tra', title: 'Translator', malayalam: 'വിവർത്തനം', icon: <ICONS.Translate />, color: '#FFF8E1', largeColor: '#FFF3E0', textColor: '#EF6C00', systemId: 'translator' },
];

const UtilityGrid: React.FC<UtilityGridProps> = ({ selectedClass, onSelect, variant = 'compact' }) => {
  const filteredUtilities = utilities.filter(util => {
    if (util.id === 'tra' && selectedClass) {
      const restrictedClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Plus Two'];
      return !restrictedClasses.includes(selectedClass);
    }
    return true;
  });

  if (variant === 'large') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {filteredUtilities.map((util) => (
          <div 
            key={util.id}
            onClick={() => onSelect?.(util.systemId || util.id)}
            style={{ backgroundColor: util.largeColor }}
            className="p-6 rounded-[32px] flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm min-h-[160px] group"
          >
            <div 
              style={{ color: util.textColor }}
              className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:rotate-6"
            >
              {React.cloneElement(util.icon as React.ReactElement<any>, { className: 'w-8 h-8' })}
            </div>
            <h4 className="font-bold text-lg mb-0.5" style={{ color: util.textColor }}>{util.title}</h4>
            <p className="text-xs font-medium font-['Noto Sans Malayalam']" style={{ opacity: 0.8, color: util.textColor }}>{util.malayalam}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredUtilities.map((util) => (
        <div 
          key={util.id}
          onClick={() => onSelect?.(util.systemId || util.id)}
          className="glass-card p-6 rounded-[32px] flex items-center gap-4 transition-all hover:translate-y-[-4px] active:scale-95 cursor-pointer group"
        >
          <div 
            style={{ backgroundColor: util.color }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#2D235C] transition-transform group-hover:rotate-12"
          >
            {React.cloneElement(util.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
          </div>
          <div>
            <h4 className="font-bold text-[#2D235C] text-sm">{util.title}</h4>
            <p className="text-[10px] font-medium text-gray-400 font-['Noto Sans Malayalam'] leading-tight">{util.malayalam}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UtilityGrid;
