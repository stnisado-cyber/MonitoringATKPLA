
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
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-atk-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atk_items' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, transRes] = await Promise.all([
        supabase.from('atk_items').select('*').order('nama_barang', { ascending: true }),
        supabase.from('transactions').select('*').eq('tipe', 'keluar')
      ]);
      
      if (itemsRes.error) throw itemsRes.error;
      if (transRes.error) throw transRes.error;

      setItems(itemsRes.data || []);
      setTransactions(transRes.data || []);
    } catch (err) { 
      console.error('Error fetching admin data:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Process department rankings
  const deptStats = transactions.reduce((acc: Record<string, number>, curr) => {
    if (curr.departemen) {
      acc[curr.departemen] = (acc[curr.departemen] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedDepts = Object.entries(deptStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filteredItems = items.filter(item => 
    item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.stok > 0 && item.stok < 3);
  const outOfStock = items.filter(item => item.stok === 0);
  const totalUrgent = lowStockItems.length + outOfStock.length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Urgent Warning Banner */}
      {totalUrgent > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce-subtle">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-2xl shadow-lg shadow-red-200 text-white">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-red-900 font-black text-lg">Peringatan Stok Kritis!</h4>
              <p className="text-red-700 text-sm font-medium">Ada {totalUrgent} barang yang sudah habis atau di bawah 3 pcs. Segera lakukan pengadaan.</p>
            </div>
          </div>
          <Link to="/manage" className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-xl shadow-red-100">
            Cek Barang <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <Layers size={12} />
            Inventory Control
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Overview <span className="text-slate-300">Stok</span></h1>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <PackageCheck size={100} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total SKU</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-slate-900 leading-none">{items.length}</h3>
              <span className="text-xs font-bold text-slate-400 pb-1">Produk</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 text-orange-500">
              <TrendingDown size={100} />
            </div>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-4">Menipis (&lt; 3)</p>
            <div className="flex items-end gap-3 text-orange-600">
              <h3 className="text-5xl font-black leading-none">{lowStockItems.length}</h3>
              <span className="text-xs font-bold text-orange-400 pb-1 uppercase tracking-widest">Item</span>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <AlertTriangle size={100} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Habis</p>
            <div className="flex items-end gap-3 text-white">
              <h3 className="text-5xl font-black leading-none">{outOfStock.length}</h3>
              <span className="text-xs font-bold text-slate-500 pb-1 uppercase tracking-widest">Kosong</span>
            </div>
          </div>
        </div>

        {/* Top Departments Widget */}
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
                <div key={dept} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center border border-indigo-400">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[120px]">{dept}</span>
                  </div>
                  <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded-lg">{count}x</span>
                </div>
              )) : (
                <p className="text-[10px] text-indigo-300 font-bold italic">Belum ada data pengambilan.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-6">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Cari item di inventory..."
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
                <th className="px-10 py-6">Item Specification</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Inventory Level</th>
                <th className="px-10 py-6 text-center">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{item.nama_barang}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">REF: {item.id.slice(0,6)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-3 min-w-[180px]">
                      <div className="flex justify-between items-end">
                        <span className={`text-2xl font-black ${item.stok < 3 ? 'text-red-600' : item.stok < 10 ? 'text-orange-500' : 'text-slate-900'}`}>
                          {item.stok} <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1">{item.satuan}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.stok === 0 ? 'w-0' : 
                            item.stok < 3 ? 'bg-red-600 w-[10%]' : 
                            item.stok < 10 ? 'bg-orange-500 w-[40%]' : 'bg-emerald-500 w-[90%]'
                          }`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      {item.stok >= 3 ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Aman
                        </span>
                      ) : item.stok > 0 ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-orange-50 text-orange-600 border border-orange-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                          Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-600 border border-red-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Habis
                        </span>
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
  );
};

export default AdminDashboard;
