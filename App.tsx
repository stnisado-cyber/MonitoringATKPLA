
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  ArrowDownCircle,
  Menu,
  X,
  Layers,
  Box
} from 'lucide-react';
import UserPortal from './pages/UserPortal';
import AdminDashboard from './pages/AdminDashboard';
import TransactionHistory from './pages/TransactionHistory';
import ManageItems from './pages/ManageItems';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Ambil Barang', icon: <ArrowDownCircle size={18} /> },
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/history', label: 'Riwayat', icon: <History size={18} /> },
    { path: '/manage', label: 'Kelola Stok', icon: <Package size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-4 z-50 px-4 mb-8">
      <div className="max-w-6xl mx-auto glass rounded-[24px] shadow-2xl shadow-indigo-100/50 px-6 py-3 border border-white/40">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all group-hover:scale-105 group-hover:rotate-3">
              <Box className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-800 tracking-tight leading-none">Monitoring ATK PLA</span>
              <span className="text-[10px] text-indigo-500 font-black tracking-widest uppercase mt-1">System v2.0</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-transparent active:border-slate-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 glass rounded-3xl p-4 shadow-2xl border border-white/60 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive(item.path)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'text-slate-600 hover:bg-indigo-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen pb-12 flex flex-col">
        <Navigation />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/" element={<UserPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/manage" element={<ManageItems />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;