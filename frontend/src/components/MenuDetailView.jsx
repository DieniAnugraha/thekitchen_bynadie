import React from 'react';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react';
import { formatRupiah } from '../utils/format';

export default function MenuDetailView({
  selectedMenu,
  detailQty,
  setDetailQty,
  note,
  setNote,
  isFavorited,
  onToggleFavorite,
  onClose,
  onAddToCartAndGoOrders,
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="relative h-72 bg-[#FDF2C5]">
          <img
            src={selectedMenu.image_url}
            alt={selectedMenu.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[#1E2532]" />
          </button>
          <button
            onClick={() => onToggleFavorite(selectedMenu)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorited(selectedMenu.id)
                  ? 'fill-[#284EA5] text-[#284EA5]'
                  : 'text-[#1E2532]'
              }`}
            />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBF0FA] text-[#284EA5]">
              {selectedMenu.category}
            </span>
            <span
              className={`text-xs font-semibold ${
                selectedMenu.is_available ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {selectedMenu.is_available ? 'Tersedia' : 'Habis'}
            </span>
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl text-[#1E2532]">
              {selectedMenu.name}
            </h1>
            <p className="font-bold text-lg text-[#284EA5] mt-1">
              {formatRupiah(selectedMenu.price)}
            </p>
          </div>

          <p className="text-sm text-[#6B7280] leading-relaxed">
            {selectedMenu.description}
          </p>

          {/* Catatan Khusus Makanan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1E2532]">
              Catatan Makanan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: tidak pedas, kuah dipisah, tanpa es..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#284EA5]"
            />
          </div>

          <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1E2532]">Jumlah</span>
            <div className="flex items-center gap-3 bg-[#FAF9F6] px-3 py-1.5 rounded-full border border-[#EFECE6]">
              <button
                onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                className="p-1 cursor-pointer"
              >
                <Minus className="w-4 h-4 text-[#284EA5]" />
              </button>
              <span className="font-bold text-sm w-5 text-center">{detailQty}</span>
              <button
                onClick={() => setDetailQty((q) => q + 1)}
                className="p-1 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#284EA5]" />
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-[#EFECE6]">
          <button
            disabled={!selectedMenu.is_available}
            onClick={() => onAddToCartAndGoOrders(selectedMenu, detailQty, note.trim())}
            className="w-full bg-[#284EA5] disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-full cursor-pointer"
          >
            {selectedMenu.is_available
              ? `Tambah ke Keranjang • ${formatRupiah(selectedMenu.price * detailQty)}`
              : 'Stok Habis'}
          </button>
        </div>
      </div>
    </div>
  );
}