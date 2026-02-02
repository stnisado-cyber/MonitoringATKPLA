
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Transaction } from '../types';
import { 
  Calendar, 
  User, 
  Loader2,
  FileText,
  Building2,
  ShieldX
} from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Attempt to join with atk_items. Fallback to simple select if this fails.
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          atk_items (
            nama_barang,
            satuan
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Fallback for cases where foreign keys are not yet configured
        const { data: simpleData, error: simpleError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) throw simpleError;
        setTransactions(simpleData || []);
      } else {
        setTransactions(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(t => 
    filterType === 'all' ? true : t.tipe === filterType
  ) : [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat Riwayat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-10 bg-white rounded-[40px] text-center shadow-xl">
        <ShieldX size={48} className="mx-auto text-red-500 mb-6" />
        <h3 className="text-xl font-black mb-2">Gagal Memuat Riwayat</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={fetchTransactions} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Coba Lagi</button>
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
          {(['all', 'masuk', 'keluar'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterType === type ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {type === 'all' ? 'Semua' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
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
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{formatDate(t.created_at)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-slate-700 text-base">
                      {t.atk_items?.nama_barang || t.nama_barang || 'ID: ' + String(t.item_id).slice(0,8)}
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
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{t.atk_items?.satuan || 'Pcs'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 uppercase text-[10px]">
                        {String(t.nama_pengambil || 'S').charAt(0)}
                      </div>
                      {t.nama_pengambil || 'System'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black ${t.tipe === 'masuk' ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
                      {t.tipe === 'masuk' ? 'RESTOCK' : 'AMBIL'}
                    </span>
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

export default TransactionHistory;
