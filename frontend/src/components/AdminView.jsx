import React, { useState } from 'react';
import {
  ClipboardList,
  ImagePlus,
  LogOut,
  Plus,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { CATEGORIES, formatRupiah } from '../utils/format';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB agar payload JSON tetap ringan

export default function AdminView({
  user,
  menus = [],
  orders = [],
  newMenu,
  setNewMenu,
  onLogout = () => {},
  onAddMenu = () => {},
  onToggleMenuAvailable = () => {},
  onDeleteMenu = () => {},
  onUpdateOrderStatus = () => {},
}) {
  const safeMenus = Array.isArray(menus) ? menus : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const selectableCategories = (CATEGORIES || []).filter((c) => c !== 'Semua');
  const [adminTab, setAdminTab] = useState('orders');
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Pilih file gambar (JPG, PNG, atau WEBP).');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setFileError('Ukuran foto maksimal 1.5 MB agar tersimpan lancar.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewMenu((prev) => ({ ...prev, image_url: reader.result }));
      }
    };
    reader.onerror = () => {
      setFileError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const formatOrderItemsSummary = (order) => {
    const items = Array.isArray(order?.order_items)
      ? order.order_items
      : Array.isArray(order?.items)
        ? order.items
        : [];
    if (items.length === 0) return '';
    return items
      .map((it) => {
        const name = it.menu_name || it.name || 'Menu';
        const qty = it.quantity || 1;
        const notePart = it.note ? ` [${it.note}]` : '';
        return `${name} (x${qty})${notePart}`;
      })
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-12">
      <header className="bg-[#FDF2C5] px-5 md:px-8 py-5 border-b border-[#EFECE6]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-[#284EA5] text-[#FDF2C5] font-display font-bold text-sm px-3.5 py-1 rounded-full">
              THE Kitchen BY NADIE • Dapur
            </span>
            <p className="text-xs md:text-sm text-[#6B7280] mt-1.5">
              Login sebagai <strong className="text-[#1E2532]">{user?.name}</strong> (Admin Dapur)
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="bg-white text-red-600 border border-[#EFECE6] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAdminTab('orders')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'orders'
                ? 'bg-[#284EA5] text-white'
                : 'bg-white text-[#6B7280] border border-[#EFECE6]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Pesanan Masuk ({safeOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('menus')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'menus'
                ? 'bg-[#284EA5] text-white'
                : 'bg-white text-[#6B7280] border border-[#EFECE6]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Kelola Menu ({safeMenus.length})</span>
          </button>
        </div>

        {adminTab === 'orders' ? (
          <div className="space-y-3">
            {safeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-sm text-[#6B7280] border border-[#EFECE6]">
                Belum ada pesanan masuk.
              </div>
            ) : (
              safeOrders.map((ord) => {
                const summary = formatOrderItemsSummary(ord);
                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base text-[#1E2532]">
                        {ord.table_number} • {ord.customer_name}
                      </p>
                      <p className="text-xs md:text-sm font-bold text-[#284EA5]">
                        {formatRupiah(ord.total_price)}
                      </p>
                      {summary && (
                        <p className="text-xs text-[#6B7280]">{summary}</p>
                      )}
                    </div>

                    <select
                      value={ord.status || 'Menunggu'}
                      onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-xs md:text-sm font-semibold text-[#1E2532] focus:outline-none focus:border-[#284EA5] shrink-0"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={(e) => {
                setFileError('');
                onAddMenu(e);
              }}
              className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#EFECE6] space-y-3.5"
            >
              <h2 className="font-display font-bold text-base text-[#1E2532] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#284EA5]" />
                <span>Tambah Menu Baru</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  value={newMenu.name}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, name: e.target.value })
                  }
                  placeholder="Contoh: Es Pisang Ijo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Kategori
                </label>
                <select
                  value={newMenu.category}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                >
                  {selectableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newMenu.price}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, price: e.target.value })
                  }
                  placeholder="15000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={newMenu.description}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat menu..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6B7280]">
                  Upload Foto dari File (atau isi URL)
                </label>
                <label className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#EBF0FA] text-[#284EA5] text-xs font-semibold cursor-pointer hover:opacity-95 transition">
                  <ImagePlus className="w-4 h-4" />
                  <span>Pilih Foto dari Perangkat</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={newMenu.image_url}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, image_url: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                />

                {fileError && (
                  <p className="text-xs text-red-600">{fileError}</p>
                )}

                {newMenu.image_url && (
                  <div className="pt-1">
                    <img
                      src={newMenu.image_url}
                      alt="Preview menu"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-36 object-cover rounded-2xl border border-[#EFECE6]"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#1E2532] pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(newMenu.is_featured)}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, is_featured: e.target.checked })
                  }
                  className="rounded accent-[#284EA5]"
                />
                <span>Tampilkan sebagai Menu Unggulan di Home</span>
              </label>

              <button
                type="submit"
                className="w-full bg-[#284EA5] text-white font-semibold py-3 rounded-full hover:opacity-95 transition cursor-pointer text-sm"
              >
                Simpan Menu
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {safeMenus.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#EFECE6] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={
                        typeof item.image_url === 'string' &&
                        item.image_url.trim()
                          ? item.image_url.trim()
                          : FALLBACK_IMAGE
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#FAF9F6]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-[#1E2532] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {item.category} • {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleMenuAvailable(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                        item.is_available !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {item.is_available !== false ? 'Tersedia' : 'Habis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMenu(item.id)}
                      aria-label="Hapus menu"
                      className="p-2 rounded-full bg-red-50 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}