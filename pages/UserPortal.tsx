
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { AtkItem } from '../types';
import { Box, Send, Loader2, CheckCircle2, AlertCircle, ShoppingCart, Building2, UserCircle, Search, ChevronDown, Check, Calendar } from 'lucide-react';

const DEPARTEMEN_LIST = [
  "Komisaris",
  "HRGA",
  "Finance & Accounting Tax",
  "Sales & Marketing",
  "Operation",
  "Government Relation",
  "Procurement",
  "Technical",
  "Corporate Communication",
  "Internal Audit",
  "Business Analyst",
  "Corporate Secretary",
  "Legal"
].sort();

const UserPortal: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    nama_pengambil: '',
    departemen: '',
    item_id: '',
    jumlah: 1,
    keterangan: '',
    created_at: getCurrentDate()
  });

  useEffect(() => {
    fetchItems();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('atk_items').select('*').order('nama_barang', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err) { 
      console.error('Supabase Error:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  const selectedItem = items.find(i => String(i.id) === String(formData.item_id));
  
  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const name = String(item.nama_barang || '').toLowerCase();
    const category = String(item.kategori || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || category.includes(query);
  }) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pengambil || !formData.item_id || formData.jumlah <= 0) {
      setMessage({ type: 'error', text: 'Mohon lengkapi formulir.' });
      return;
    }
    
    if (selectedItem && formData.jumlah > (selectedItem.stok || 0)) {
      setMessage({ type: 'error', text: 'Stok tidak mencukupi.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const newStock = (selectedItem?.stok || 0) - formData.jumlah;
      
      const { error: updateError } = await supabase.from('atk_items').update({ stok: newStock }).eq('id', formData.item_id);
      
      if (updateError) {
        if (updateError.code === '42501') {
          throw new Error("Izin Update Stok Ditolak (RLS). Silakan jalankan perintah SQL Policy UPDATE di Dashboard Supabase.");
        }
        throw updateError;
      }

      const now = new Date();
      const [year, month, day] = formData.created_at.split('-').map(Number);
      const transactionDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

      const { error: transError } = await supabase.from('transactions').insert([{
        item_id: formData.item_id,
        jumlah: formData.jumlah,
        tipe: 'keluar',
        nama_pengambil: formData.nama_pengambil,
        departemen: formData.departemen,
        keterangan: formData.keterangan,
        created_at: transactionDate.toISOString() 
      }]);

      if (transError) {
        if (transError.code === '42501') {
          throw new Error("Izin Log Transaksi Ditolak (RLS). Silakan jalankan perintah SQL Policy INSERT di Dashboard Supabase.");
        }
        throw transError;
      }

      setMessage({ type: 'success', text: `Berhasil mencatat pengambilan ${selectedItem?.nama_barang}!` });
      
      setFormData({ 
        ...formData, 
        item_id: '', 
        jumlah: 1, 
        keterangan: '',
        created_at: getCurrentDate()
      });
      setSearchQuery('');
      fetchItems();
    } catch (err: any) {
      console.error('Submit error:', err);
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-6">Menghubungkan Portal...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-2 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="lg:col-span-4 bg-slate-900 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black leading-tight mb-6">Ambil <span className="text-indigo-400">ATK.</span></h1>
            <p className="text-slate-400 text-sm font-medium">Silahkan catat pengambilan barang anda</p>
          </div>
          <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <p className="text-sm font-bold">Logistik PLA</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Mandiri Inventaris</p>
          </div>
        </div>

        <div className="lg:col-span-8 p-10 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
              <div className={`p-5 rounded-[24px] flex items-start gap-4 border ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={24} className="mt-0.5" /> : <AlertCircle size={24} className="mt-0.5" />}
                <div className="flex flex-col">
                  <span className="font-black text-sm uppercase tracking-tight">{message.type === 'success' ? 'Berhasil' : 'Masalah Database'}</span>
                  <p className="text-sm opacity-90 leading-relaxed">{message.text}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Pengambil</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.nama_pengambil}
                    onChange={e => setFormData({ ...formData, nama_pengambil: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="Nama Lengkap"
                  />
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Departemen</label>
                <select
                  required
                  value={formData.departemen}
                  onChange={e => setFormData({ ...formData, departemen: e.target.value })}
                  className="w-full px-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold text-slate-700 appearance-none transition-all"
                >
                  <option value="">Pilih Departemen</option>
                  {DEPARTEMEN_LIST.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tanggal Pengambilan</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.created_at}
                  onChange={e => setFormData({ ...formData, created_at: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              </div>
            </div>

            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Barang</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full pl-12 pr-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer transition-all ${isDropdownOpen ? 'ring-2 ring-indigo-500 bg-white border-transparent' : ''}`}
              >
                <span className={`text-sm font-bold truncate pr-4 ${formData.item_id ? 'text-slate-800' : 'text-slate-400'}`}>
                  {selectedItem ? `${selectedItem.nama_barang} (${selectedItem.stok} ${selectedItem.satuan})` : 'Klik untuk mencari...'}
                </span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                <Box className="absolute left-4 top-[42px] text-slate-300" size={20} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] border border-slate-100 shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-3 border-b bg-slate-50/50">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari nama barang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                    {filteredItems.length > 0 ? filteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if ((item.stok || 0) > 0) {
                            setFormData({ ...formData, item_id: item.id });
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }
                        }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl mb-1 cursor-pointer transition-all ${formData.item_id === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 text-slate-700'} ${(item.stok || 0) <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-black">{item.nama_barang || 'Item'}</span>
                          <span className={`text-[10px] font-bold uppercase ${formData.item_id === item.id ? 'text-indigo-200' : 'text-slate-400'}`}>Tersedia: {item.stok || 0} {item.satuan}</span>
                        </div>
                        {formData.item_id === item.id && <Check size={18} />}
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Barang tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Jumlah Ambil</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.jumlah}
                  onChange={e => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                  className="w-full px-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50 focus:bg-white outline-none font-black text-indigo-600 text-lg transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Satuan Barang</label>
                <div className="px-6 py-4 rounded-[18px] bg-slate-100 text-slate-500 font-black h-[62px] flex items-center uppercase text-xs">
                  {selectedItem?.satuan || '-'}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.item_id}
              className={`w-full py-5 rounded-[24px] font-black text-white text-xs uppercase tracking-widest transition-all ${
                submitting || !formData.item_id ? 'bg-slate-200 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Memproses...
                </div>
              ) : 'Konfirmasi Pengambilan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
