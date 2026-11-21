import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { formatRupiah } from '../utils/format';

export default function OrderDetailView({ selectedOrder, onBack }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen p-5 space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#284EA5] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat
        </button>

        <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EFECE6] space-y-1">
          <h2 className="font-display font-bold text-lg text-[#1E2532]">
            Pesanan • Meja {selectedOrder.table_number}
          </h2>
          <p className="text-xs text-[#6B7280]">
            Pemesan: {selectedOrder.customer_name}
          </p>
          <p className="text-xs font-semibold text-[#284EA5]">
            Status: {selectedOrder.status}
          </p>
        </div>

        <div className="space-y-2.5">
          <h3 className="font-display font-bold text-sm text-[#1E2532]">
            Item Pesanan
          </h3>
          {(selectedOrder.order_items || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-start justify-between gap-2 text-sm border-b border-[#EFECE6] pb-2"
            >
              <div>
                <p className="font-medium text-[#1E2532]">
                  {item.menu_name}{' '}
                  <span className="text-[#6B7280]">x{item.quantity}</span>
                </p>
                {item.note && (
                  <p className="text-xs text-[#6B7280] italic mt-0.5">
                    Catatan: {item.note}
                  </p>
                )}
              </div>
              <span className="font-semibold text-[#1E2532] shrink-0">
                {formatRupiah(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#EFECE6] flex justify-between items-center">
          <span className="font-semibold text-sm text-[#1E2532]">Total Bayar</span>
          <span className="font-bold text-base text-[#284EA5]">
            {formatRupiah(selectedOrder.total_price)}
          </span>
        </div>
      </div>
    </div>
  );
}