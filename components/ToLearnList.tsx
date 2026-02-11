
import React, { useState, useEffect } from 'react';

interface LearnTask {
  id: string;
  subject: string;
  chapter: string;
  date: string;
}

interface ToLearnListProps {
  onClose: () => void;
}

const ToLearnList: React.FC<ToLearnListProps> = ({ onClose }) => {
  const [tasks, setTasks] = useState<LearnTask[]>([]);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('madrasa_to_learn');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !chapter || !date) return;
    const newTask = { id: Date.now().toString(), subject, chapter, date };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem('madrasa_to_learn', JSON.stringify(updated));
    setSubject(''); setChapter(''); setDate('');
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('madrasa_to_learn', JSON.stringify(updated));
  };

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5]">
      <div className="p-6 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[40px] shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">To Learn List</h2>
          <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Study Planner</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <form onSubmit={addTask} className="glass-card p-6 rounded-[32px] space-y-3">
          <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full h-12 px-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D235C11]" />
          <input type="text" placeholder="Chapter / Topic" value={chapter} onChange={e => setChapter(e.target.value)} className="w-full h-12 px-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D235C11]" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D235C11]" />
          <button type="submit" className="w-full h-12 bg-[#FFC107] text-[#2D235C] font-bold rounded-xl shadow-md">Add Task</button>
        </form>

        <div className="space-y-3 pb-10">
          {tasks.length === 0 && <p className="text-center text-gray-400 py-10">No tasks added yet. Start planning!</p>}
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex justify-between items-center group animate-in slide-in-from-left duration-300">
              <div>
                <h4 className="font-bold text-[#2D235C]">{task.subject}</h4>
                <p className="text-sm text-gray-500">{task.chapter}</p>
                <div className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block">{task.date}</div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-red-400 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToLearnList;
