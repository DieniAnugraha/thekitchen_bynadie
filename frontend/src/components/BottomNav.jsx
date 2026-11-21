import React from 'react';
import { ClipboardList, Heart, Home, User, UtensilsCrossed } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'menu', label: 'Menu', Icon: UtensilsCrossed },
  { id: 'orders', label: 'Orders', Icon: ClipboardList },
  { id: 'favorites', label: 'Favorites', Icon: Heart },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function BottomNav({ activeTab = 'home', setActiveTab = () => {} }) {
  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-[#EFECE6] shadow-sm"
    >
      <div className="max-w-md md:max-w-5xl mx-auto px-2 md:px-6 py-1.5 md:py-2.5">
        <div className="grid grid-cols-5 gap-1 md:gap-3">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`py-1.5 md:py-2.5 px-2 md:px-4 rounded-xl md:rounded-full flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition cursor-pointer ${
                  isActive
                    ? 'text-[#284EA5] md:bg-[#284EA5] md:text-white font-bold'
                    : 'text-[#6B7280] hover:text-[#1E2532] md:hover:bg-[#FAF9F6]'
                }`}
              >
                <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                <span className="text-[11px] md:text-sm font-semibold">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}