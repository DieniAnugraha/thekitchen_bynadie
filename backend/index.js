import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Peringatan: SUPABASE_URL atau SUPABASE_KEY belum diatur di file .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'The Kitchen by Nadie API is running' });
});

// ==================== AUTH & PROFILE ====================
app.post('/api/register', async (req, res) => {
  try {
    const { name, username, phone = '', password, role = 'customer' } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Nama, username, dan password wajib diisi.' });
    }

    const cleanName = String(name).trim();
    const cleanUsername = String(username).trim();
    const cleanPhone = String(phone || '').trim();
    const safeRole = role === 'admin' ? 'admin' : 'customer';

    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ error: checkError.message });
    }

    if (existing) {
      return res.status(409).json({ error: 'Username sudah digunakan.' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: cleanName,
          username: cleanUsername,
          phone: cleanPhone,
          password: String(password),
          role: safeRole,
        },
      ])
      .select('id, name, username, phone, role, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Error POST /api/register:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const cleanUsername = String(username).trim();

    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, phone, password, role, created_at')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.password !== String(password)) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const { password: _, ...safeUser } = data;
    return res.json(safeUser);
  } catch (err) {
    console.error('Error POST /api/login:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Nama tidak boleh kosong.' });
    }

    const updateFields = { name: String(name).trim() };
    if (phone !== undefined) {
      updateFields.phone = String(phone).trim();
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .select('id, name, username, phone, role, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Error PUT /api/users/:id:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// ==================== MENUS ====================
app.get('/api/menus', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = supabase
      .from('menus')
      .select('*')
      .order('created_at', { ascending: true });

    if (category && category !== 'Semua') {
      query = query.eq('category', category);
    }

    if (search && String(search).trim()) {
      query = query.ilike('name', `%${String(search).trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error('Error GET /api/menus:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/menus', async (req, res) => {
  try {
    const { name, description, price, category, image_url, is_featured } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: 'Nama, harga, dan kategori wajib diisi.' });
    }

    const { data, error } = await supabase
      .from('menus')
      .insert([
        {
          name: String(name).trim(),
          description: description ? String(description).trim() : '',
          price: Number(price),
          category: String(category).trim(),
          image_url:
            image_url && String(image_url).trim()
              ? String(image_url).trim()
              : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
          is_available: true,
          is_featured: Boolean(is_featured),
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Error POST /api/menus:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.put('/api/menus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('menus')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Error PUT /api/menus/:id:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.delete('/api/menus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('menus').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, message: 'Menu berhasil dihapus.' });
  } catch (err) {
    console.error('Error DELETE /api/menus/:id:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// ==================== ORDERS & CATATAN MAKANAN ====================
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error('Error GET /api/orders:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, table_number, total_price, items } = req.body;

    if (!customer_name || !table_number || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Data pesanan atau item keranjang tidak lengkap.' });
    }

    const computedTotal =
      total_price !== undefined && total_price !== null
        ? Number(total_price)
        : items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: String(customer_name).trim(),
          table_number: String(table_number).trim(),
          total_price: computedTotal,
          status: 'Diproses',
        },
      ])
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ error: orderError.message });
    }

    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      menu_id: item.id || null,
      menu_name: String(item.name || item.menu_name || 'Menu'),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      note: item.note ? String(item.note).trim() : '',
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)
      .select();

    if (itemsError) {
      return res.status(500).json({ error: itemsError.message });
    }

    return res.status(201).json({
      ...order,
      order_items: insertedItems || [],
    });
  } catch (err) {
    console.error('Error POST /api/orders:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status pesanan wajib diisi.' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: String(status).trim() })
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Error PATCH /api/orders/:id/status:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});