
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Transaction } from '../types';
import { 
  Calendar, 
  User, 
  Loader2,
  FileText,
  Building2,
  ShieldX,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Table
} from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(t => {
    const matchesType = filterType === 'all' ? true : t.tipe === filterType;
    const query = searchQuery.toLowerCase();
    const itemName = String(t.atk_items?.nama_barang || t.nama_barang || '').toLowerCase();
    const picName = String(t.nama_pengambil || '').toLowerCase();
    const deptName = String(t.departemen || '').toLowerCase();
    const matchesSearch = itemName.includes(query) || picName.includes(query) || deptName.includes(query);
    return matchesType && matchesSearch;
  }) : [];

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

  const handlePrint = () => {
    // Memanggil print secara langsung agar tidak dianggap pop-up blocker
    window.print();
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    if (filteredTransactions.length === 0) return;

    // Persiapkan data CSV
    const headers = ['Waktu', 'Item', 'Departemen', 'Tipe', 'Jumlah', 'Satuan', 'PIC', 'Keterangan'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.created_at),
      t.atk_items?.nama_barang || t.nama_barang || '-',
      t.departemen || 'System',
      t.tipe.toUpperCase(),
      t.jumlah,
      t.atk_items?.satuan || 'Pcs',
      t.nama_pengambil || 'System',
      t.keterangan || '-'
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_atk_pla_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <button type="button" onClick={fetchTransactions} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Log Transaksi</h1>
          <p className="text-slate-500 font-medium no-print">Monitoring pergerakan inventaris secara mendalam.</p>
        </div>
        
        <div className="flex items-center gap-2 no-print relative z-[100]">
          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100 cursor-pointer pointer-events-auto"
          >
            <Table size={16} /> Export Excel (CSV)
          </button>
          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all shadow-lg cursor-pointer pointer-events-auto"
          >
            <Printer size={16} /> Cetak Laporan (PDF)
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl flex flex-col lg:flex-row gap-6 no-print control-panel">
        <div className="relative flex-grow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama barang, pengambil, atau departemen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 min-w-fit">
          <div className="px-3 text-slate-400">
            <Filter size={18} />
          </div>
          {(['all', 'masuk', 'keluar'] as const).map(type => (
            <button 
              type="button"
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {type === 'all' ? 'Semua' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden print-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Waktu & Tanggal</th>
                <th className="px-10 py-6">Item ATK</th>
                <th className="px-10 py-6">Departemen</th>
                <th className="px-10 py-6">Volume</th>
                <th className="px-10 py-6">PIC Pengambil</th>
                <th className="px-10 py-6 text-center">Tipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{formatDate(t.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 text-lg leading-tight">
                        {t.atk_items?.nama_barang || t.nama_barang || 'ID: ' + String(t.item_id).slice(0,8)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.keterangan || 'Tanpa keterangan'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {t.departemen ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Building2 size={12} /> {t.departemen}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold text-[10px] uppercase">Internal System</span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black ${t.tipe === 'masuk' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {t.tipe === 'masuk' ? '+' : '-'}{t.jumlah}
                      </span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.atk_items?.satuan || 'Pcs'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <div className="w-9 h-9 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center font-black uppercase text-xs">
                        {String(t.nama_pengambil || 'S').charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-black">{t.nama_pengambil || 'System'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.1em] uppercase ${t.tipe === 'masuk' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-orange-700 bg-orange-50 border border-orange-100'}`}>
                        {t.tipe === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'}
                      </span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Data transaksi tidak ditemukan</p>
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
