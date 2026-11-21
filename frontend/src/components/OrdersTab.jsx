import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Minus,
  Plus,
  ShoppingBag,
  StickyNote,
  Utensils,
} from 'lucide-react';
import { formatRupiah } from '../utils/format';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

export default function OrdersTab({
  cart = [],
  cartCount = 0,
  cartTotal = 0,
  orders = [],
  loadingOrders = false,
  ordersSubTab = 'cart',
  setOrdersSubTab = () => {},
  customerName = '',
  setCustomerName = () => {},
  orderType = 'Dine In',
  setOrderType = () => {},
  tableNumber = '',
  setTableNumber = () => {},
  checkoutMessage = '',
  onUpdateCartQty = () => {},
  onUpdateCartNote = () => {},
  onInspectCartItem = () => {},
  onCheckout = () => {},
  onOpenHistory = () => {},
  onSelectOrder = () => {},
  onGoMenu = () => {},
}) {
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftNote, setDraftNote] = useState('');

  const startEditNote = (e, idx, currentNote) => {
    e.stopPropagation();
    setEditingIndex(idx);
    setDraftNote(currentNote || '');
  };

  const saveEditNote = (e, idx) => {
    e.stopPropagation();
    onUpdateCartNote(idx, draftNote);
    setEditingIndex(null);
    setDraftNote('');
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-full border border-[#EFECE6] max-w-md">
        <button
          type="button"
          onClick={() => setOrdersSubTab('cart')}
          className={`py-2 rounded-full text-xs md:text-sm font-semibold transition cursor-pointer ${
            ordersSubTab === 'cart'
              ? 'bg-[#284EA5] text-white'
              : 'text-[#6B7280]'
          }`}
        >
          Keranjang ({cartCount})
        </button>
        <button
          type="button"
          onClick={() => {
            setOrdersSubTab('history');
            onOpenHistory();
          }}
          className={`py-2 rounded-full text-xs md:text-sm font-semibold transition cursor-pointer ${
            ordersSubTab === 'history'
              ? 'bg-[#284EA5] text-white'
              : 'text-[#6B7280]'
          }`}
        >
          Riwayat ({safeOrders.length})
        </button>
      </div>

      {checkoutMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{checkoutMessage}</span>
        </div>
      )}

      {ordersSubTab === 'cart' ? (
        safeCart.length === 0 ? (
          <div className="bg-white rounded-3xl p-7 text-center border border-[#EFECE6] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF0FA] text-[#284EA5] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="font-display font-bold text-sm md:text-base text-[#1E2532]">
              Keranjangmu masih kosong
            </p>
            <p className="text-xs md:text-sm text-[#6B7280]">
              Yuk pilih menu favorit dulu sebelum melakukan checkout.
            </p>
            <button
              type="button"
              onClick={onGoMenu}
              className="bg-[#284EA5] text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
            >
              Jelajahi Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-2.5">
              {safeCart.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => onInspectCartItem(item, idx)}
                  className="bg-white rounded-2xl p-3.5 border border-[#EFECE6] space-y-2.5 cursor-pointer hover:border-[#284EA5]/40 transition"
                >
                  <div className="flex items-center justify-between gap-3">
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
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#FAF9F6]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#1E2532] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-bold text-[#284EA5]">
                          {formatRupiah(Number(item.price || 0) * Number(item.quantity || 1))}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          Klik kartu untuk buka detail menu
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(idx, -1)}
                        className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#EFECE6] flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 text-[#1E2532]" />
                      </button>
                      <span className="text-xs font-bold text-[#1E2532] min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(idx, 1)}
                        className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#EFECE6] flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1E2532]" />
                      </button>
                    </div>
                  </div>

                  {editingIndex === idx ? (
                    <div
                      className="flex items-center gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={draftNote}
                        onChange={(e) => setDraftNote(e.target.value)}
                        placeholder="Contoh: tidak pedas, tanpa es..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#284EA5] text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => saveEditNote(e, idx)}
                        className="bg-[#284EA5] text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#FAF9F6]">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] min-w-0">
                        <StickyNote className="w-3.5 h-3.5 text-[#284EA5] shrink-0" />
                        <span className="truncate">
                          {item.note ? item.note : 'Belum ada catatan khusus'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => startEditNote(e, idx, item.note)}
                        className="text-[11px] font-semibold text-[#284EA5] shrink-0 cursor-pointer"
                      >
                        {item.note ? 'Ubah Catatan' : '+ Catatan'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={onCheckout}
              className="lg:col-span-5 bg-white rounded-3xl p-4 md:p-5 border border-[#EFECE6] space-y-3.5"
            >
              <h3 className="font-display font-bold text-base text-[#1E2532]">
                Form Checkout
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#6B7280]">
                  Tipe Pemesanan
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-1 rounded-full border border-[#EFECE6]">
                  {['Dine In', 'Take Away'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                        orderType === type
                          ? 'bg-[#284EA5] text-white'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Nama Pemesan
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  {orderType === 'Dine In'
                    ? 'Nomor Meja *'
                    : 'Catatan Pengambilan (Opsional)'}
                </label>
                <input
                  type="text"
                  required={orderType === 'Dine In'}
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder={
                    orderType === 'Dine In'
                      ? 'Contoh: 05 atau 12'
                      : 'Contoh: ambil jam 19.00, pisah sambal'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6]">
                <span className="text-xs md:text-sm font-semibold text-[#6B7280]">
                  Total
                </span>
                <span className="text-base md:text-lg font-bold text-[#284EA5]">
                  {formatRupiah(cartTotal)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#284EA5] text-white font-semibold py-3.5 rounded-full hover:opacity-95 transition cursor-pointer text-sm"
              >
                Buat Pesanan ({orderType})
              </button>
            </form>
          </div>
        )
      ) : loadingOrders ? (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#6B7280] border border-[#EFECE6]">
          Memuat riwayat pesanan...
        </div>
      ) : safeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-7 text-center border border-[#EFECE6] space-y-2">
          <ClipboardList className="w-7 h-7 text-[#284EA5] mx-auto" />
          <p className="font-display font-bold text-sm text-[#1E2532]">
            Belum ada riwayat pesanan
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safeOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => onSelectOrder(ord)}
              className="bg-white rounded-2xl p-4 border border-[#EFECE6] cursor-pointer hover:border-[#284EA5]/40 transition space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm text-[#1E2532] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#284EA5]" />
                  <span>{ord.table_number || 'Pesanan'}</span>
                </p>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF0FA] text-[#284EA5]">
                  {ord.status || 'Menunggu'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">{ord.customer_name}</p>
              <p className="text-xs font-bold text-[#284EA5]">
                {formatRupiah(ord.total_price)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}