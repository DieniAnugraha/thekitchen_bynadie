import React, { useMemo, useState } from 'react';
import {
  Archive,
  Check,
  ClipboardList,
  FileEdit,
  Globe,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { CATEGORIES, formatRupiah } from '../utils/format';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB agar payload JSON tetap ringan

const ORDER_STATUS_TABS = ['Semua', 'Menunggu', 'Diproses', 'Selesai'];

const MENU_STATUS_META = {
  published: {
    label: 'Dipublikasikan',
    badgeClass: 'bg-blue-50 text-[#284EA5] border-blue-200',
  },
  draft: {
    label: 'Draft',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  archived: {
    label: 'Diarsipkan',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export default function AdminView({
  user,
  menus = [],
  orders = [],
  newMenu,
  setNewMenu,
  onLogout = () => {},
  onAddMenu = () => {},
  onUpdateMenu = () => {},
  onChangeMenuStatus = () => {},
  onToggleMenuAvailable = () => {},
  onDeleteMenu = () => {},
  onUpdateOrderStatus = () => {},
}) {
  const safeMenus = Array.isArray(menus) ? menus : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const selectableCategories = (CATEGORIES || []).filter((c) => c !== 'Semua');
  const filterCategories = ['Semua', ...selectableCategories];

  const [adminTab, setAdminTab] = useState('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Semua');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('Semua');
  const [menuStatusFilter, setMenuStatusFilter] = useState('Semua');

  const [formError, setFormError] = useState('');
  const [fileError, setFileError] = useState('');

  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [editFileError, setEditFileError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const readImageFile = (file, onSuccess, onErrorMsg) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onErrorMsg('Pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      onErrorMsg('Ukuran foto maksimal 1.5 MB agar tersimpan lancar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSuccess(reader.result);
      }
    };
    reader.onerror = () => {
      onErrorMsg('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    readImageFile(
      file,
      (dataUrl) => setNewMenu((prev) => ({ ...prev, image_url: dataUrl })),
      (msg) => {
        setFileError(msg);
        e.target.value = '';
      }
    );
  };

  const handleAddFormSubmit = (e) => {
    setFormError('');
    setFileError('');

    const priceNum = Number(newMenu?.price);
    if (!String(newMenu?.name || '').trim()) {
      e.preventDefault();
      setFormError('Nama menu wajib diisi.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      e.preventDefault();
      setFormError('Harga menu harus lebih dari Rp 0.');
      return;
    }

    onAddMenu(e);
  };

  const startEditMenu = (item) => {
    setEditingMenuId(item.id);
    setEditError('');
    setEditFileError('');
    setEditForm({
      name: item.name || '',
      category: item.category || selectableCategories[0] || 'Makanan Berat',
      price: item.price ?? '',
      description: item.description || '',
      image_url: item.image_url || '',
      is_featured: Boolean(item.is_featured),
      status: item.status || 'published',
      is_available: item.is_available !== false,
    });
  };

  const cancelEditMenu = () => {
    setEditingMenuId(null);
    setEditForm(null);
    setEditError('');
    setEditFileError('');
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    setEditFileError('');
    if (!file) return;

    readImageFile(
      file,
      (dataUrl) => setEditForm((prev) => ({ ...prev, image_url: dataUrl })),
      (msg) => {
        setEditFileError(msg);
        e.target.value = '';
      }
    );
  };

  const handleSaveEditMenu = async (e, menuId) => {
    e.preventDefault();
    if (!editForm) return;

    setEditError('');
    const priceNum = Number(editForm.price);
    if (!String(editForm.name || '').trim()) {
      setEditError('Nama menu wajib diisi.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setEditError('Harga menu harus lebih dari Rp 0.');
      return;
    }

    setSavingEdit(true);
    try {
      const result = await onUpdateMenu(menuId, {
        ...editForm,
        name: editForm.name.trim(),
        price: priceNum,
        status: editForm.status || 'published',
      });
      if (result !== false) {
        cancelEditMenu();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickStatusChange = (item, nextStatus) => {
    if (typeof onChangeMenuStatus === 'function') {
      onChangeMenuStatus(item, nextStatus);
      return;
    }
    onUpdateMenu(item.id, {
      ...item,
      status: nextStatus,
      is_available:
        nextStatus === 'published' ? item.is_available !== false : false,
    });
  };

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'Semua') return safeOrders;
    return safeOrders.filter(
      (ord) =>
        String(ord?.status || 'Menunggu').toLowerCase() ===
        orderStatusFilter.toLowerCase()
    );
  }, [safeOrders, orderStatusFilter]);

  const filteredMenus = useMemo(() => {
    return safeMenus.filter((item) => {
      const matchCategory =
        menuCategoryFilter === 'Semua' ||
        String(item?.category || '') === menuCategoryFilter;
      const statusVal = String(item?.status || 'published').toLowerCase();
      const matchStatus =
        menuStatusFilter === 'Semua' || statusVal === menuStatusFilter;
      return matchCategory && matchStatus;
    });
  }, [safeMenus, menuCategoryFilter, menuStatusFilter]);

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
              Login sebagai{' '}
              <strong className="text-[#1E2532]">{user?.name}</strong> (Admin Dapur)
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
        <div className="flex flex-wrap gap-2">
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

        {/* 4e: Pesanan Masuk terbagi per status/kategori */}
        {adminTab === 'orders' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-[#EFECE6]">
              {ORDER_STATUS_TABS.map((statusTab) => {
                const count =
                  statusTab === 'Semua'
                    ? safeOrders.length
                    : safeOrders.filter(
                        (o) =>
                          String(o?.status || 'Menunggu').toLowerCase() ===
                          statusTab.toLowerCase()
                      ).length;
                const active = orderStatusFilter === statusTab;
                return (
                  <button
                    key={statusTab}
                    type="button"
                    onClick={() => setOrderStatusFilter(statusTab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-[#284EA5] text-white'
                        : 'bg-[#FAF9F6] text-[#6B7280] hover:text-[#1E2532]'
                    }`}
                  >
                    {statusTab} ({count})
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-sm text-[#6B7280] border border-[#EFECE6]">
                {orderStatusFilter === 'Semua'
                  ? 'Belum ada pesanan masuk.'
                  : `Tidak ada pesanan dengan status "${orderStatusFilter}".`}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => {
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
                        onChange={(e) =>
                          onUpdateOrderStatus(ord.id, e.target.value)
                        }
                        className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-xs md:text-sm font-semibold text-[#1E2532] focus:outline-none focus:border-[#284EA5] shrink-0"
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Tambah Menu (4c harga > 0 & 4d status publik/draft/arsip) */}
            <form
              onSubmit={handleAddFormSubmit}
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
                  onChange={(e) => {
                    setNewMenu({ ...newMenu, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  placeholder="Contoh: Es Pisang Ijo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Status Menu
                  </label>
                  <select
                    value={newMenu.status || 'published'}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                  >
                    <option value="published">Publik (Tampil)</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Arsip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={newMenu.price}
                  onChange={(e) => {
                    setNewMenu({ ...newMenu, price: e.target.value });
                    if (formError) setFormError('');
                  }}
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

              {formError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-2xl">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#284EA5] text-white font-semibold py-3 rounded-full hover:opacity-95 transition cursor-pointer text-sm"
              >
                Simpan Menu
              </button>
            </form>

            {/* Daftar Menu + Filter Kategori & Status (4c, 4d, 4e) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="bg-white rounded-2xl p-3.5 border border-[#EFECE6] space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#1E2532]">
                    Filter Kategori Menu
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { key: 'Semua', label: 'Semua Status' },
                      { key: 'published', label: 'Publik' },
                      { key: 'draft', label: 'Draft' },
                      { key: 'archived', label: 'Arsip' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setMenuStatusFilter(st.key)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                          menuStatusFilter === st.key
                            ? 'bg-[#1E2532] text-white'
                            : 'bg-[#FAF9F6] text-[#6B7280]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {filterCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMenuCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        menuCategoryFilter === cat
                          ? 'bg-[#284EA5] text-white'
                          : 'bg-[#FAF9F6] text-[#6B7280] hover:text-[#1E2532]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMenus.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-sm text-[#6B7280] border border-[#EFECE6]">
                  Tidak ada menu yang cocok dengan filter terpilih.
                </div>
              ) : (
                filteredMenus.map((item) => {
                  const currentStatus = String(
                    item.status || 'published'
                  ).toLowerCase();
                  const statusMeta =
                    MENU_STATUS_META[currentStatus] || MENU_STATUS_META.published;
                  const isEditing = editingMenuId === item.id && editForm;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-3.5 border border-[#EFECE6] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
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
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-[#1E2532] truncate">
                                {item.name}
                              </p>
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                              {item.category} •{' '}
                              <strong className="text-[#284EA5]">
                                {formatRupiah(item.price)}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              isEditing ? cancelEditMenu() : startEditMenu(item)
                            }
                            className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#EBF0FA] text-[#284EA5] flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>{isEditing ? 'Tutup' : 'Edit'}</span>
                          </button>

                          {currentStatus !== 'draft' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item, 'draft')}
                              className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 cursor-pointer"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              <span>Draft</span>
                            </button>
                          )}

                          {currentStatus !== 'archived' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickStatusChange(item, 'archived')
                              }
                              className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>Arsip</span>
                            </button>
                          )}

                          {currentStatus !== 'published' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickStatusChange(item, 'published')
                              }
                              className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#284EA5] border border-blue-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Publik</span>
                            </button>
                          )}

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

                      {/* Form Edit Inline untuk masing-masing menu (4c & 4d) */}
                      {isEditing && (
                        <form
                          onSubmit={(e) => handleSaveEditMenu(e, item.id)}
                          className="pt-3 border-t border-[#EFECE6] space-y-3 bg-[#FAF9F6] p-3.5 rounded-2xl"
                        >
                          <p className="text-xs font-bold text-[#1E2532]">
                            Edit Data Menu: {item.name}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                                Nama Menu *
                              </label>
                              <input
                                type="text"
                                required
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                                Harga (Rp) *
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                step="any"
                                value={editForm.price}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    price: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                                Kategori
                              </label>
                              <select
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                              >
                                {selectableCategories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                                Status Menu
                              </label>
                              <select
                                value={editForm.status}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    status: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                              >
                                <option value="published">Publik (Tampil)</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Arsip</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                              Deskripsi
                            </label>
                            <textarea
                              rows={2}
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[11px] font-semibold text-[#6B7280]">
                              URL / Upload Foto Menu
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={editForm.image_url}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    image_url: e.target.value,
                                  })
                                }
                                placeholder="https://images.unsplash.com/..."
                                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs focus:outline-none focus:border-[#284EA5]"
                              />
                              <label className="px-3 py-2 rounded-xl bg-[#EBF0FA] text-[#284EA5] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                                <ImagePlus className="w-3.5 h-3.5" />
                                <span>Ganti Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditFileChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {editFileError && (
                              <p className="text-xs text-red-600">{editFileError}</p>
                            )}
                          </div>

                          <label className="flex items-center gap-2 text-xs font-semibold text-[#1E2532] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editForm.is_featured)}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  is_featured: e.target.checked,
                                })
                              }
                              className="rounded accent-[#284EA5]"
                            />
                            <span>Tampilkan sebagai Menu Unggulan di Home</span>
                          </label>

                          {editError && (
                            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                              {editError}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={cancelEditMenu}
                              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-[#EFECE6] text-[#6B7280] flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Batal</span>
                            </button>
                            <button
                              type="submit"
                              disabled={savingEdit}
                              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#284EA5] text-white flex items-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}