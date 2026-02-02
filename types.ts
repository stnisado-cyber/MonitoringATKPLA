
export interface AtkItem {
  id: string;
  nama_barang: string;
  stok: number;
  kategori: string;
  satuan: string;
}

export interface Transaction {
  id: string;
  item_id: string;
  jumlah: number;
  tipe: 'masuk' | 'keluar';
  nama_pengambil: string | null;
  departemen: string | null;
  keterangan: string | null;
  created_at: string;
  atk_items?: AtkItem; // Joined data
}

export type TransactionType = 'masuk' | 'keluar';
