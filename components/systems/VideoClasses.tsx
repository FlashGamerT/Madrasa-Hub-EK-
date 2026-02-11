import React, { useState } from 'react';
import { ClassLevel } from '../../types';

interface Lesson {
  id: string;
  title: string;
  subject: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
}

const mockLessons: Record<string, Lesson[]> = {
  'Class 5': [
    { id: '1', title: 'Thahara: The Purity', subject: 'Fiqh', duration: '12:45', thumbnail: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400', videoUrl: '#' },
    { id: '2', title: 'Story of Prophet Ibrahim', subject: 'Thareekh', duration: '18:20', thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400', videoUrl: '#' },
    { id: '3', title: 'Pillars of Iman', subject: 'Aqeedah', duration: '15:10', thumbnail: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=400', videoUrl: '#' },
    { id: '4', title: 'Makhraj of Letters', subject: 'Thajweed', duration: '22:00', thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400', videoUrl: '#' },
  ]
};

const VideoClasses: React.FC<{ selectedClass: ClassLevel, onClose: () => void }> = ({ selectedClass, onClose }) => {
  const [activeSubject, setActiveSubject] = useState('All');
  const lessons = mockLessons[selectedClass] || mockLessons['Class 5'];
  const subjects = ['All', ...Array.from(new Set(lessons.map(l => l.subject)))];

  const filteredLessons = activeSubject === 'All' 
    ? lessons 
    : lessons.filter(l => l.subject === activeSubject);

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] overflow-hidden">
      <div className="p-6 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold">Video Classroom</h2>
          <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">{selectedClass} Academy</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-95 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeSubject === s ? 'bg-[#2D235C] text-white shadow-lg' : 'bg-white text-[#2D235C] border border-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 pb-24">
          {filteredLessons.map(lesson => (
            <div key={lesson.id} className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer border border-gray-50">
              <div className="relative h-48">
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                    <svg className="w-6 h-6 text-[#2D235C] ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                  {lesson.duration}
                </div>
                <div className="absolute top-3 left-3 bg-[#FFC107] text-[#2D235C] text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                  {lesson.subject}
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-[#2D235C] group-hover:text-indigo-600 transition-colors">{lesson.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Lesson {lesson.id} • Watch now to complete your course</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoClasses;