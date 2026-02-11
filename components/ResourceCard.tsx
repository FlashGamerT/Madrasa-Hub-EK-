
import React from 'react';

interface ResourceCardProps {
  title: string;
  malayalamTitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  image: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, malayalamTitle, description, icon, color, image }) => {
  return (
    <div className="relative h-56 rounded-[32px] overflow-hidden group shadow-lg cursor-pointer">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute top-4 right-4">
        <div className="w-12 h-12 rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 flex items-center justify-center transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="text-white text-xl font-bold mb-0.5">{title}</h3>
        <p className="text-white/90 text-sm font-medium mb-1 font-['Noto Sans Malayalam']">{malayalamTitle}</p>
        <p className="text-white/60 text-xs line-clamp-1">{description}</p>
      </div>

      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2D235C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
