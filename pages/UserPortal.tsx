
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { AtkItem } from '../types';
import { Box, Send, Loader2, CheckCircle2, AlertCircle, ShoppingCart, Building2, UserCircle, Search, ChevronDown, Check } from 'lucide-react';

const DEPARTEMEN_LIST = [
  "IT",
  "HRD",
  "Produksi",
  "Keuangan",
  "Umum"
].sort();

const UserPortal: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Searchable Item States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    nama_pengambil: '',
    departemen: '',
    item_id: '',
    jumlah: 1,
    keterangan: ''
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

  const selectedItem = items.find(i => i.id === formData.item_id);
  const filteredItems = items.filter(item => 
    item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pengambil || !formData.departemen || !formData.item_id || formData.jumlah <= 0) return;
    
    if (selectedItem && formData.jumlah > selectedItem.stok) {
      setMessage({ type: 'error', text: 'Stok tidak mencukupi untuk permintaan ini.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const newStock = (selectedItem?.stok || 0) - formData.jumlah;
      const { error: updateError } = await supabase.from('atk_items').update({ stok: newStock }).eq('id', formData.item_id);
      // Fix: Use updateError instead of undefined error variable
      if (updateError) throw updateError;

      const { error: transError } = await supabase.from('transactions').insert({
        item_id: formData.item_id,
        jumlah: formData.jumlah,
        tipe: 'keluar',
        nama_pengambil: formData.nama_pengambil,
        departemen: formData.departemen,
        keterangan: formData.keterangan
      });
      if (transError) throw transError;

      setMessage({ type: 'success', text: `Berhasil! ${selectedItem?.nama_barang} dicatat untuk ${formData.nama_pengambil} (${formData.departemen}).` });
      setFormData({ ...formData, item_id: '', jumlah: 1, keterangan: '' });
      setSearchQuery('');
      fetchItems();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal memproses permintaan. Pastikan koneksi stabil.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-6">Loading System...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-2 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
        
        {/* Visual Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Live Portal
            </div>
            <h1 className="text-4xl font-black leading-tight mb-6">Ambil Kebutuhan <span className="text-indigo-400">Kantor.</span></h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Cari dan pilih barang yang Anda butuhkan melalui formulir di samping.
            </p>
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/20 p-3 rounded-2xl">
                <Box className="text-indigo-300" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Monitoring ATK PLA</p>
                <p className="text-xs text-slate-400">Sistem inventarisasi terpusat.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="lg:col-span-8 p-10 sm:p-12 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Form Permintaan</h2>
              <ShoppingCart size={24} className="text-slate-300" />
            </div>

            {message && (
              <div className={`p-4 rounded-[20px] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                <span className="font-bold text-sm leading-tight">{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nama Pengambil</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.nama_pengambil}
                    onChange={e => setFormData({ ...formData, nama_pengambil: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                    placeholder="Nama Lengkap"
                  />
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Departemen</label>
                <div className="relative">
                  <select
                    required
                    value={formData.departemen}
                    onChange={e => setFormData({ ...formData, departemen: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-slate-700 text-sm cursor-pointer"
                  >
                    <option value="">Pilih Departemen</option>
                    {DEPARTEMEN_LIST.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>
            </div>

            {/* Searchable Item Selector */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Cari & Pilih Barang</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full pl-12 pr-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer transition-all hover:border-indigo-300 ${isDropdownOpen ? 'ring-4 ring-indigo-100 border-indigo-500 bg-white' : ''}`}
              >
                <span className={`text-sm font-bold ${formData.item_id ? 'text-slate-800' : 'text-slate-400'}`}>
                  {selectedItem ? `${selectedItem.nama_barang} (${selectedItem.stok} ${selectedItem.satuan})` : 'Klik untuk mencari ATK...'}
                </span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                <Box className="absolute left-4 top-[42px] text-slate-300" size={20} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-slate-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Ketik nama barang..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.stok > 0) {
                              setFormData({ ...formData, item_id: item.id });
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                            }
                          }}
                          className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all mb-1 ${
                            formData.item_id === item.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'hover:bg-indigo-50 text-slate-700'
                          } ${item.stok <= 0 ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-black">{item.nama_barang}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.item_id === item.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {item.kategori} • Tersedia: {item.stok} {item.satuan}
                              </span>
                              {item.stok > 0 && item.stok < 3 && (
                                <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-black rounded uppercase">Stok Menipis</span>
                              )}
                              {item.stok <= 0 && (
                                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase">Habis</span>
                              )}
                            </div>
                          </div>
                          {formData.item_id === item.id && <Check size={18} />}
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Item tidak ditemukan
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Jumlah</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.jumlah}
                  onChange={e => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 0 })}
                  className="w-full px-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-black text-lg text-indigo-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Satuan</label>
                <div className="px-6 py-4 rounded-[18px] bg-slate-100 border border-slate-200 text-slate-500 font-black flex items-center h-[60px] uppercase text-[10px] tracking-widest">
                  {selectedItem?.satuan || 'UNIT'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Keterangan</label>
              <textarea
                value={formData.keterangan}
                onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full px-6 py-4 rounded-[18px] border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all h-24 resize-none font-medium text-slate-700 text-sm"
                placeholder="Misal: Untuk meeting divisi besok..."
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.item_id}
                className={`px-10 py-5 rounded-[24px] font-black text-white text-xs uppercase tracking-[0.2em] transition-all transform active:scale-[0.95] flex items-center justify-center gap-4 shadow-2xl ${
                  submitting || !formData.item_id 
                  ? 'bg-slate-200 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                <span>{submitting ? 'Processing...' : 'Konfirmasi'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
