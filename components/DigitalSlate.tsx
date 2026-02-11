import React, { useRef, useState, useEffect } from 'react';

interface DigitalSlateProps {
  onClose: () => void;
}

const DigitalSlate: React.FC<DigitalSlateProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const colors = ['#ffffff', '#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#000000'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size based on the parent container which has horizontal gaps
    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    };
    
    const timeoutId = setTimeout(resize, 100);
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(timeoutId);
    };
  }, [color, brushSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { offsetX, offsetY } = getPos(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
  };

  const clearSlate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden select-none bg-[#111111]">
      <div className="p-4 bg-black/40 backdrop-blur-md flex justify-between items-center text-white border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">🎨</div>
          <div>
            <h2 className="font-bold">Digital Slate</h2>
            <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Kids Creative Zone</p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform">✕</button>
      </div>

      {/* Drawing Area with Gaps on Left and Right */}
      <div className="flex-1 px-6 py-6 flex items-center justify-center overflow-hidden">
        <div 
          ref={containerRef}
          className="w-full h-full bg-[#1a1a1a] rounded-[32px] border-[10px] border-[#222222] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden cursor-crosshair"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="touch-none w-full h-full block"
          />
        </div>
      </div>

      <div className="p-6 bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] space-y-4 z-10">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brush Size</span>
          <input 
            type="range" min="1" max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-gray-100 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-[#2D235C] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
          />
          <div className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50">
             <div style={{ width: Math.max(2, brushSize), height: Math.max(2, brushSize), backgroundColor: color }} className="rounded-full shadow-sm" />
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {colors.map(c => (
            <button 
              key={c} 
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full flex-shrink-0 transition-all active:scale-90 ${color === c ? 'scale-110 border-4 border-white ring-2 ring-indigo-100 shadow-md' : 'scale-100'}`}
              style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ddd' : 'none' }}
            />
          ))}
          <div className="w-px h-8 bg-gray-100 mx-2 flex-shrink-0"></div>
          <button 
            onClick={clearSlate}
            className="px-6 h-12 bg-red-50 text-red-600 rounded-2xl font-bold text-xs flex-shrink-0 active:scale-95 transition-transform"
          >
            ERASE ALL
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalSlate;