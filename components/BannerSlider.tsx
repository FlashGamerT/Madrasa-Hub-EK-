import React, { useState, useEffect, useRef } from 'react';

interface BannerSliderProps {
  images: string[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-slide effect
  useEffect(() => {
    if (!Array.isArray(images) || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images?.length]);

  // Handle programmatic scrolling when currentIndex changes
  useEffect(() => {
    const container = scrollRef.current;
    if (container && container.offsetWidth > 0) {
      const targetLeft = currentIndex * container.offsetWidth;
      // Check if current scroll position is already close to target to avoid redundant scrolls
      if (Math.abs(container.scrollLeft - targetLeft) > 5) {
        container.scrollTo({
          left: targetLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Track manual scrolling to update indicators
  const handleScroll = () => {
    const container = scrollRef.current;
    if (container && container.offsetWidth > 0) {
      // Prevent division by zero which causes NaN index
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      if (!isNaN(index) && index !== currentIndex && index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    }
  };

  if (!Array.isArray(images) || images.length === 0) return null;

  return (
    <div className="relative w-full aspect-[21/9] rounded-[32px] overflow-hidden shadow-xl bg-gray-100">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="flex-shrink-0 w-full h-full snap-start">
            <img 
              src={img} 
              alt={`Banner ${idx + 1}`} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=1200&auto=format&fit=crop";
              }}
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
          {images.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/40 backdrop-blur-md'
              }`}
            />
          ))}
        </div>
      )}

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default BannerSlider;