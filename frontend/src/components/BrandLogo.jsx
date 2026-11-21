import React from 'react';

export default function BrandLogo({ size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      className={`inline-flex flex-col select-none leading-none shrink-0 ${className}`}
      aria-label="THE KitcheN BY NADIE"
    >
      <span
        className={`font-display font-black tracking-tight text-[#284EA5] ${
          isSm
            ? 'text-lg md:text-xl'
            : isLg
              ? 'text-3xl md:text-4xl'
              : 'text-xl md:text-2xl'
        }`}
      >
        THE
      </span>

      <div className="flex items-start gap-1.5 -mt-0.5">
        <div className="inline-block">
          <span
            className={`font-display font-black tracking-tight text-[#284EA5] ${
              isSm
                ? 'text-xl md:text-2xl'
                : isLg
                  ? 'text-4xl md:text-5xl'
                  : 'text-2xl md:text-3xl'
            }`}
          >
            KitcheN
          </span>
          {/* Dua garis bawah lurus di bawah huruf K */}
          <span
            className={`block bg-[#284EA5] rounded-full ${
              isSm
                ? 'w-5 h-[2.5px] mt-0.5'
                : isLg
                  ? 'w-8 h-1 mt-1'
                  : 'w-6 h-[3px] mt-0.5'
            }`}
          />
          <span
            className={`block bg-[#284EA5] rounded-full ${
              isSm
                ? 'w-6 h-[2.5px] mt-[2px]'
                : isLg
                  ? 'w-10 h-1 mt-1'
                  : 'w-7 h-[3px] mt-[2px]'
            }`}
          />
        </div>

        <span
          className={`font-display font-extrabold uppercase tracking-wider text-[#284EA5] ${
            isSm
              ? 'text-[9px] md:text-[10px] mt-1'
              : isLg
                ? 'text-xs md:text-sm mt-1.5'
                : 'text-[10px] md:text-[11px] mt-1'
          }`}
        >
          BY NADIE
        </span>
      </div>
    </div>
  );
}