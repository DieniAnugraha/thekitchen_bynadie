import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { formatRupiah } from '../utils/format';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

export default function FavoritesTab({
  favorites = [],
  onSelectMenu = () => {},
  onToggleFavorite = () => {},
  onGoMenu = () => {},
}) {
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-base md:text-lg text-[#1E2532]">
          Menu Favorit ({safeFavorites.length})
        </h2>
      </div>

      {safeFavorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-7 text-center border border-[#EFECE6] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF0FA] text-[#284EA5] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <p className="font-display font-bold text-sm md:text-base text-[#1E2532]">
            Belum ada menu favorit
          </p>
          <p className="text-xs md:text-sm text-[#6B7280]">
            Tekan ikon hati pada menu yang kamu sukai agar tersimpan di sini.
          </p>
          <button
            type="button"
            onClick={onGoMenu}
            className="bg-[#284EA5] text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
          >
            Lihat Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {safeFavorites.map((item, idx) => (
            <div
              key={`${item.id ?? idx}-${idx}`}
              onClick={() => onSelectMenu(item)}
              className="bg-white rounded-2xl p-3 md:p-3.5 border border-[#EFECE6] flex items-center justify-between gap-3 cursor-pointer hover:border-[#284EA5]/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={
                    typeof item.image_url === 'string' && item.image_url.trim()
                      ? item.image_url.trim()
                      : FALLBACK_IMAGE
                  }
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shrink-0 bg-[#FAF9F6]"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm md:text-base text-[#1E2532] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs md:text-sm font-bold text-[#284EA5] mt-1">
                    {formatRupiah(item.price)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(item);
                }}
                className="px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer relative z-10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}