import React from 'react';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { CATEGORIES, formatRupiah } from '../utils/format';
import BrandLogo from './BrandLogo';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

const HERO_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=700&q=80';

export default function HomeTab({
  menus = [],
  onSelectCategory = () => {},
  onSelectMenu = () => {},
  onGoMenu = () => {},
}) {
  const safeMenus = Array.isArray(menus) ? menus : [];
  const featuredMenus = safeMenus.filter((item) => Boolean(item?.is_featured));
  const displayMenus =
    featuredMenus.length > 0 ? featuredMenus : safeMenus.slice(0, 4);
  const quickCategories = (CATEGORIES || []).filter((cat) => cat !== 'Semua');

  return (
    <div className="space-y-5 md:space-y-6 pb-6">
      <section className="bg-[#FDF2C5] px-4 md:px-7 pt-2 pb-6 md:pb-8 rounded-b-[2rem] border-b border-[#EFECE6]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <BrandLogo size="md" />

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-white text-[#1E2532] text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-2xs border border-[#EFECE6]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Buka • Dine-in</span>
            </span>
            <p className="text-[11px] md:text-xs font-medium text-[#6B7280] mt-1">
              Meja &amp; Takeaway
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#284EA5] text-white rounded-3xl p-5 md:p-7 shadow-md">
          <div className="relative z-10 max-w-[68%] sm:max-w-md space-y-3">
            <span className="inline-block bg-[#FDF2C5] text-[#284EA5] text-[10px] md:text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              SIGNATURE KITCHEN
            </span>

            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl leading-tight text-white">
              Hangat &amp; Fresh Langsung dari Dapur!
            </h2>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-sm">
              Pesan langsung dari meja tanpa antre di kasir.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={onGoMenu}
                className="inline-flex items-center gap-2 bg-[#FDF2C5] hover:bg-[#fae9a8] text-[#284EA5] font-bold text-xs sm:text-sm px-5 py-3 rounded-full shadow-xs transition cursor-pointer"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <img
            src={HERO_FOOD_IMAGE}
            alt="THE KitcheN BY NADIE Signature Dish"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-[#1f3f87] shadow-lg absolute -right-4 -bottom-4 sm:right-4 sm:bottom-3"
          />
        </div>
      </section>

      <section className="px-4 md:px-6 space-y-2.5">
        <h3 className="font-display font-bold text-sm md:text-base text-[#1E2532]">
          Kategori
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5">
          {quickCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="bg-white hover:bg-[#FDF2C5]/60 border border-[#EFECE6] rounded-2xl p-3.5 md:p-4 text-left flex items-center gap-2.5 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EBF0FA] text-[#284EA5] flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-[#1E2532]">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-6 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm md:text-base text-[#1E2532]">
            {featuredMenus.length > 0 ? 'Menu Unggulan' : 'Menu Populer'}
          </h3>
          <button
            type="button"
            onClick={onGoMenu}
            className="text-xs md:text-sm font-semibold text-[#284EA5] cursor-pointer"
          >
            Semua
          </button>
        </div>

        {displayMenus.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center text-xs text-[#6B7280] border border-[#EFECE6]">
            Menu belum tersedia atau sedang dimuat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {displayMenus.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMenu(item)}
                className="bg-white rounded-2xl p-3 md:p-3.5 border border-[#EFECE6] flex items-center gap-3 cursor-pointer hover:border-[#284EA5]/40 transition"
              >
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
                  <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <p className="text-xs md:text-sm font-bold text-[#284EA5] mt-1">
                    {formatRupiah(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}