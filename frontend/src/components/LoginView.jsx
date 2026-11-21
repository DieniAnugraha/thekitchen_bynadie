import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Phone, User, UserPlus } from 'lucide-react';

export default function LoginView({
  loginForm,
  setLoginForm,
  loginError,
  loginLoading,
  onLogin,
  onRegister,
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [regForm, setRegForm] = useState({
    name: '',
    username: '',
    phone: '',
    password: '',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      await onRegister(regForm);
    } catch (err) {
      setRegError(err?.message || 'Gagal mendaftar akun baru.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF2C5] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#EFECE6] space-y-5">
        <div className="text-center space-y-2">
          <span className="inline-block bg-[#284EA5] text-[#FDF2C5] font-display font-bold text-base md:text-lg px-4 py-1.5 rounded-full">
            THE KitcheN BY NADIE
          </span>
          <p className="text-xs md:text-sm text-[#6B7280]">
            Online Food Menu &amp; Ordering Platform
          </p>
        </div>

        {/* Switcher Masuk / Daftar Akun */}
        <div className="grid grid-cols-2 bg-[#FAF9F6] p-1 rounded-full border border-[#EFECE6]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setRegError('');
            }}
            className={`py-2 rounded-full text-xs md:text-sm font-semibold transition cursor-pointer ${
              mode === 'login'
                ? 'bg-[#284EA5] text-white shadow-2xs'
                : 'text-[#6B7280] hover:text-[#1E2532]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`py-2 rounded-full text-xs md:text-sm font-semibold transition cursor-pointer ${
              mode === 'register'
                ? 'bg-[#284EA5] text-white shadow-2xs'
                : 'text-[#6B7280] hover:text-[#1E2532]'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  placeholder="Masukkan username kamu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Masukkan password kamu"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Tampilkan atau sembunyikan password"
                  className="text-[#6B7280] hover:text-[#1E2532] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-2xl">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#284EA5] text-white font-semibold py-3 rounded-full hover:opacity-95 transition cursor-pointer text-sm disabled:opacity-60"
            >
              {loginLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                placeholder="Masukkan nama lengkap kamu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regForm.username}
                  onChange={(e) =>
                    setRegForm({ ...regForm, username: e.target.value })
                  }
                  placeholder="Buat username unik"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Nomor HP
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={regForm.phone}
                  onChange={(e) =>
                    setRegForm({ ...regForm, phone: e.target.value })
                  }
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm({ ...regForm, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EFECE6] text-sm focus:outline-none focus:border-[#284EA5]"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword((prev) => !prev)}
                  aria-label="Tampilkan atau sembunyikan password"
                  className="text-[#6B7280] hover:text-[#1E2532] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showRegPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {regError && (
              <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-2xl">
                {regError}
              </p>
            )}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-[#284EA5] text-white font-semibold py-3 rounded-full hover:opacity-95 transition cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              <span>{regLoading ? 'Mendaftarkan...' : 'Daftar & Masuk'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}