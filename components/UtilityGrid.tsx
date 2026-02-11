import React from 'react';
import { ICONS } from '../constants';
import { ClassLevel } from '../types';

interface UtilityGridProps {
  selectedClass?: ClassLevel;
}

const utilities = [
  { id: 'syl', title: 'Syllabus', malayalam: 'സിലബസ്', icon: <ICONS.Syllabus />, color: '#E8EAF6' },
  { id: 'tim', title: 'Timetable', malayalam: 'ടൈംടേബിൾ', icon: <ICONS.Timetable />, color: '#F3E5F5' },
  { id: 'mod', title: 'Model Papers', malayalam: 'മോഡൽ പേപ്പേഴ്സ്', icon: <ICONS.ModelPapers />, color: '#E1F5FE' },
  { id: 'tra', title: 'Translator', malayalam: 'വിവർത്തനം', icon: <ICONS.Translate />, color: '#FFF8E1' },
];

const UtilityGrid: React.FC<UtilityGridProps> = ({ selectedClass }) => {
  const filteredUtilities = utilities.filter(util => {
    if (util.id === 'tra' && selectedClass) {
      // Logic mirrors 'translatedGuide' card visibility
      const restrictedClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Plus Two'];
      return !restrictedClasses.includes(selectedClass);
    }
    return true;
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredUtilities.map((util) => (
        <div 
          key={util.id}
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