
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { AtkItem } from '../types';
import { 
  Plus, Package, Trash2, X, Loader2, CheckCircle2, 
  AlertCircle, ShieldAlert, Database, RefreshCw, Minus, Edit2 
} from 'lucide-react';

const SATUAN_OPTIONS = ["Pcs", "Rim", "Pack", "Box", "Set", "Unit", "Pasang", "Buku", "Roll"];

const AUDIT_LIST = [
  { n: "Business File 940 A4", s: 39, k: "Map & Folder" },
  { n: "Business File 940 F4", s: 22, k: "Map & Folder" },
  { n: "Pocket File A4", s: 1, k: "Map & Folder" },
  { n: "Pocket File F4", s: 4, k: "Map & Folder" },
  { n: "MAP COKELAT A4", s: 220, k: "Map & Folder" },
  { n: "Map Coklat A3", s: 14, k: "Map & Folder" },
  { n: "Clear Holder F4", s: 144, k: "Map & Folder" },
  { n: "Clear Holder A4", s: 6, k: "Map & Folder" },
  { n: "Clear Holder warna", s: 4, k: "Map & Folder" },
  { n: "Map tali bening", s: 1, k: "Map & Folder" },
  { n: "Smart Pocket", s: 6, k: "Peralatan Kantor" },
  { n: "Sampul plastik kecil", s: 6, k: "Peralatan Kantor" },
  { n: "Sampul plastik gede", s: 24, k: "Peralatan Kantor" },
  { n: "BC NO. 300", s: 9, k: "Peralatan Kantor" },
  { n: "BC NO. 105", s: 2, k: "Peralatan Kantor" },
  { n: "BC NO 111", s: 0, k: "Peralatan Kantor" },
  { n: "BC NO. 107", s: 16, k: "Peralatan Kantor" },
  { n: "BC NO. 200", s: 0, k: "Peralatan Kantor" },
  { n: "BC NO. 260", s: 0, k: "Peralatan Kantor" },
  { n: "ISI STAPLES NO. 03", s: 29, k: "Alat Tulis" },
  { n: "ISI STAPLES NO. 10", s: 98, k: "Alat Tulis" },
  { n: "PULPEN KENKO 0.5 MM", s: 7, k: "Alat Tulis" },
  { n: "Paperline panjang", s: 0, k: "Kertas & Buku" },
  { n: "Paperline besar", s: 0, k: "Kertas & Buku" },
  { n: "Kertas Buffalow biru", s: 150, k: "Kertas & Buku" },
  { n: "AMPLOP PUTIH 110 pps", s: 13, k: "Peralatan Kantor" },
  { n: "AMPLOP PUTIH 90 PPS", s: 280, k: "Peralatan Kantor" },
  { n: "AMLPOL COKLAT UANG", s: 200, k: "Peralatan Kantor" },
  { n: "BANTEX A4", s: 40, k: "Map & Folder" },
  { n: "Stabilo Kuning", s: 4, k: "Alat Tulis" },
  { n: "PENGHAPUS PUTIH", s: 14, k: "Alat Tulis" },
  { n: "PENGHAPUS HITAM", s: 4, k: "Alat Tulis" },
  { n: "Sign Here", s: 3, k: "Peralatan Kantor" },
  { n: "Cutter A-300Al", s: 11, k: "Peralatan Kantor" },
  { n: "ISI PISAU CUTTER A-100", s: 1, k: "Peralatan Kantor" },
  { n: "CORRECTION TAPE", s: 4, k: "Alat Tulis" },
  { n: "KREKET PUTIH", s: 10, k: "Peralatan Kantor" },
  { n: "STIKYNOTE BESAR KUNING", s: 1, k: "Kertas & Buku" },
  { n: "STIKYNOTE BESAR PINK", s: 3, k: "Kertas & Buku" },
  { n: "Snowman Marker Permanent Hitam", s: 22, k: "Alat Tulis" },
  { n: "Snowman Marker Permanent Red", s: 13, k: "Alat Tulis" },
  { n: "Snowman Marker WB", s: 10, k: "Alat Tulis" },
  { n: "Snowman Pen Red", s: 8, k: "Alat Tulis" },
  { n: "Snowman Pen Biru", s: 6, k: "Alat Tulis" },
  { n: "Pensil Steadler", s: 28, k: "Alat Tulis" },
  { n: "PULPEN KENKO K-1 Biru", s: 15, k: "Alat Tulis" },
  { n: "PULPEN KENKO K-1 Hitam", s: 25, k: "Alat Tulis" },
  { n: "Snowman Pen BLACK", s: 12, k: "Alat Tulis" },
  { n: "TRIGONAL CLIP O3", s: 13, k: "Peralatan Kantor" },
  { n: "TINTA BROTHER BLACK", s: 2, k: "Tinta & Toner" },
  { n: "TINTA BROTHER YELLOW", s: 2, k: "Tinta & Toner" },
  { n: "TINTA BROTHER MAGENTA", s: 1, k: "Tinta & Toner" },
  { n: "TINTA BROTHER CYAN", s: 1, k: "Tinta & Toner" },
  { n: "BATERE ALKALI A2", s: 7, k: "Peralatan Kantor" },
  { n: "LAKBAN COKELAT BESAR", s: 2, k: "Peralatan Kantor" },
  { n: "LAKBAN PUTIH BESAR", s: 0, k: "Peralatan Kantor" },
  { n: "SOLATIP SEDANG", s: 21, k: "Peralatan Kantor" },
  { n: "TOM ND JERRY NO 112", s: 30, k: "Peralatan Kantor" },
  { n: "TOM ND JERRY NO 107", s: 19, k: "Peralatan Kantor" },
  { n: "BATERE ALKALI A3", s: 66, k: "Peralatan Kantor" },
  { n: "KOPI CAPSULE", s: 1, k: "Peralatan Kantor" },
  { n: "CANON CATRIDGE CH-70", s: 2, k: "Tinta & Toner" },
  { n: "MOUSE MYTECH", s: 0, k: "Elektronik" },
  { n: "MOUSE LOGITECH", s: 0, k: "Elektronik" },
  { n: "TINTA EPSON MAGENTA", s: 1, k: "Tinta & Toner" },
  { n: "TIP X CAIR", s: 11, k: "Alat Tulis" },
  { n: "GUNTING", s: 4, k: "Peralatan Kantor" },
  { n: "POST IT", s: 3, k: "Kertas & Buku" },
  { n: "TINTA EPSON BLACK", s: 1, k: "Tinta & Toner" },
  { n: "PENGGARIS 30 CM", s: 3, k: "Peralatan Kantor" },
  { n: "PENGGARIS 20 CM", s: 2, k: "Peralatan Kantor" },
  { n: "LEM STICK", s: 1, k: "Alat Tulis" },
  { n: "TINTA EPSON YELLOW", s: 1, k: "Tinta & Toner" },
  { n: "TINTA EPSON BLUE", s: 1, k: "Tinta & Toner" },
  { n: "STOPKONTAK", s: 0, k: "Elektronik" },
  { n: "TISSUE", s: 21, k: "Umum" },
  { n: "FLASHDISK 64 GB", s: 2, k: "Elektronik" },
  { n: "BUKU KECIL", s: 5, k: "Kertas & Buku" },
  { n: "Spidol Snowman Kecil Hitam", s: 5, k: "Alat Tulis" },
  { n: "Spidol Snowman Kecil Biru", s: 6, k: "Alat Tulis" },
  { n: "Spidol Snowman Kecil Hijau", s: 2, k: "Alat Tulis" },
  { n: "Spidol Snowman Kecil Merah", s: 11, k: "Alat Tulis" },
  { n: "Pulpen Kenko 4 Warna", s: 6, k: "Alat Tulis" },
  { n: "Pulpen Faster", s: 3, k: "Alat Tulis" },
  { n: "OTG", s: 4, k: "Elektronik" },
  { n: "RAUTAN", s: 7, k: "Alat Tulis" },
  { n: "Pembatas", s: 4, k: "Peralatan Kantor" },
  { n: "FLASHDISK 32 GB", s: 2, k: "Elektronik" },
  { n: "FLASHDISK 128 GB", s: 1, k: "Elektronik" },
  { n: "Stabilo Biru", s: 2, k: "Alat Tulis" },
  { n: "Stabilo Pink", s: 1, k: "Alat Tulis" },
  { n: "TINTA CANON GI-790 MAGENTA", s: 4, k: "Tinta & Toner" },
  { n: "TINTA CANON GI-790 YELLOW", s: 4, k: "Tinta & Toner" },
  { n: "TINTA CANON GI-790 BLUE", s: 3, k: "Tinta & Toner" },
  { n: "TINTA CANON GI-790 BLACK", s: 4, k: "Tinta & Toner" },
  { n: "CANON CATRIDGE 57", s: 1, k: "Tinta & Toner" },
  { n: "MAP TALI", s: 130, k: "Map & Folder" },
  { n: "OUTNER", s: 6, k: "Map & Folder" }
];

const ManageItems: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AtkItem | null>(null);
  const [refillAmount, setRefillAmount] = useState<number>(1);

  // Modal Hapus Custom
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const [newItem, setNewItem] = useState({
    nama_barang: '', kategori: 'Alat Tulis', satuan: 'Pcs', stok: 0
  });

  const [editFormData, setEditFormData] = useState({
    id: '', nama_barang: '', kategori: '', satuan: ''
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('atk_items').select('*').order('nama_barang', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDeleteClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setAdminPassword('');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    if (adminPassword === 'admin123') {
      try {
        setIsSyncing(true);
        const { error } = await supabase.from('atk_items').delete().eq('id', itemToDelete.id);
        
        if (error) {
          if (error.code === '23503') throw new Error("Gagal: Barang ini punya riwayat transaksi.");
          throw error;
        }
        
        setStatus({ type: 'success', text: `"${itemToDelete.name}" berhasil dihapus.` });
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        await fetchItems();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsSyncing(false);
      }
    } else {
      alert("Password Admin Salah!");
    }
  };

  const handleSyncAudit = async () => {
    if (!confirm("Update seluruh stok sesuai data audit fisik? Stok lama akan ditimpa.")) return;
    setIsSyncing(true);
    setSyncProgress(0);
    try {
      for (let i = 0; i < AUDIT_LIST.length; i++) {
        const audit = AUDIT_LIST[i];
        const { data: existing } = await supabase.from('atk_items').select('id').eq('nama_barang', audit.n).maybeSingle();
        if (existing) {
          await supabase.from('atk_items').update({ stok: audit.s }).eq('id', existing.id);
        } else {
          await supabase.from('atk_items').insert({ nama_barang: audit.n, stok: audit.s, kategori: audit.k, satuan: 'Pcs' });
        }
        setSyncProgress(Math.round(((i + 1) / AUDIT_LIST.length) * 100));
      }
      setStatus({ type: 'success', text: `Sinkronisasi audit selesai!` });
      await fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: "Gagal sinkronisasi." });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setStatus(null);
    try {
      // Menyimpan barang baru dengan .select() agar kita tahu ID yang digenerate
      const { data, error } = await supabase.from('atk_items').insert([newItem]).select();
      
      if (error) {
        console.error("Supabase Save Error:", error);
        throw new Error(error.message || "Gagal menyimpan ke database (Cek RLS/Izin)");
      }

      if (newItem.stok > 0 && data?.[0]) {
        await supabase.from('transactions').insert({
          item_id: data[0].id, jumlah: newItem.stok, tipe: 'masuk',
          nama_pengambil: 'System', keterangan: 'Stok Awal'
        });
      }

      setIsModalOpen(false);
      setNewItem({ nama_barang: '', kategori: 'Alat Tulis', satuan: 'Pcs', stok: 0 });
      await fetchItems(); // Memastikan data ditarik ulang setelah simpan
      setStatus({ type: 'success', text: "Barang baru berhasil disimpan!" });
    } catch (err: any) {
      console.error("HandleCreateItem Error:", err);
      setStatus({ type: 'error', text: "Gagal Simpan: " + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateItemInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('atk_items').update({
        nama_barang: editFormData.nama_barang, kategori: editFormData.kategori, satuan: editFormData.satuan
      }).eq('id', editFormData.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      setStatus({ type: 'success', text: "Data diperbarui!" });
      await fetchItems();
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || refillAmount <= 0) return;
    setIsSyncing(true);
    try {
      const newStock = (selectedItem.stok || 0) + refillAmount;
      await supabase.from('atk_items').update({ stok: newStock }).eq('id', selectedItem.id);
      await supabase.from('transactions').insert({
        item_id: selectedItem.id, jumlah: refillAmount, tipe: 'masuk',
        nama_pengambil: 'Admin', keterangan: 'Isi Stok'
      });
      setIsRefillModalOpen(false);
      await fetchItems();
      setStatus({ type: 'success', text: "Stok berhasil ditambah!" });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 p-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Katalog & Stok</h1>
          <p className="text-slate-500 font-medium">Manajemen persediaan barang PLA.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={isSyncing} onClick={handleSyncAudit} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg">
            {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
            Sync Data Audit
          </button>
          <button onClick={() => { setStatus(null); setIsModalOpen(true); }} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg">
            <Plus size={14} /> Tambah Baru
          </button>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          <div className="flex items-center gap-3">
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-bold text-sm">{status.text}</span>
          </div>
          <button onClick={() => setStatus(null)}><X size={16} /></button>
        </div>
      )}

      {/* GRID ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group relative hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600">
                 <Package size={20} />
               </div>
               <div className="text-right">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Stok Real</span>
                 <span className={`text-2xl font-black ${item.stok <= 0 ? 'text-red-500' : 'text-slate-800'}`}>{item.stok}</span>
               </div>
            </div>
            <h3 className="font-black text-slate-800 text-sm leading-tight mb-1 min-h-[40px]">{item.nama_barang}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase">{item.kategori} • {item.satuan}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button onClick={() => { setSelectedItem(item); setIsRefillModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all">
                <Plus size={12} /> Isi Stok
              </button>
              
              <div className="flex gap-1 relative z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditFormData({ id: item.id, nama_barang: item.nama_barang, kategori: item.kategori, satuan: item.satuan }); 
                    setIsEditModalOpen(true); 
                  }} 
                  className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(item.id, item.nama_barang);
                  }} 
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ISI STOK */}
      {isRefillModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 bg-indigo-600 text-white flex justify-between">
              <div><p className="text-[10px] font-bold opacity-60">TAMBAH STOK</p><h2 className="font-black">{selectedItem.nama_barang}</h2></div>
              <button onClick={() => setIsRefillModalOpen(false)}><X /></button>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setRefillAmount(Math.max(1, refillAmount - 1))} className="w-12 h-12 rounded-full border-2 flex items-center justify-center"><Minus/></button>
                <span className="text-4xl font-black">{refillAmount}</span>
                <button onClick={() => setRefillAmount(refillAmount + 1)} className="w-12 h-12 rounded-full border-2 flex items-center justify-center"><Plus/></button>
              </div>
              <button onClick={handleUpdateStock} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-200">Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-800">Tambah Barang Baru</h2>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <input required placeholder="Nama Barang" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newItem.nama_barang} onChange={e => setNewItem({...newItem, nama_barang: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <select className="p-4 bg-slate-50 rounded-2xl border border-slate-100" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                  <option>Alat Tulis</option><option>Kertas & Buku</option><option>Map & Folder</option>
                  <option>Peralatan Kantor</option><option>Tinta & Toner</option><option>Elektronik</option>
                </select>
                <select className="p-4 bg-slate-50 rounded-2xl border border-slate-100" value={newItem.satuan} onChange={e => setNewItem({...newItem, satuan: e.target.value})}>
                  {SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <input type="number" placeholder="Stok Awal" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-indigo-600 border border-slate-100" value={newItem.stok} onChange={e => setNewItem({...newItem, stok: parseInt(e.target.value) || 0})} />
              <button type="submit" disabled={isSyncing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-slate-900 transition-all disabled:opacity-50">
                {isSyncing ? "MEMPROSES..." : "SIMPAN BARANG"}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold py-2">Batal</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT BARANG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-800">Edit Info Barang</h2>
            <form onSubmit={handleUpdateItemInfo} className="space-y-4">
              <input required placeholder="Nama Barang" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100" value={editFormData.nama_barang} onChange={e => setEditFormData({...editFormData, nama_barang: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <select className="p-4 bg-slate-50 rounded-2xl border border-slate-100" value={editFormData.kategori} onChange={e => setEditFormData({...editFormData, kategori: e.target.value})}>
                  <option>Alat Tulis</option><option>Kertas & Buku</option><option>Map & Folder</option>
                  <option>Peralatan Kantor</option><option>Tinta & Toner</option><option>Elektronik</option>
                </select>
                <select className="p-4 bg-slate-50 rounded-2xl border border-slate-100" value={editFormData.satuan} onChange={e => setEditFormData({...editFormData, satuan: e.target.value})}>
                  {SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSyncing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-slate-900 transition-all">
                {isSyncing ? "MENYIMPAN..." : "UPDATE DATA"}
              </button>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full text-slate-400 font-bold py-2">Batal</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS CUSTOM */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl border border-red-50">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-black text-center text-slate-800 tracking-tight">Hapus Barang?</h2>
            <p className="text-slate-500 text-center text-sm mt-2 mb-6">
              Anda akan menghapus <b>{itemToDelete.name}</b>. Masukkan password admin untuk konfirmasi.
            </p>
            
            <input 
              type="password"
              placeholder="Password Admin"
              autoFocus
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 focus:ring-2 focus:ring-red-500 outline-none text-center font-bold"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
            />
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-100 transition-transform active:scale-95"
              >
                Ya, Hapus Sekarang
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-2 text-slate-400 font-bold text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;
