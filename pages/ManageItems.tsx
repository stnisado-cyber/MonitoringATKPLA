
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AtkItem } from '../types';
import { 
  Plus, 
  Package, 
  Trash2, 
  PlusCircle, 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Info,
  Zap,
  TriangleAlert
} from 'lucide-react';

const SATUAN_OPTIONS = ["Pcs", "Rim", "Pack", "Box", "Set"];

// Data yang diberikan oleh user
const MASTER_DATA_AWAL = [
  { nama: "Business File 940 A4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Business File 940 F4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Pocket File A4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Pocket File F4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Map Cokelat A4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Map Coklat A3", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Clear Holder F4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Clear Holder A4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Clear Holder Warna", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Map Tali Bening", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Smart Pocket", kat: "Map & Folder", sat: "Pack" },
  { nama: "Sampul Plastik Kecil", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Sampul Plastik Gede", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Bc No. 300", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Bc No. 105", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Bc No 111", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Bc No. 107", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Bc No. 200", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Bc No. 260", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Isi Staples No. 03", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Isi Staples No. 10", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Pulpen Kenko 0.5 Mm", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Paperline Panjang", kat: "Kertas & Buku", sat: "Pcs" },
  { nama: "Paperline Besar", kat: "Kertas & Buku", sat: "Pcs" },
  { nama: "Kertas Buffalow Biru", kat: "Kertas & Buku", sat: "Pack" },
  { nama: "Amplop Putih 110 Pps", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Amplop Putih 90 Pps", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Amlpol Coklat Uang", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Bantex A4", kat: "Map & Folder", sat: "Pcs" },
  { nama: "Tinta Canon Hitam", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Stabilo Kuning", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Serutan Joyko", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Plastic Material", kat: "Lain-lain", sat: "Pcs" },
  { nama: "Penghapus Putih", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Penghapus Hitam", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Sign Here", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Cutter A-300al", kat: "Peralatan Kantor", sat: "Pcs" },
  { nama: "Isi Pisau Cutter A-100", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Penhubung Tipe-C", kat: "Elektronik", sat: "Pcs" },
  { nama: "Tipe X", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Correction Tape", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Kreket Putih", kat: "Lain-lain", sat: "Pcs" },
  { nama: "Stikynote Besar Kuning", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Stikynote Besar Pink", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Snowman Marker Permanent Black", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Snowman Marker Permanent Red", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Snowman Marker Wb", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Snowman Pen Red", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Snowman Pen Biru", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Pensil Steadler", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Pulpen Kenko K-1 Blue", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Pulpen Kenko K-1 Black", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Snowman Pen Black", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Trigonal Clip O3", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Tinta Canon Yellow", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Tinta Brother Black", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Tinta Brother Kuning", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Tinta Brother Magenta", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Tinta Brother Biru", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Batere Alkali A2", kat: "Elektronik", sat: "Pack" },
  { nama: "Lakban Cokelat Besar", kat: "Peralatan Kantor", sat: "Pcs" },
  { nama: "Lakban Putih Besar", kat: "Peralatan Kantor", sat: "Pcs" },
  { nama: "Tinta Canon Red", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Solatip Sedang", kat: "Peralatan Kantor", sat: "Pcs" },
  { nama: "Tom Nd Jerry No 112", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Tom Nd Jerry No 107", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Batere Alkali A3", kat: "Elektronik", sat: "Pack" },
  { nama: "Kopi Capsule", kat: "Pantry & Kebersihan", sat: "Box" },
  { nama: "Canon Catridge 3 Colour", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Mouse Mytech", kat: "Elektronik", sat: "Pcs" },
  { nama: "Mouse Logitech", kat: "Elektronik", sat: "Pcs" },
  { nama: "Tinta Epson Red", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Tip X Cair", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Gunting", kat: "Peralatan Kantor", sat: "Pcs" },
  { nama: "Post It", kat: "Alat Tulis", sat: "Pack" },
  { nama: "Tinta Epson Black", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Penggaris 30 Cm", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Penggaris 20 Cm", kat: "Alat Tulis", sat: "Pcs" },
  { nama: "Lem Stick", kat: "Peralatan Kantor", sat: "Pcs" },
  { nama: "Tinta Epson Yellow", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Tinta Epson Blue", kat: "Tinta & Toner", sat: "Pcs" },
  { nama: "Stopkontak", kat: "Elektronik", sat: "Pcs" },
  { nama: "Tissue", kat: "Pantry & Kebersihan", sat: "Pack" },
  { nama: "Flashdisk", kat: "Elektronik", sat: "Pcs" },
  { nama: "Buku Kecil", kat: "Kertas & Buku", sat: "Pcs" },
  { nama: "Hvs", kat: "Kertas & Buku", sat: "Rim" },
  { nama: "Amplop Tali", kat: "Peralatan Kantor", sat: "Pack" },
  { nama: "Hakter", kat: "Peralatan Kantor", sat: "Pcs" }
];

const ManageItems: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AtkItem | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    nama_barang: '',
    kategori: 'Alat Tulis',
    satuan: 'Pcs',
    stok: 0
  });

  const [bulkData, setBulkData] = useState('');

  const [stockUpdate, setStockUpdate] = useState({
    amount: 1,
    note: 'Pengisian stok rutin'
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('atk_items')
        .select('*')
        .order('nama_barang', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSync = async () => {
    if (!confirm(`Apakah Anda yakin ingin memasukkan ${MASTER_DATA_AWAL.length} item baru ke sistem?`)) return;
    setIsProcessing(true);
    try {
      const dataToInsert = MASTER_DATA_AWAL.map(d => ({
        nama_barang: d.nama,
        kategori: d.kat,
        satuan: d.sat,
        stok: 0
      }));

      const { error } = await supabase.from('atk_items').insert(dataToInsert);
      if (error) throw error;

      setStatus({ type: 'success', text: 'Semua data master berhasil disinkronkan!' });
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: 'Gagal sinkronisasi: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('atk_items')
        .insert(newItem)
        .select();

      if (error) throw error;

      if (newItem.stok > 0 && data?.[0]) {
        await supabase.from('transactions').insert({
          item_id: data[0].id,
          jumlah: newItem.stok,
          tipe: 'masuk',
          nama_pengambil: 'Admin',
          keterangan: 'Stok awal barang baru'
        });
      }

      setStatus({ type: 'success', text: 'Barang baru berhasil ditambahkan.' });
      setNewItem({ nama_barang: '', kategori: 'Alat Tulis', satuan: 'Pcs', stok: 0 });
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  const handleBulkImport = async () => {
    if (!bulkData.trim()) return;
    setIsProcessing(true);
    setStatus(null);

    const lines = bulkData.trim().split('\n');
    const parsedData = lines.map(line => {
      const [nama, stok, kategori, satuan] = line.split(',').map(s => s.trim());
      return {
        nama_barang: nama,
        stok: parseInt(stok) || 0,
        kategori: kategori || 'Umum',
        satuan: satuan || 'Pcs'
      };
    }).filter(item => item.nama_barang);

    if (parsedData.length === 0) {
      setStatus({ type: 'error', text: 'Format data tidak valid.' });
      setIsProcessing(false);
      return;
    }

    try {
      const { data: insertedItems, error: itemError } = await supabase
        .from('atk_items')
        .insert(parsedData)
        .select();

      if (itemError) throw itemError;

      if (insertedItems) {
        const transactions = insertedItems
          .filter(item => item.stok > 0)
          .map(item => ({
            item_id: item.id,
            jumlah: item.stok,
            tipe: 'masuk',
            nama_pengambil: 'Admin',
            keterangan: 'Import massal stok awal'
          }));

        if (transactions.length > 0) {
          await supabase.from('transactions').insert(transactions);
        }
      }

      setStatus({ type: 'success', text: `Berhasil mengimport ${parsedData.length} item.` });
      setBulkData('');
      setIsBulkModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: 'Gagal import data: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const newStock = selectedItem.stok + stockUpdate.amount;
      const { error: updateError } = await supabase
        .from('atk_items')
        .update({ stok: newStock })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      const { error: transError } = await supabase.from('transactions').insert({
        item_id: selectedItem.id,
        jumlah: stockUpdate.amount,
        tipe: 'masuk',
        nama_pengambil: 'Admin',
        keterangan: stockUpdate.note
      });

      if (transError) throw transError;

      setStatus({ type: 'success', text: `Stok ${selectedItem.nama_barang} berhasil ditambahkan.` });
      setIsStockModalOpen(false);
      setStockUpdate({ amount: 1, note: 'Pengisian stok rutin' });
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Hapus barang ini? Riwayat transaksi akan tetap ada.')) return;
    try {
      const { error } = await supabase.from('atk_items').delete().eq('id', id);
      if (error) throw error;
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kelola Inventory</h1>
          <p className="text-slate-500 font-medium">Tambah barang baru atau perbarui ketersediaan stok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleInitialSync}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 shadow-xl shadow-violet-100 transition-all font-bold text-sm"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            Sinkronisasi Data Master
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all font-bold text-sm shadow-sm"
          >
            <FileSpreadsheet size={20} /> Bulk Import
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all font-bold text-sm"
          >
            <Plus size={20} /> Tambah Item
          </button>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{status.text}</span>
          </div>
          <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Item List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Syncing database...</p>
          </div>
        ) : items.map(item => {
          const isLow = item.stok > 0 && item.stok < 3;
          const isOut = item.stok === 0;

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden ${
                isOut ? 'border-red-200 ring-2 ring-red-50' : isLow ? 'border-orange-200 ring-2 ring-orange-50' : 'border-slate-100'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl transition-all ${
                    isOut ? 'bg-red-50 text-red-500' : isLow ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                  }`}>
                    {isOut || isLow ? <TriangleAlert size={24} className="animate-pulse" /> : <Package size={24} />}
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{item.nama_barang}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{item.kategori}</p>
                  </div>
                  {isOut && <span className="px-2 py-1 bg-red-600 text-white text-[8px] font-black rounded uppercase">Habis</span>}
                  {isLow && <span className="px-2 py-1 bg-orange-500 text-white text-[8px] font-black rounded uppercase">Kritis</span>}
                </div>
                
                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Stock Level</p>
                    <p className={`text-2xl font-black ${isOut ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-slate-900'}`}>
                      {item.stok} <span className="text-[10px] font-black text-slate-400 uppercase ml-1">{item.satuan}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedItem(item); setIsStockModalOpen(true); }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-wider ${
                      isOut ? 'bg-red-600 text-white hover:bg-red-700' : isLow ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <PlusCircle size={16} /> Update
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] py-20 text-center">
            <Package size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-black text-slate-300 uppercase tracking-[0.2em] text-xs">Inventory is empty</p>
          </div>
        )}
      </div>

      {/* Modal Bulk Import */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="bg-slate-900 p-10 flex justify-between items-center text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <FileSpreadsheet className="text-indigo-400" /> Bulk Import
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Masukkan data dalam jumlah besar sekaligus.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="hover:rotate-90 transition-transform p-2 bg-white/5 rounded-xl hover:bg-white/10"><X size={24}/></button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4">
                <Info className="text-indigo-600 shrink-0" size={20} />
                <div className="text-xs font-bold text-indigo-700 leading-relaxed">
                  Format: <span className="text-indigo-900 underline decoration-indigo-300">Nama Barang, Stok, Kategori, Satuan</span><br/>
                  Contoh: <span className="italic opacity-80 font-medium">Kertas A4, 100, Kertas, Rim</span><br/>
                  (Gunakan satu baris untuk satu barang)
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Daftar Barang (Paste dari Excel/CSV)</label>
                <textarea
                  value={bulkData}
                  onChange={e => setBulkData(e.target.value)}
                  placeholder="Kertas A4, 50, Kertas, Rim&#10;Pulpen Pilot, 144, Alat Tulis, Pcs&#10;Buku Sinar Dunia, 20, Buku, Pack"
                  className="w-full h-64 px-6 py-5 border border-slate-200 rounded-[24px] bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-mono text-sm resize-none custom-scrollbar"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 py-4.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleBulkImport}
                  disabled={isProcessing || !bulkData.trim()}
                  className={`flex-[2] py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${
                    isProcessing || !bulkData.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  {isProcessing ? 'Memproses...' : `Import ${bulkData.trim().split('\n').filter(l => l.trim()).length} Item`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Item (Single) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-black tracking-tight">Barang Baru</h2>
                <p className="text-slate-400 text-xs font-bold mt-1">Daftarkan item ke katalog sistem.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateItem} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Barang</label>
                <input required value={newItem.nama_barang} onChange={e => setNewItem({...newItem, nama_barang: e.target.value})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-sm" placeholder="Misal: Kertas A4 80gr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategori</label>
                  <select value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm appearance-none">
                    <option>Alat Tulis</option>
                    <option>Kertas & Buku</option>
                    <option>Peralatan Kantor</option>
                    <option>Kebersihan</option>
                    <option>Lain-lain</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Satuan</label>
                  <select required value={newItem.satuan} onChange={e => setNewItem({...newItem, satuan: e.target.value})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm appearance-none">
                    {SATUAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stok Awal</label>
                <input type="number" min="0" required value={newItem.stok} onChange={e => setNewItem({...newItem, stok: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-lg text-indigo-600" />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-100 transition-all active:scale-[0.98]">Simpan Katalog</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Stok (Existing) */}
      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`p-8 flex justify-between items-center text-white ${selectedItem.stok < 3 ? 'bg-red-600' : 'bg-indigo-600'}`}>
              <div>
                <h2 className="text-xl font-black tracking-tight">Refill Inventory</h2>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mt-1">{selectedItem.nama_barang}</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddStock} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Jumlah Tambahan ({selectedItem.satuan})</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  autoFocus
                  value={stockUpdate.amount} 
                  onChange={e => setStockUpdate({...stockUpdate, amount: parseInt(e.target.value) || 0})} 
                  className={`w-full px-5 py-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-black text-2xl ${selectedItem.stok < 3 ? 'text-red-600' : 'text-indigo-600'}`} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Catatan/Keterangan</label>
                <input 
                  value={stockUpdate.note} 
                  onChange={e => setStockUpdate({...stockUpdate, note: e.target.value})} 
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm" 
                  placeholder="Misal: Restock berkala" 
                />
              </div>
              <div className={`p-5 rounded-2xl flex justify-between items-center border ${selectedItem.stok < 3 ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedItem.stok < 3 ? 'text-red-400' : 'text-indigo-400'}`}>Current</span>
                  <span className={`font-black ${selectedItem.stok < 3 ? 'text-red-900' : 'text-indigo-900'}`}>{selectedItem.stok}</span>
                </div>
                <div className={`w-px h-8 ${selectedItem.stok < 3 ? 'bg-red-200' : 'bg-indigo-200'}`}></div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedItem.stok < 3 ? 'text-red-400' : 'text-indigo-400'}`}>Final</span>
                  <span className={`font-black ${selectedItem.stok < 3 ? 'text-red-900' : 'text-indigo-900'}`}>{selectedItem.stok + stockUpdate.amount}</span>
                </div>
              </div>
              <button type="submit" className={`w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${selectedItem.stok < 3 ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>Update Persediaan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;
