
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
    console.log("AdminDashboard: Initializing...");
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
      
      if (itemsRes.error) {
          // Fix: Access status from the response object, not the error object (PostgrestError does not have status)
          if (itemsRes.status === 401) throw new Error("UNAUTHORIZED_401");
          throw itemsRes.error;
      }
      if (transRes.error) throw transRes.error;
      
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
    } catch (err: any) { 
      console.error('Error fetching admin data:', err);
      setError(err.message === "UNAUTHORIZED_401" ? "Sesi API Kedaluwarsa (401). Hubungi admin sistem." : 'Gagal terhubung ke database.');
    } finally { 
      setLoading(false); 
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const safeTrans = Array.isArray(transactions) ? transactions : [];

  const deptStats: Record<string, number> = safeTrans.reduce((acc: Record<string, number>, curr: Transaction) => {
    const dept = curr?.departemen || 'Umum';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedDepts = Object.entries(deptStats)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const filteredItems = safeItems.filter(item => {
    const name = String(item?.nama_barang || '').toLowerCase();
    const category = String(item?.kategori || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || category.includes(searchQuery.toLowerCase());
  });

  const lowStockItems = safeItems.filter(item => (item?.stok ?? 0) > 0 && (item?.stok ?? 0) < 3);
  const outOfStock = safeItems.filter(item => (item?.stok ?? 0) <= 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">Sinkronisasi Analytics...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-red-100 text-center animate-fade-in">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
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
      {outOfStock.length > 0 && (
        <div className="bg-white border-2 border-red-100 rounded-[32px] p-8 shadow-xl shadow-red-50 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
            <div className="bg-red-500 p-4 rounded-3xl shadow-lg text-white">
              <AlertCircle size={32} />
            </div>
            <div className="flex-grow">
              <h4 className="text-red-900 font-black text-xl tracking-tight">Peringatan: Stok Kosong Terdeteksi</h4>
              <div className="flex flex-wrap gap-2 mt-3">
                {outOfStock.slice(0, 5).map(item => (
                  <span key={item?.id} className="px-3 py-1 bg-red-600 text-white rounded-xl text-[10px] font-black">{item?.nama_barang}</span>
                ))}
                {outOfStock.length > 5 && <span className="text-xs text-red-400 font-bold">+{outOfStock.length - 5} lainnya</span>}
              </div>
            </div>
            <Link to="/manage" className="px-8 py-4 bg-red-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-3 shadow-lg group">
              Update Stok Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <Layers size={12} /> Live Inventory Analytics
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Overview <span className="text-slate-300">Persediaan</span></h1>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl relative overflow-hidden">
             <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-10"><PackageCheck size={120} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Katalog</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-slate-900 leading-none">{safeItems.length}</h3>
              <span className="text-xs font-bold text-slate-400 pb-1">Produk</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 text-orange-50 opacity-20"><TrendingDown size={120} /></div>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-4">Stok Menipis</p>
            <div className="flex items-end gap-3 text-orange-600">
              <h3 className="text-5xl font-black leading-none">{lowStockItems.length}</h3>
              <span className="text-xs font-bold text-orange-400 pb-1 uppercase tracking-widest">Item</span>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 text-white opacity-5"><AlertTriangle size={120} /></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Stok Kosong</p>
            <div className="flex items-end gap-3 text-white">
              <h3 className="text-5xl font-black leading-none">{outOfStock.length}</h3>
              <span className="text-xs font-bold text-slate-500 pb-1 uppercase tracking-widest">Item</span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10"><Trophy size={150} /></div>
          <div className="relative z-10 h-full flex flex-col">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Building2 size={12} /> Top Departemen
            </p>
            <div className="space-y-4 flex-grow">
              {sortedDepts.length > 0 ? sortedDepts.map(([dept, count], idx) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center border border-indigo-400">{idx + 1}</span>
                    <span className="text-xs font-bold truncate max-w-[120px]">{dept}</span>
                  </div>
                  <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded-lg">{count}x</span>
                </div>
              )) : <p className="text-[10px] text-indigo-300 font-bold italic">Belum ada data pengambilan.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <div className="relative">
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
                <tr key={item?.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-lg leading-tight">{item?.nama_barang ?? 'Unknown'}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {String(item?.id ?? '').slice(0,8)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">{item?.kategori ?? 'Umum'}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <span className={`text-2xl font-black ${(item?.stok ?? 0) <= 0 ? 'text-red-600' : (item?.stok ?? 0) < 3 ? 'text-orange-500' : 'text-slate-900'}`}>
                        {item?.stok ?? 0} <span className="text-[10px] text-slate-400 uppercase font-bold ml-1">{item?.satuan ?? 'Pcs'}</span>
                      </span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${(item?.stok ?? 0) <= 0 ? 'w-0' : (item?.stok ?? 0) < 3 ? 'bg-orange-500 w-1/4' : 'bg-indigo-500 w-full'}`} />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      {(item?.stok ?? 0) >= 3 ? <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase">Safe</span> : (item?.stok ?? 0) > 0 ? <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase">Low</span> : <span className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase">Out</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
