
import React from 'react';
import { ICONS } from '../constants';

interface KidsZoneProps {
  onSelectSlate?: () => void;
  onSelectAbout?: () => void;
  onSelectSystem?: (id: string) => void;
}

const kidsActivities = [
  { id: 1, title: 'Alphabets', malayalam: 'അക്ഷരങ്ങൾ', color: '#E0F2F1', icon: <ICONS.Alphabet />, textColor: '#00695C', grid: 'col-span-1', systemId: 'alphabets' },
  { id: 2, title: 'Rhymes', malayalam: 'പാട്ടുകൾ', color: '#FFF3E0', icon: <ICONS.Rhymes />, textColor: '#EF6C00', grid: 'col-span-1', systemId: 'rhymes' },
  { id: 3, title: 'Digital Slate', malayalam: 'ഡിജിറ്റൽ സ്ലേറ്റ്', color: '#E1F5FE', icon: <ICONS.Slate />, textColor: '#0288D1', type: 'slate', grid: 'col-span-2' },
  { id: 4, title: 'About App', malayalam: 'അപ്പിനെ കുറിച്ച്', color: '#FCE4EC', icon: <ICONS.Info />, textColor: '#C2185B', type: 'about', grid: 'col-span-2' },
];

const KidsZone: React.FC<KidsZoneProps> = ({ onSelectSlate, onSelectAbout, onSelectSystem }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {kidsActivities.map((act) => (
        <div 
          key={act.id} 
          style={{ backgroundColor: act.color }}
          onClick={() => {
            if (act.systemId) onSelectSystem?.(act.systemId);
            else if (act.type === 'slate') onSelectSlate?.();
            else if (act.type === 'about') onSelectAbout?.();
          }}
          className={`${act.grid} p-6 rounded-[32px] flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm ${act.type ? 'min-h-[140px]' : 'min-h-[160px]'}`}
        >
          <div 
            style={{ color: act.textColor }}
            className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:rotate-6`}
          >
            {React.cloneElement(act.icon as React.ReactElement<any>, { className: act.type === 'about' ? 'w-7 h-7' : 'w-8 h-8' })}
          </div>
          <h4 className="font-bold text-lg mb-0.5" style={{ color: act.textColor }}>{act.title}</h4>
          <p className="text-xs font-medium font-['Noto Sans Malayalam']" style={{ opacity: 0.8, color: act.textColor }}>{act.malayalam}</p>
        </div>
      ))}
    </div>
  );
};

export default KidsZone;
