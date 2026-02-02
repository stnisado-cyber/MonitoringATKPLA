
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
  AlertTriangle
} from 'lucide-react';

const SATUAN_OPTIONS = ["Pcs", "Rim", "Pack", "Box", "Set"];

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
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSync = async () => {
    if (!confirm(`Import ${MASTER_DATA_AWAL.length} item baru?`)) return;
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

      setStatus({ type: 'success', text: 'Data master disinkronkan!' });
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: 'Gagal: ' + err.message });
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

      setStatus({ type: 'success', text: 'Barang berhasil ditambahkan.' });
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
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 1) return null;
      const [nama, stok, kategori, satuan] = parts;
      return {
        nama_barang: nama,
        stok: parseInt(stok) || 0,
        kategori: kategori || 'Umum',
        satuan: satuan || 'Pcs'
      };
    }).filter(item => item !== null && item.nama_barang);

    if (parsedData.length === 0) {
      setStatus({ type: 'error', text: 'Format tidak valid.' });
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
            keterangan: 'Import massal'
          }));

        if (transactions.length > 0) {
          await supabase.from('transactions').insert(transactions);
        }
      }

      setStatus({ type: 'success', text: `Import ${parsedData.length} item berhasil.` });
      setBulkData('');
      setIsBulkModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: 'Gagal: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const newStock = (selectedItem.stok || 0) + stockUpdate.amount;
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

      setStatus({ type: 'success', text: `Stok ${selectedItem.nama_barang} diperbarui.` });
      setIsStockModalOpen(false);
      setStockUpdate({ amount: 1, note: 'Pengisian stok rutin' });
      fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Hapus barang ini?')) return;
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Manajemen Inventaris</h1>
          <p className="text-slate-500 font-medium mt-2">Update data barang dan ketersediaan stok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleInitialSync}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 shadow-xl transition-all font-bold text-sm"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            Sync Master
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:border-indigo-300 transition-all font-bold text-sm"
          >
            <FileSpreadsheet size={20} /> Bulk
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 shadow-xl transition-all font-bold text-sm"
          >
            <Plus size={20} /> Tambah
          </button>
        </div>
      </div>

      {status ? (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-fade-in ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{status.text}</span>
          </div>
          <button onClick={() => setStatus(null)}><X size={16} /></button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading DB...</p>
          </div>
        ) : items.map(item => {
          const isOut = (item.stok || 0) === 0;
          const isLow = (item.stok || 0) > 0 && (item.stok || 0) < 3;

          return (
            <div key={item.id} className={`bg-white rounded-[32px] border transition-all group overflow-hidden ${isOut ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-100 shadow-sm'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${isOut ? 'bg-red-600 text-white' : isLow ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                    {/* @fix missing AlertTriangle import by adding it to lucide-react imports */}
                    {isOut ? <AlertTriangle size={24} /> : <Package size={24} />}
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight line-clamp-2">{item.nama_barang}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{item.kategori}</p>
                
                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level Stok</span>
                    <span className={`text-2xl font-black ${isOut ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-slate-900'}`}>
                      {item.stok || 0} <span className="text-xs text-slate-400 font-bold ml-1">{item.satuan}</span>
                    </span>
                  </div>
                  <button onClick={() => { setSelectedItem(item); setIsStockModalOpen(true); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOut ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-lg'}`}>
                    Refill
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals are kept the same as before but integrated with clean syntax */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3"><FileSpreadsheet className="text-indigo-400" /> Bulk Import</h2>
              <button onClick={() => setIsBulkModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="p-10 space-y-6">
              <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Nama, Stok, Kategori, Satuan" className="w-full h-64 px-6 py-5 border rounded-[24px] bg-slate-50 font-mono text-sm resize-none outline-none focus:ring-4 focus:ring-indigo-50" />
              <button onClick={handleBulkImport} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Import Data</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <h2 className="text-xl font-black">Barang Baru</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateItem} className="p-8 space-y-5">
              <input required value={newItem.nama_barang} onChange={e => setNewItem({...newItem, nama_barang: e.target.value})} className="w-full px-5 py-3.5 border rounded-2xl bg-slate-50 font-bold" placeholder="Nama Barang" />
              <div className="grid grid-cols-2 gap-4">
                <select value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})} className="w-full px-5 py-3.5 border rounded-2xl bg-slate-50 font-bold">
                  <option>Alat Tulis</option>
                  <option>Kertas & Buku</option>
                  <option>Peralatan Kantor</option>
                  <option>Kebersihan</option>
                  <option>Lain-lain</option>
                </select>
                <select required value={newItem.satuan} onChange={e => setNewItem({...newItem, satuan: e.target.value})} className="w-full px-5 py-3.5 border rounded-2xl bg-slate-50 font-bold">
                  {SATUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <input type="number" min="0" required value={newItem.stok} onChange={e => setNewItem({...newItem, stok: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 border rounded-2xl bg-slate-50 font-black text-indigo-600" />
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Simpan Barang</button>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 bg-indigo-600 text-white">
              <h2 className="text-xl font-black leading-tight">Refill: {selectedItem.nama_barang}</h2>
            </div>
            <form onSubmit={handleAddStock} className="p-8 space-y-6">
              <input type="number" min="1" required autoFocus value={stockUpdate.amount} onChange={e => setStockUpdate({...stockUpdate, amount: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 border rounded-2xl bg-slate-50 font-black text-2xl text-indigo-600" />
              <input value={stockUpdate.note} onChange={e => setStockUpdate({...stockUpdate, note: e.target.value})} className="w-full px-5 py-3.5 border rounded-2xl bg-slate-50 font-bold" placeholder="Catatan (Opsional)" />
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Update Persediaan</button>
              <button type="button" onClick={() => setIsStockModalOpen(false)} className="w-full py-2 text-slate-400 font-bold">Batal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;
