import React from 'react';
import ReactDOM from 'react-dom/client';
import { Sun } from 'lucide-react'; // 示例图标

function App() {
  return (
    <div className="p-4 ios-card animate-healing">
      <h1 className="text-2xl font-bold mb-4">干饭宝典</h1>
      <p>治愈系美食记录</p>
      <Sun size={32} color="#6b4f3f" className="mt-4" />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
