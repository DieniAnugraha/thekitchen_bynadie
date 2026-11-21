import React, { useEffect, useState } from 'react';
import { Camera, Check, Edit3, LogOut, Phone, User, X } from 'lucide-react';

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

export default function ProfileTab({
  user,
  onUpdateProfile = () => {},
  onLogout = () => {},
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAvatarUrl(user?.avatar_url || '');
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    setErrorMessage('');
    setStatusMessage('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Pilih file gambar (JPG, PNG, atau WEBP).');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setErrorMessage('Ukuran foto maksimal 1.5 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const nextAvatar = reader.result;
      setAvatarUrl(nextAvatar);
      setSaving(true);
      try {
        await onUpdateProfile({
          name: (name || user?.name || '').trim(),
          phone: (phone ?? user?.phone ?? '').trim(),
          avatar_url: nextAvatar,
        });
        setStatusMessage('Foto profil berhasil diperbarui.');
      } catch {
        setErrorMessage('Gagal menyimpan foto profil.');
      } finally {
        setSaving(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca file foto.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      await onUpdateProfile({
        name: cleanName,
        phone: cleanPhone,
        avatar_url: avatarUrl,
      });
      setIsEditing(false);
      setStatusMessage('Profil berhasil diperbarui.');
    } catch {
      setErrorMessage('Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAvatarUrl(user?.avatar_url || '');
    setErrorMessage('');
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 md:space-y-5">
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#EFECE6] space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'Foto Profil'}
                  onError={() => setAvatarUrl('')}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-[#EFECE6] bg-[#FAF9F6]"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#EBF0FA] text-[#284EA5] flex items-center justify-center border border-[#EFECE6]">
                  <User className="w-7 h-7 md:w-8 md:h-8" />
                </div>
              )}

              <label
                title="Ganti foto profil"
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#284EA5] text-white flex items-center justify-center shadow-sm cursor-pointer hover:opacity-95 transition"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="min-w-0">
              <h2 className="font-display font-bold text-base md:text-lg text-[#1E2532] truncate">
                {user?.name || 'Pelanggan'}
              </h2>
              <p className="text-xs md:text-sm text-[#6B7280] truncate">
                @{user?.username || 'customer'}
              </p>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#284EA5] mt-1.5 cursor-pointer hover:underline">
                <Camera className="w-3.5 h-3.5" />
                <span>{avatarUrl ? 'Ubah Foto Profil' : 'Add Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setStatusMessage('');
                setErrorMessage('');
                setIsEditing(true);
              }}
              className="bg-[#EBF0FA] text-[#284EA5] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-90 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
          )}
        </div>

        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3.5 py-2.5 rounded-2xl">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3.5 py-2.5 rounded-2xl">
            {errorMessage}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-2 border-t border-[#EFECE6]">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap kamu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Nomor HP
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#284EA5] text-white text-xs md:text-sm font-semibold py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 transition disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-full bg-[#FAF9F6] border border-[#EFECE6] text-xs md:text-sm font-semibold text-[#6B7280] flex items-center gap-1 cursor-pointer hover:text-[#1E2532] transition"
              >
                <X className="w-4 h-4" />
                <span>Batal</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 pt-2 border-t border-[#EFECE6] text-xs md:text-sm">
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#6B7280] flex items-center gap-2">
                <User className="w-4 h-4 text-[#284EA5]" />
                <span>Nama Lengkap</span>
              </span>
              <span className="font-semibold text-[#1E2532] text-right">
                {user?.name || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#6B7280] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#284EA5]" />
                <span>Nomor HP</span>
              </span>
              <span className="font-semibold text-[#1E2532] text-right">
                {user?.phone || 'Belum diatur'}
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="w-full bg-white hover:bg-red-50/60 text-red-600 font-semibold py-3.5 rounded-full border border-red-200 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
}