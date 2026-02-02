
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Transaction } from '../types';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  User, 
  Loader2,
  FileText,
  Building2
} from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          atk_items (
            nama_barang,
            satuan
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filterType === 'all' ? true : t.tipe === filterType
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat riwayat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Log Transaksi</h1>
          <p className="text-slate-500 font-medium">Lacak setiap pergerakan barang secara detail.</p>
        </div>
        
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterType === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilterType('masuk')}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterType === 'masuk' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Masuk
          </button>
          <button 
            onClick={() => setFilterType('keluar')}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterType === 'keluar' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Waktu</th>
                <th className="px-8 py-5">Barang</th>
                <th className="px-8 py-5">Departemen</th>
                <th className="px-8 py-5">Volume</th>
                <th className="px-8 py-5">PIC</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{formatDate(t.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-slate-700 text-base">
                      {t.atk_items?.nama_barang || 'Item dihapus'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {t.departemen ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Building2 size={10} /> {t.departemen}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold text-[10px] uppercase">Internal</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1">
                      <span className={`text-lg font-black ${t.tipe === 'masuk' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {t.tipe === 'masuk' ? '+' : '-'}{t.jumlah}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{t.atk_items?.satuan}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      {t.nama_pengambil || 'System'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {t.tipe === 'masuk' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100">
                        RESTOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100">
                        REQUISITION
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center text-slate-300">
                      <FileText size={64} className="mb-4 opacity-10" />
                      <p className="font-black uppercase tracking-widest text-xs">Data transaksi tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
