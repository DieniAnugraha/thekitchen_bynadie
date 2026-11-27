import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { API_URL } from './utils/format';
import BrandLogo from './components/BrandLogo';
import LoginView from './components/LoginView';
import AdminView from './components/AdminView';
import MenuDetailView from './components/MenuDetailView';
import OrderDetailView from './components/OrderDetailView';
import HomeTab from './components/HomeTab';
import MenuTab from './components/MenuTab';
import OrdersTab from './components/OrdersTab';
import FavoritesTab from './components/FavoritesTab';
import ProfileTab from './components/ProfileTab';
import BottomNav from './components/BottomNav';

const COVER_DURATION_MS = 2600;

const getUserOrderStorageKey = (currentUser) => {
  const identifier =
    currentUser?.id ?? currentUser?.username ?? currentUser?.name;
  return identifier
    ? `the_kitchen_my_orders_${String(identifier).toLowerCase()}`
    : null;
};

const getSavedOrderIdsForUser = (currentUser) => {
  const key = getUserOrderStorageKey(currentUser);
  if (!key) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const saveOrderIdForUser = (currentUser, orderId) => {
  const key = getUserOrderStorageKey(currentUser);
  if (!key || !orderId) return;
  const existing = getSavedOrderIdsForUser(currentUser);
  const next = Array.from(new Set([String(orderId), ...existing]));
  localStorage.setItem(key, JSON.stringify(next));
};

const filterOrdersForUser = (allOrders, currentUser) => {
  if (!Array.isArray(allOrders) || !currentUser) return [];
  if (currentUser.role === 'admin') return allOrders;

  const savedOrderIds = getSavedOrderIdsForUser(currentUser);
  const userName = (currentUser.name || '').trim().toLowerCase();
  const userUsername = (currentUser.username || '').trim().toLowerCase();

  return allOrders.filter((order) => {
    if (order?.id && savedOrderIds.includes(String(order.id))) {
      return true;
    }
    if (
      order?.user_id !== undefined &&
      order?.user_id !== null &&
      currentUser.id !== undefined
    ) {
      return String(order.user_id) === String(currentUser.id);
    }
    const orderCustomer = (order?.customer_name || '').trim().toLowerCase();
    return (
      (userName && orderCustomer === userName) ||
      (userUsername && orderCustomer === userUsername)
    );
  });
};

const isMenuVisibleToCustomer = (item) => {
  const status = String(item?.status || 'published').toLowerCase();
  return status !== 'draft' && status !== 'archived';
};

export default function App() {
  const [showCover, setShowCover] = useState(true);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('the_kitchen_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailNote, setDetailNote] = useState('');

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('the_kitchen_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [favToast, setFavToast] = useState('');
  const [cartToast, setCartToast] = useState('');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('the_kitchen_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [ordersSubTab, setOrdersSubTab] = useState('cart');
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('Dine In');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [adminToast, setAdminToast] = useState('');

  const [newMenu, setNewMenu] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Makanan Berat',
    image_url: '',
    is_featured: false,
    status: 'published',
  });

  useEffect(() => {
    if (!showCover) return undefined;
    const timer = setTimeout(() => {
      setShowCover(false);
    }, COVER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showCover]);

  useEffect(() => {
    localStorage.setItem('the_kitchen_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('the_kitchen_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setOrders([]);
      setSelectedOrder(null);
      setCheckoutMessage('');
      fetchMenus();
      fetchOrders(user);
    } else {
      setOrders([]);
      setCustomerName('');
    }
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchOrders(user);
    }
  }, [activeTab, user?.id]);

  const showAdminNotification = (message) => {
    setAdminToast(message);
    setTimeout(() => {
      setAdminToast((current) => (current === message ? '' : current));
    }, 2500);
  };

  const fetchMenus = async (
    category = selectedCategory,
    search = searchQuery,
    currentRole = user?.role
  ) => {
    setLoadingMenus(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'Semua') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());
      const res = await fetch(`${API_URL}/api/menus?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((item) => ({
          ...item,
          status: item.status || 'published',
        }));
        const filteredByRole =
          currentRole === 'admin'
            ? normalized
            : normalized.filter(isMenuVisibleToCustomer);
        setMenus(filteredByRole);
      }
    } catch (err) {
      console.error('Gagal memuat menu:', err);
    } finally {
      setLoadingMenus(false);
    }
  };

  const fetchOrders = async (targetUser = user) => {
    if (!targetUser) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      setOrders(filterOrdersForUser(orderList, targetUser));
    } catch (err) {
      console.error('Gagal memuat pesanan:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    const cleanUsername = (loginForm.username || '').trim();
    const cleanPassword = loginForm.password || '';

    if (!cleanUsername || !cleanPassword) {
      setLoginError('Username dan password wajib diisi terlebih dahulu.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login gagal');
      } else {
        setOrders([]);
        setCustomerName(data.name || '');
        setUser(data);
        localStorage.setItem('the_kitchen_user', JSON.stringify(data));
      }
    } catch {
      setLoginError('Tidak dapat terhubung ke server API.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 4a: Validasi ketat nama, password (>= 6 karakter), dan nomor telepon
  const handleRegister = async ({ name, username, phone, password }) => {
    const cleanName = (name || '').trim().replace(/\s+/g, ' ');
    const cleanUsername = (username || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanPassword = password || '';

    if (!cleanName || !cleanUsername || !cleanPhone || !cleanPassword) {
      throw new Error('Semua kolom wajib diisi.');
    }

    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/;
    if (!nameRegex.test(cleanName) || cleanName.length < 2) {
      throw new Error(
        'Nama hanya boleh berisi huruf dan spasi (tanpa angka atau karakter khusus).'
      );
    }

    if (cleanPassword.length < 6) {
      throw new Error('Password minimal 6 karakter.');
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    const phoneRegex = /^\+?[\d\s-]{8,16}$/;
    if (!phoneRegex.test(cleanPhone) || digitsOnly.length < 8 || digitsOnly.length > 15) {
      throw new Error(
        'Nomor telepon tidak valid (gunakan 8–15 digit angka saja).'
      );
    }

    const registeredUsers = JSON.parse(
      localStorage.getItem('the_kitchen_registered_users') || '[]'
    );

    if (
      ['admin', 'nadie'].includes(cleanUsername.toLowerCase()) ||
      registeredUsers.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      )
    ) {
      throw new Error('Username sudah digunakan.');
    }

    let newUser = {
      id: Date.now(),
      name: cleanName,
      username: cleanUsername,
      phone: cleanPhone,
      avatar_url: '',
      role: 'customer',
    };

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
          phone: cleanPhone,
          password: cleanPassword,
          role: 'customer',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status !== 404) {
          throw new Error(data.error || 'Registrasi gagal.');
        }
      } else if (data && (data.username || data.user)) {
        newUser = {
          ...newUser,
          ...(data.user || data),
          name: (data.user || data).name || cleanName,
          username: (data.user || data).username || cleanUsername,
          phone: (data.user || data).phone || cleanPhone,
          avatar_url: (data.user || data).avatar_url || '',
          role: (data.user || data).role || 'customer',
        };
      }
    } catch (err) {
      if (
        err.message === 'Username sudah digunakan.' ||
        err.message.includes('Registrasi gagal')
      ) {
        throw err;
      }
    }

    const updatedUsers = [
      ...registeredUsers,
      { ...newUser, password: cleanPassword },
    ];
    localStorage.setItem(
      'the_kitchen_registered_users',
      JSON.stringify(updatedUsers)
    );

    setOrders([]);
    setSelectedOrder(null);
    setSelectedMenu(null);
    setCheckoutMessage('');
    setCustomerName(newUser.name);
    setActiveTab('home');
    setOrdersSubTab('cart');

    setUser(newUser);
    localStorage.setItem('the_kitchen_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('the_kitchen_user');
    setOrders([]);
    setCustomerName('');
    setCheckoutMessage('');
    setActiveTab('home');
    setSelectedMenu(null);
    setSelectedOrder(null);
  };

  const handleUpdateProfile = async ({ name, phone, avatar_url }) => {
    if (!user) return;
    const cleanName = name.trim();
    const cleanPhone = (phone ?? user.phone ?? '').trim();
    const cleanAvatar =
      avatar_url !== undefined ? avatar_url : user.avatar_url || '';
    if (!cleanName) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          avatar_url: cleanAvatar,
        }),
      });
      if (res.ok) {
        const updatedFromApi = await res.json();
        const mergedUser = {
          ...user,
          ...updatedFromApi,
          name: updatedFromApi.name || cleanName,
          phone: updatedFromApi.phone ?? cleanPhone,
          avatar_url: updatedFromApi.avatar_url ?? cleanAvatar,
        };
        setUser(mergedUser);
        localStorage.setItem('the_kitchen_user', JSON.stringify(mergedUser));
        setCustomerName(mergedUser.name);
        return;
      }
    } catch {
      // fallback ke penyimpanan lokal jika backend belum aktif
    }

    const updated = {
      ...user,
      name: cleanName,
      phone: cleanPhone,
      avatar_url: cleanAvatar,
    };
    setUser(updated);
    localStorage.setItem('the_kitchen_user', JSON.stringify(updated));
    setCustomerName(cleanName);
  };

  const showFavoriteNotification = (message) => {
    setFavToast(message);
    setTimeout(() => {
      setFavToast((current) => (current === message ? '' : current));
    }, 2200);
  };

  const showCartNotification = (message) => {
    setCartToast(message);
    setTimeout(() => {
      setCartToast((current) => (current === message ? '' : current));
    }, 2200);
  };

  const toggleFavorite = (menuItem) => {
    const targetId = String(menuItem?.id ?? '');
    const exists = favorites.some(
      (item) => String(item?.id ?? '') === targetId
    );
    if (exists) {
      setFavorites((prev) =>
        prev.filter((item) => String(item?.id ?? '') !== targetId)
      );
      showFavoriteNotification(`"${menuItem.name}" dihapus dari favorit.`);
    } else {
      setFavorites((prev) => [...prev, menuItem]);
      showFavoriteNotification(`"${menuItem.name}" ditambahkan ke favorit!`);
    }
  };

  const isFavorited = (id) =>
    favorites.some((item) => String(item?.id ?? '') === String(id ?? ''));

  const addToCart = (menuItem, qty = 1, note = '', notify = false) => {
    const cleanNote = (note || '').trim();
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === menuItem.id && (item.note || '') === cleanNote
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      return [...prev, { ...menuItem, quantity: qty, note: cleanNote }];
    });
    setCheckoutMessage('');
    if (notify) {
      showCartNotification(`${menuItem.name} berhasil ditambahkan ke keranjang!`);
    }
  };

  const updateCartQty = (idx, delta) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateCartNote = (idx, nextNote) => {
    const cleanNote = (nextNote || '').trim();
    setCart((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, note: cleanNote } : item))
    );
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // 4b: Nilai meja berasal dari dropdown sehingga tidak mengandung huruf bebas
  const handleCheckout = async (e) => {
    e.preventDefault();
    const cleanDetail = String(tableNumber || '').trim();
    if (!customerName.trim() || cart.length === 0) return;
    if (orderType === 'Dine In' && !cleanDetail) return;

    const formattedLocation =
      orderType === 'Dine In'
        ? `Dine In • ${cleanDetail}`
        : cleanDetail
          ? `Take Away (${cleanDetail})`
          : 'Take Away';

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id ?? null,
          customer_name: customerName.trim(),
          table_number: formattedLocation,
          total_price: cartTotal,
          items: cart,
        }),
      });
      if (res.ok) {
        const createdOrder = await res.json().catch(() => null);
        const createdId =
          createdOrder?.id ?? createdOrder?.data?.id ?? createdOrder?.order?.id;
        if (createdId) {
          saveOrderIdForUser(user, createdId);
        }

        setCart([]);
        setTableNumber('');
        setCheckoutMessage(`Pesanan (${orderType}) berhasil dikirim ke dapur!`);
        setOrdersSubTab('history');
        await fetchOrders(user);
      }
    } catch (err) {
      console.error('Checkout gagal:', err);
    }
  };

  // 4c & 4d: Validasi harga > 0 dan dukungan status draft/arsip/published
  const handleAddMenu = async (e) => {
    e.preventDefault();
    const numericPrice = Number(newMenu.price);
    if (!newMenu.name.trim()) {
      showAdminNotification('Nama menu wajib diisi.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showAdminNotification('Harga menu harus lebih dari Rp 0.');
      return;
    }

    const payload = {
      ...newMenu,
      name: newMenu.name.trim(),
      price: numericPrice,
      status: newMenu.status || 'published',
      is_available:
        (newMenu.status || 'published') === 'published' ? true : false,
    };

    try {
      const res = await fetch(`${API_URL}/api/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewMenu({
          name: '',
          description: '',
          price: '',
          category: 'Makanan Berat',
          image_url: '',
          is_featured: false,
          status: 'published',
        });
        showAdminNotification('Menu baru berhasil ditambahkan.');
        await fetchMenus('Semua', '', 'admin');
      }
    } catch (err) {
      console.error('Gagal menambah menu:', err);
    }
  };

  // 4c & 4d: Edit data menu (nama, deskripsi, harga > 0, kategori, gambar, status)
  const handleUpdateMenu = async (menuId, updatedFields) => {
    const numericPrice = Number(updatedFields.price);
    if (!String(updatedFields.name || '').trim()) {
      showAdminNotification('Nama menu tidak boleh kosong.');
      return false;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showAdminNotification('Harga menu harus lebih dari Rp 0.');
      return false;
    }

    const nextStatus = updatedFields.status || 'published';
    const payload = {
      ...updatedFields,
      name: String(updatedFields.name).trim(),
      price: numericPrice,
      status: nextStatus,
      is_available:
        nextStatus === 'published'
          ? Boolean(updatedFields.is_available ?? true)
          : false,
    };

    try {
      const res = await fetch(`${API_URL}/api/menus/${menuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showAdminNotification(`Menu "${payload.name}" berhasil diperbarui.`);
        await fetchMenus('Semua', '', 'admin');
        return true;
      }
    } catch (err) {
      console.error('Gagal mengedit menu:', err);
    }

    setMenus((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, ...payload } : m))
    );
    showAdminNotification(`Menu "${payload.name}" diperbarui secara lokal.`);
    return true;
  };

  // 4d: Ubah status menu (published / draft / archived)
  const handleChangeMenuStatus = async (item, nextStatus) => {
    const payload = {
      status: nextStatus,
      is_available: nextStatus === 'published' ? Boolean(item.is_available) : false,
    };

    try {
      const res = await fetch(`${API_URL}/api/menus/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showAdminNotification(`Status "${item.name}" diubah ke ${nextStatus}.`);
        await fetchMenus('Semua', '', 'admin');
        return;
      }
    } catch (err) {
      console.error('Gagal mengubah status menu:', err);
    }

    setMenus((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, ...payload } : m))
    );
  };

  const handleToggleMenuAvailable = async (item) => {
    await fetch(`${API_URL}/api/menus/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !item.is_available }),
    });
    fetchMenus('Semua', '', 'admin');
  };

  const handleDeleteMenu = async (id) => {
    await fetch(`${API_URL}/api/menus/${id}`, { method: 'DELETE' });
    showAdminNotification('Menu berhasil dihapus.');
    fetchMenus('Semua', '', 'admin');
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders(user);
  };

  if (showCover) {
    return (
      <div className="min-h-screen bg-[#FDF2C5] flex items-center justify-center p-5 md:p-8">
        <div className="w-full max-w-md md:max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#EFECE6] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <img
            src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80"
            alt="THE KitcheN BY NADIE Cover"
            className="w-full h-56 md:h-72 object-cover rounded-2xl border border-[#EFECE6]"
          />

          <div className="text-center md:text-left space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-[#EBF0FA] text-[#284EA5] text-xs font-semibold px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Signature Kitchen
            </span>

            <BrandLogo size="lg" className="mx-auto md:mx-0" />

            <p className="text-sm text-[#6B7280]">
              Hangat &amp; fresh langsung dari dapur. Menuju halaman masuk &amp; daftar akun...
            </p>

            <button
              type="button"
              onClick={() => setShowCover(false)}
              className="w-full bg-[#284EA5] text-white font-semibold py-3 px-6 rounded-full hover:opacity-95 transition cursor-pointer text-sm"
            >
              Lanjut ke Login / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginError={loginError}
        loginLoading={loginLoading}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  if (user.role === 'admin') {
    return (
      <>
        {adminToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1E2532] text-white text-xs md:text-sm font-medium px-4 py-3 rounded-2xl shadow-lg border border-white/10">
            {adminToast}
          </div>
        )}
        <AdminView
          user={user}
          menus={menus}
          orders={orders}
          newMenu={newMenu}
          setNewMenu={setNewMenu}
          onLogout={handleLogout}
          onAddMenu={handleAddMenu}
          onUpdateMenu={handleUpdateMenu}
          onChangeMenuStatus={handleChangeMenuStatus}
          onToggleMenuAvailable={handleToggleMenuAvailable}
          onDeleteMenu={handleDeleteMenu}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </>
    );
  }

  if (selectedMenu) {
    return (
      <>
        {favToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 md:right-6 md:left-auto md:translate-x-0 z-50 w-[92%] max-w-md md:w-auto md:max-w-sm bg-[#1E2532] text-white text-xs md:text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 border border-white/10">
            <Heart className="w-4 h-4 fill-[#FDF2C5] text-[#FDF2C5] shrink-0" />
            <span className="leading-snug">{favToast}</span>
          </div>
        )}
        <MenuDetailView
          selectedMenu={selectedMenu}
          detailQty={detailQty}
          setDetailQty={setDetailQty}
          note={detailNote}
          setNote={setDetailNote}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
          onClose={() => {
            setSelectedMenu(null);
            setDetailQty(1);
            setDetailNote('');
          }}
          onAddToCartAndGoOrders={(item, qty, noteText) => {
            addToCart(item, qty, noteText, false);
            setSelectedMenu(null);
            setDetailQty(1);
            setDetailNote('');
            setActiveTab('orders');
            setOrdersSubTab('cart');
          }}
        />
      </>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetailView
        selectedOrder={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {favToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 md:right-6 md:left-auto md:translate-x-0 z-50 w-[92%] max-w-md md:w-auto md:max-w-sm bg-[#1E2532] text-white text-xs md:text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 border border-white/10">
          <Heart className="w-4 h-4 fill-[#FDF2C5] text-[#FDF2C5] shrink-0" />
          <span className="leading-snug">{favToast}</span>
        </div>
      )}

      {cartToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 md:right-6 md:left-auto md:translate-x-0 z-50 w-[92%] max-w-md md:w-auto md:max-w-sm bg-[#284EA5] text-white text-xs md:text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 border border-[#FDF2C5]/30">
          <CheckCircle2 className="w-4 h-4 text-[#FDF2C5] shrink-0" />
          <span className="leading-snug">{cartToast}</span>
        </div>
      )}

      <div className="max-w-md md:max-w-5xl mx-auto bg-[#FAF9F6] min-h-screen relative">
        <header
          className={`bg-[#FDF2C5] px-4 md:px-7 pt-4 ${
            activeTab === 'home'
              ? 'pb-2'
              : 'pb-5 md:pb-6 rounded-b-[2rem] border-b border-[#EFECE6]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {activeTab !== 'home' && <BrandLogo size="md" className="mb-2" />}
              <p className="text-sm md:text-lg text-[#6B7280] truncate">
                Halo, <strong className="text-[#1E2532] font-bold">{user.name}</strong>!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('orders');
                setOrdersSubTab('cart');
              }}
              className="relative bg-white p-2.5 md:px-4 md:py-2.5 rounded-full border border-[#EFECE6] shadow-2xs cursor-pointer flex items-center gap-2 shrink-0"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#284EA5]" />
              <span className="hidden md:inline text-xs md:text-sm font-semibold text-[#1E2532]">
                Keranjang
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#284EA5] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'home' && (
            <HomeTab
              menus={menus}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                fetchMenus(cat, searchQuery, user.role);
                setActiveTab('menu');
              }}
              onSelectMenu={(item) => {
                setDetailNote('');
                setSelectedMenu(item);
              }}
              onGoMenu={() => setActiveTab('menu')}
            />
          )}

          {activeTab === 'menu' && (
            <MenuTab
              menus={menus}
              loadingMenus={loadingMenus}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              isFavorited={isFavorited}
              onSearchChange={(val) => {
                setSearchQuery(val);
                fetchMenus(selectedCategory, val, user.role);
              }}
              onCategoryChange={(cat) => {
                setSelectedCategory(cat);
                fetchMenus(cat, searchQuery, user.role);
              }}
              onSelectMenu={(item) => {
                setDetailNote('');
                setSelectedMenu(item);
              }}
              onToggleFavorite={toggleFavorite}
              onAddToCart={(item, qty) => addToCart(item, qty, '', true)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              cart={cart}
              cartCount={cartCount}
              cartTotal={cartTotal}
              orders={orders}
              loadingOrders={loadingOrders}
              ordersSubTab={ordersSubTab}
              setOrdersSubTab={setOrdersSubTab}
              customerName={customerName}
              setCustomerName={setCustomerName}
              orderType={orderType}
              setOrderType={setOrderType}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              checkoutMessage={checkoutMessage}
              onUpdateCartQty={updateCartQty}
              onUpdateCartNote={updateCartNote}
              onInspectCartItem={(item) => {
                setDetailQty(item.quantity || 1);
                setDetailNote(item.note || '');
                setSelectedMenu(item);
              }}
              onCheckout={handleCheckout}
              onOpenHistory={() => {
                setOrdersSubTab('history');
                fetchOrders(user);
              }}
              onSelectOrder={setSelectedOrder}
              onGoMenu={() => setActiveTab('menu')}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesTab
              favorites={favorites}
              onSelectMenu={(item) => {
                setDetailNote('');
                setSelectedMenu(item);
              }}
              onToggleFavorite={toggleFavorite}
              onGoMenu={() => setActiveTab('menu')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
            />
          )}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}