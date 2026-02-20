
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { AtkItem } from '../types';
import { 
  Plus, Package, Trash2, X, Loader2, CheckCircle2, 
  AlertCircle, ShieldAlert, Database, RefreshCw, Minus, Edit2 
} from 'lucide-react';

const SATUAN_OPTIONS = ["Pcs", "Rim", "Pack", "Box", "Set", "Unit", "Pasang", "Buku", "Roll"];

const ManageItems: React.FC = () => {
  const [items, setItems] = useState<AtkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AtkItem | null>(null);
  const [refillAmount, setRefillAmount] = useState<number>(1);

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
        if (error) throw error;
        setStatus({ type: 'success', text: `"${itemToDelete.name}" berhasil dihapus.` });
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        await fetchItems();
      } catch (err: any) {
        alert("Gagal menghapus: " + err.message);
      } finally {
        setIsSyncing(false);
      }
    } else {
      alert("Password Admin Salah!");
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setStatus(null);
    try {
      const { data, error } = await supabase.from('atk_items').insert([newItem]).select();
      if (error) throw error;
      if (newItem.stok > 0 && data?.[0]) {
        await supabase.from('transactions').insert([{
          item_id: data[0].id, jumlah: newItem.stok, tipe: 'masuk',
          nama_pengambil: 'System', keterangan: 'Stok Awal'
        }]);
      }
      setIsModalOpen(false);
      setNewItem({ nama_barang: '', kategori: 'Alat Tulis', satuan: 'Pcs', stok: 0 });
      await fetchItems();
      setStatus({ type: 'success', text: "Barang baru berhasil disimpan!" });
    } catch (err: any) {
      setStatus({ type: 'error', text: "Gagal: " + err.message });
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
      setStatus({ type: 'error', text: "Update gagal: " + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateStock = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!selectedItem || refillAmount <= 0 || isSyncing) return;
    
    setIsSyncing(true);
    setStatus(null);
    
    try {
      const newStock = (selectedItem.stok || 0) + refillAmount;
      
      const { error: updErr } = await supabase
        .from('atk_items')
        .update({ stok: newStock })
        .eq('id', selectedItem.id);
      
      if (updErr) {
        if (updErr.code === '42501') throw new Error("Izin UPDATE Barang Ditolak. Jalankan SQL Policy di Supabase.");
        throw updErr;
      }

      const { error: trErr } = await supabase.from('transactions').insert([{
        item_id: selectedItem.id, 
        jumlah: refillAmount, 
        tipe: 'masuk',
        nama_pengambil: 'Admin/Gudang', 
        departemen: 'Logistik',
        keterangan: 'Refill Stok'
      }]);
      
      if (trErr) {
        if (trErr.code === '42501') throw new Error("Izin LOG Transaksi Ditolak. Jalankan SQL Policy di Supabase.");
        throw trErr;
      }

      setIsRefillModalOpen(false);
      await fetchItems();
      setStatus({ type: 'success', text: `Stok ${selectedItem.nama_barang} ditambah ${refillAmount}!` });
      setSelectedItem(null);
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Katalog & Stok</h1>
          <p className="text-slate-500 font-medium">Manajemen persediaan barang PLA.</p>
        </div>
        <button onClick={() => { setStatus(null); setIsModalOpen(true); }} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
          <Plus size={14} /> Tambah Baru
        </button>
      </div>

      {status && status.type === 'success' && (
        <div className="p-4 rounded-2xl flex items-start justify-between border bg-emerald-50 text-emerald-700 border-emerald-100 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5" />
            <span className="font-bold text-sm leading-relaxed">{status.text}</span>
          </div>
          <button onClick={() => setStatus(null)} className="p-1 hover:bg-black/5 rounded-lg"><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600">
                 <Package size={20} />
               </div>
               <div className="text-right">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Stok Real</span>
                 <span className={`text-2xl font-black ${item.stok <= 0 ? 'text-red-500' : 'text-slate-800'}`}>{item.stok}</span>
               </div>
            </div>
            <h3 className="font-black text-slate-800 text-sm leading-tight mb-1 min-h-[40px] line-clamp-2">{item.nama_barang}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.kategori} • {item.satuan}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button 
                onClick={() => { setSelectedItem(item); setRefillAmount(1); setStatus(null); setIsRefillModalOpen(true); }} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all shadow-md active:scale-95"
              >
                <Plus size={12} /> Isi Stok
              </button>
              
              <div className="flex gap-1">
                <button onClick={() => { setEditFormData({ id: item.id, nama_barang: item.nama_barang, kategori: item.kategori, satuan: item.satuan }); setIsEditModalOpen(true); }} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteClick(item.id, item.nama_barang)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ISI STOK DENGAN ERROR INSIDE */}
      {isRefillModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">TAMBAH STOK</p>
                <h2 className="font-black text-lg">{selectedItem.nama_barang}</h2>
              </div>
              <button onClick={() => setIsRefillModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              {status?.type === 'error' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold leading-relaxed flex gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {status.text}
                </div>
              )}
              
              <div className="flex items-center justify-center gap-8">
                <button onClick={() => setRefillAmount(Math.max(1, refillAmount - 1))} className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-indigo-600 transition-all"><Minus/></button>
                <span className="text-4xl font-black">{refillAmount}</span>
                <button onClick={() => setRefillAmount(refillAmount + 1)} className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-indigo-600 transition-all"><Plus/></button>
              </div>
              
              <button 
                onClick={handleUpdateStock} 
                disabled={isSyncing}
                className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all active:scale-95 flex justify-center gap-2"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : 'Konfirmasi Penambahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6">Tambah Barang Baru</h2>
            {status?.type === 'error' && <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold">{status.text}</div>}
            <form onSubmit={handleCreateItem} className="space-y-4">
              <input required placeholder="Nama Barang" className="w-full p-4 bg-slate-50 rounded-2xl border" value={newItem.nama_barang} onChange={e => setNewItem({...newItem, nama_barang: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full p-4 bg-slate-50 rounded-2xl border" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                  <option>Alat Tulis</option><option>Kertas & Buku</option><option>Map & Folder</option>
                  <option>Peralatan Kantor</option><option>Tinta & Toner</option><option>Elektronik</option>
                </select>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border" value={newItem.satuan} onChange={e => setNewItem({...newItem, satuan: e.target.value})}>
                  {SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <input type="number" placeholder="Stok Awal" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-indigo-600" value={newItem.stok} onChange={e => setNewItem({...newItem, stok: parseInt(e.target.value) || 0})} />
              <button type="submit" disabled={isSyncing} className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black uppercase text-xs transition-all active:scale-95">
                {isSyncing ? "MEMPROSES..." : "SIMPAN BARANG"}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold py-2">Batal</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT BARANG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-800">Edit Info Barang</h2>
            <form onSubmit={handleUpdateItemInfo} className="space-y-4">
              <input required placeholder="Nama Barang" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={editFormData.nama_barang} onChange={e => setEditFormData({...editFormData, nama_barang: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <select className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={editFormData.kategori} onChange={e => setEditFormData({...editFormData, kategori: e.target.value})}>
                  <option>Alat Tulis</option><option>Kertas & Buku</option><option>Map & Folder</option>
                  <option>Peralatan Kantor</option><option>Tinta & Toner</option><option>Elektronik</option>
                </select>
                <select className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={editFormData.satuan} onChange={e => setEditFormData({...editFormData, satuan: e.target.value})}>
                  {SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSyncing} className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black uppercase text-xs active:scale-95 mt-4">
                {isSyncing ? "MENYIMPAN..." : "UPDATE DATA"}
              </button>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full text-slate-400 font-bold py-2">Batal</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl border border-red-50 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Hapus Barang?</h2>
            <p className="text-slate-500 text-sm mt-3 mb-8">Anda akan menghapus <b>{itemToDelete.name}</b>. Masukkan password admin.</p>
            <input type="password" placeholder="Password Admin" className="w-full p-5 bg-slate-50 rounded-2xl border mb-6 text-center font-black" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmDelete()} />
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-red-600 transition-all active:scale-95">Ya, Hapus Sekarang</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-xs uppercase">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;
