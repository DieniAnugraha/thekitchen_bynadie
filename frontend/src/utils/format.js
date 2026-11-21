export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CATEGORIES = [
  'Semua',
  'Makanan Berat',
  'Camilan',
  'Minuman',
  'Dessert',
];

export function formatRupiah(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}