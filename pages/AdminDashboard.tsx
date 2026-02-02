
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AtkItem, Transaction } from '../types';
import { 
  AlertTriangle, 
  PackageCheck, 
  Search,
  RefreshCw,
  TrendingDown,
  Layers,
  Building2,
  Trophy,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-atk-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atk_items' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .subscribe();
    
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [itemsRes, transRes] = await Promise.all([
        supabase.from('atk_items').select('*').order('nama_barang', { ascending: true }),
        supabase.from('transactions').select('*').eq('tipe', 'keluar')
      ]);
      
      if (itemsRes.error) throw itemsRes.error;
      
      setItems(itemsRes.data || []);
      setTransactions(transRes.data || []);
    } catch (err: any) { 
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Gagal terhubung ke database.');
    } finally { 
      setLoading(false); 
    }
  };

  const deptStats = Array.isArray(transactions) ? transactions.reduce((acc: Record<string, number>, curr) => {
    const dept = curr.departemen || 'Umum';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {}) : {};

  const sortedDepts = Object.entries(deptStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const name = String(item.nama_barang || '').toLowerCase();
    const category = String(item.kategori || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || category.includes(query);
  }) : [];

  const lowStockItems = Array.isArray(items) ? items.filter(item => (item.stok || 0) > 0 && (item.stok || 0) < 3) : [];
  const outOfStock = Array.isArray(items) ? items.filter(item => (item.stok || 0) <= 0) : [];
  const totalUrgent = lowStockItems.length + outOfStock.length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">Sinkronisasi Database...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-red-100 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-slate-500 font-medium mb-8">{error}</p>
      <button 
        onClick={() => { setLoading(true); fetchData(); }}
        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        Coba Lagi
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Dynamic Urgent Warning Banner */}
      {totalUrgent > 0 ? (
        <div className="bg-white border-2 border-red-100 rounded-[32px] p-8 shadow-xl shadow-red-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
            <div className="bg-red-500 p-4 rounded-3xl shadow-lg shadow-red-200 text-white shrink-0">
              <AlertCircle size={32} />
            </div>
            
            <div className="flex-grow space-y-4">
              <div>
                <h4 className="text-red-900 font-black text-xl tracking-tight">Perhatian: Stok Kritis Terdeteksi</h4>
                <p className="text-red-600/70 text-sm font-bold italic">Segera proses pengadaan barang untuk menjaga operasional.</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {outOfStock.map(item => (
                  <span key={item.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-sm">
                    {item.nama_barang} (HABIS)
                  </span>
                ))}
                {lowStockItems.map(item => (
                  <span key={item.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-xs font-bold">
                    {item.nama_barang} ({item.stok})
                  </span>
                ))}
              </div>
            </div>

            <Link to="/manage" className="shrink-0 px-8 py-4 bg-red-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-3 shadow-lg group">
              Update Stok Sekarang
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <Layers size={12} />
            Live Inventory Analytics
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Overview <span className="text-slate-300">Persediaan</span></h1>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
             <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-10">
              <PackageCheck size={120} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Katalog</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-slate-900 leading-none">{items.length}</h3>
              <span className="text-xs font-bold text-slate-400 pb-1">Produk</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 text-orange-50 opacity-20">
              <TrendingDown size={120} />
            </div>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-4">Stok Menipis</p>
            <div className="flex items-end gap-3 text-orange-600">
              <h3 className="text-5xl font-black leading-none">{lowStockItems.length}</h3>
              <span className="text-xs font-bold text-orange-400 pb-1 uppercase tracking-widest">Item</span>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 text-white opacity-5">
              <AlertTriangle size={120} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Stok Kosong</p>
            <div className="flex items-end gap-3 text-white">
              <h3 className="text-5xl font-black leading-none">{outOfStock.length}</h3>
              <span className="text-xs font-bold text-slate-500 pb-1 uppercase tracking-widest">Item</span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Trophy size={150} />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Building2 size={12} /> Top Departemen
            </p>
            <div className="space-y-4 flex-grow">
              {sortedDepts.length > 0 ? sortedDepts.map(([dept, count], idx) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center border border-indigo-400">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[120px]">{dept}</span>
                  </div>
                  <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded-lg">{count}x</span>
                </div>
              )) : (
                <p className="text-[10px] text-indigo-300 font-bold italic">Menunggu data pengambilan...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROCUREMENT LIST CARD */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden h-fit">
          <div className="p-8 bg-slate-900 text-white">
            <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
              <ClipboardList className="text-indigo-400" /> Daftar Pengadaan
            </h3>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Barang yang harus dibeli</p>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {outOfStock.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageCheck size={32} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Semua Stok Tersedia!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outOfStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100 hover:bg-red-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm leading-tight">{item.nama_barang}</span>
                      <span className="text-[10px] font-bold text-red-500 uppercase mt-1">{item.kategori}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Stok: 0</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MAIN INVENTORY TABLE CARD */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Cari item di katalog..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[24px] focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-50">
                  <th className="px-10 py-6">Barang</th>
                  <th className="px-10 py-6">Kategori</th>
                  <th className="px-10 py-6">Level Stok</th>
                  <th className="px-10 py-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-lg leading-tight">{item.nama_barang || 'Item Tanpa Nama'}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref ID: {String(item.id || '').slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {item.kategori || 'Umum'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <span className={`text-2xl font-black ${(item.stok || 0) <= 0 ? 'text-red-600' : (item.stok || 0) < 3 ? 'text-orange-500' : 'text-slate-900'}`}>
                          {item.stok || 0} <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1">{item.satuan || 'Pcs'}</span>
                        </span>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (item.stok || 0) <= 0 ? 'w-0' : 
                              (item.stok || 0) < 3 ? 'bg-orange-500 w-1/4' : 'bg-indigo-500 w-full'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center">
                        {(item.stok || 0) >= 3 ? (
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100">Safe</span>
                        ) : (item.stok || 0) > 0 ? (
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-orange-50 text-orange-600 border border-orange-100">Low</span>
                        ) : (
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-600 border border-red-100">Out</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
