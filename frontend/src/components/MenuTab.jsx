import React from 'react';
import { Heart, Plus, Search } from 'lucide-react';
import { CATEGORIES, formatRupiah } from '../utils/format';

export default function MenuTab({
  menus = [],
  loadingMenus = false,
  searchQuery = '',
  selectedCategory = 'Semua',
  isFavorited = () => false,
  onSearchChange = () => {},
  onCategoryChange = () => {},
  onSelectMenu = () => {},
  onToggleFavorite = () => {},
  onAddToCart = () => {},
}) {
  const safeMenus = Array.isArray(menus) ? menus : [];
  const safeCategories = Array.isArray(CATEGORIES) ? CATEGORIES : ['Semua'];

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari menu favoritmu..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {safeCategories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                active
                  ? 'bg-[#284EA5] text-white'
                  : 'bg-white text-[#6B7280] border border-[#EFECE6]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loadingMenus ? (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#6B7280] border border-[#EFECE6]">
          Memuat daftar menu...
        </div>
      ) : safeMenus.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#6B7280] border border-[#EFECE6]">
          Tidak ada menu yang cocok dengan pencarian atau kategori ini.
        </div>
      ) : (
        <div className="space-y-3">
          {safeMenus.map((item) => {
            const fav = Boolean(isFavorited(item.id));
            const available = item.is_available !== false;

            return (
              <div
                key={item.id}
                onClick={() => onSelectMenu(item)}
                className="bg-white rounded-2xl p-3 border border-[#EFECE6] flex items-center gap-3 cursor-pointer hover:border-[#284EA5]/40 transition"
              >
                <img
                  src={
                    item.image_url ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#FAF9F6]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-[#1E2532] truncate">
                      {item.name}
                    </p>
                    {!available && (
                      <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                        Habis
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <p className="text-xs font-bold text-[#284EA5] mt-1">
                    {formatRupiah(item.price)}
                  </p>
                </div>

                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item)}
                    aria-label="Toggle favorit"
                    className="p-2 rounded-full bg-[#FAF9F6] border border-[#EFECE6] cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        fav
                          ? 'fill-red-500 text-red-500'
                          : 'text-[#6B7280]'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    disabled={!available}
                    onClick={() => onAddToCart(item, 1)}
                    aria-label="Tambah ke keranjang"
                    className={`p-2 rounded-full text-white ${
                      available
                        ? 'bg-[#284EA5] cursor-pointer'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}