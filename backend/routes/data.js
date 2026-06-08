const express = require('express');
const pool = require('../config/db');
const { requireSuper } = require('../middleware/auth');

const router = express.Router();

// ════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════

// GET /api/data/categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories ORDER BY category_id');
    res.json(rows);
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/data/categories (super only)
router.post('/categories', requireSuper, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const [result] = await pool.query(
      'INSERT INTO Categories (category_name, description) VALUES (?, ?)',
      [category_name.trim(), description?.trim() || null]
    );
    res.status(201).json({ category_id: result.insertId, category_name: category_name.trim(), description: description?.trim() || null });
  } catch (err) {
    console.error('Category create error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/data/categories/:id (super only)
router.put('/categories/:id', requireSuper, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const [result] = await pool.query(
      'UPDATE Categories SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name.trim(), description?.trim() || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category updated' });
  } catch (err) {
    console.error('Category update error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/data/categories/:id (super only)
router.delete('/categories/:id', requireSuper, async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT COUNT(*) AS count FROM Products WHERE category_id = ?', [req.params.id]
    );
    if (products[0].count > 0) {
      return res.status(409).json({
        error: `Cannot delete: ${products[0].count} product(s) belong to this category. Remove or reassign them first.`
      });
    }
    const [result] = await pool.query('DELETE FROM Categories WHERE category_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Category delete error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════

// GET /api/data/products
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.product_id, p.name, p.category_id, c.category_name, p.unit_price
      FROM Products p
      JOIN Categories c ON p.category_id = c.category_id
      ORDER BY p.product_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/data/products (super only) — also creates inventory record
router.post('/products', requireSuper, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, category_id, unit_price, initial_stock, low_stock_threshold } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Product name is required' });
    if (!category_id) return res.status(400).json({ error: 'Category is required' });
    if (unit_price === undefined || unit_price === null || isNaN(unit_price) || Number(unit_price) < 0) {
      return res.status(400).json({ error: 'Valid unit price is required (>= 0)' });
    }

    // Verify category exists
    const [cats] = await conn.query('SELECT category_id FROM Categories WHERE category_id = ?', [category_id]);
    if (cats.length === 0) return res.status(400).json({ error: 'Invalid category' });

    await conn.beginTransaction();

    const [productResult] = await conn.query(
      'INSERT INTO Products (name, category_id, unit_price) VALUES (?, ?, ?)',
      [name.trim(), category_id, Number(unit_price)]
    );

    const stock = Math.max(0, parseInt(initial_stock) || 0);
    const threshold = Math.max(1, parseInt(low_stock_threshold) || 10);

    await conn.query(
      'INSERT INTO Inventory (product_id, current_stock, low_stock_threshold) VALUES (?, ?, ?)',
      [productResult.insertId, stock, threshold]
    );

    await conn.commit();
    res.status(201).json({ product_id: productResult.insertId, name: name.trim() });
  } catch (err) {
    await conn.rollback();
    console.error('Product create error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  } finally {
    conn.release();
  }
});

// PUT /api/data/products/:id (super only)
router.put('/products/:id', requireSuper, async (req, res) => {
  try {
    const { name, category_id, unit_price } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Product name is required' });
    if (!category_id) return res.status(400).json({ error: 'Category is required' });
    if (unit_price === undefined || isNaN(unit_price) || Number(unit_price) < 0) {
      return res.status(400).json({ error: 'Valid unit price is required (>= 0)' });
    }

    const [cats] = await pool.query('SELECT category_id FROM Categories WHERE category_id = ?', [category_id]);
    if (cats.length === 0) return res.status(400).json({ error: 'Invalid category' });

    const [result] = await pool.query(
      'UPDATE Products SET name = ?, category_id = ?, unit_price = ? WHERE product_id = ?',
      [name.trim(), category_id, Number(unit_price), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/data/products/:id (super only) — also removes inventory
router.delete('/products/:id', requireSuper, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [sales] = await conn.query(
      'SELECT COUNT(*) AS count FROM Sales_Transactions WHERE product_id = ?', [req.params.id]
    );
    if (sales[0].count > 0) {
      return res.status(409).json({
        error: `Cannot delete: ${sales[0].count} sales transaction(s) reference this product. Remove them first.`
      });
    }

    await conn.beginTransaction();
    await conn.query('DELETE FROM Inventory WHERE product_id = ?', [req.params.id]);
    const [result] = await conn.query('DELETE FROM Products WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }
    await conn.commit();
    res.json({ message: 'Product and its inventory deleted' });
  } catch (err) {
    await conn.rollback();
    console.error('Product delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  } finally {
    conn.release();
  }
});

// ════════════════════════════════════════
// INVENTORY
// ════════════════════════════════════════

// GET /api/data/inventory
router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.inventory_id, i.product_id, p.name AS product_name, c.category_name,
             i.current_stock, i.low_stock_threshold, i.last_updated
      FROM Inventory i
      JOIN Products p ON i.product_id = p.product_id
      JOIN Categories c ON p.category_id = c.category_id
      ORDER BY i.inventory_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Inventory fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// PUT /api/data/inventory/:id (super only) — update stock levels
router.put('/inventory/:id', requireSuper, async (req, res) => {
  try {
    const { current_stock, low_stock_threshold } = req.body;

    if (current_stock === undefined || isNaN(current_stock) || Number(current_stock) < 0) {
      return res.status(400).json({ error: 'Valid stock quantity is required (>= 0)' });
    }
    if (low_stock_threshold === undefined || isNaN(low_stock_threshold) || Number(low_stock_threshold) < 1) {
      return res.status(400).json({ error: 'Valid threshold is required (>= 1)' });
    }

    const [result] = await pool.query(
      'UPDATE Inventory SET current_stock = ?, low_stock_threshold = ? WHERE inventory_id = ?',
      [parseInt(current_stock), parseInt(low_stock_threshold), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inventory record not found' });
    res.json({ message: 'Inventory updated' });
  } catch (err) {
    console.error('Inventory update error:', err);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// ════════════════════════════════════════
// SALES TRANSACTIONS
// ════════════════════════════════════════

// GET /api/data/sales
router.get('/sales', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        st.transaction_id, st.product_id,
        p.name AS product_name, c.category_name,
        p.unit_price AS cost_price,
        st.quantity_sold, st.sale_price AS retail_price,
        st.total_revenue, st.transaction_date
      FROM Sales_Transactions st
      JOIN Products p ON st.product_id = p.product_id
      JOIN Categories c ON p.category_id = c.category_id
      ORDER BY st.transaction_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Sales fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// POST /api/data/sales (super only) — create sale and deduct inventory
router.post('/sales', requireSuper, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { product_id, quantity_sold, sale_price, transaction_date } = req.body;

    if (!product_id) return res.status(400).json({ error: 'Product is required' });
    if (!quantity_sold || isNaN(quantity_sold) || Number(quantity_sold) < 1) {
      return res.status(400).json({ error: 'Valid quantity is required (>= 1)' });
    }
    if (!sale_price || isNaN(sale_price) || Number(sale_price) <= 0) {
      return res.status(400).json({ error: 'Valid sale price is required (> 0)' });
    }

    // Verify product exists
    const [products] = await conn.query('SELECT product_id, unit_price FROM Products WHERE product_id = ?', [product_id]);
    if (products.length === 0) return res.status(400).json({ error: 'Invalid product' });

    // Check inventory
    const [inv] = await conn.query('SELECT inventory_id, current_stock FROM Inventory WHERE product_id = ?', [product_id]);
    if (inv.length > 0 && inv[0].current_stock < Number(quantity_sold)) {
      return res.status(409).json({
        error: `Insufficient stock. Available: ${inv[0].current_stock}, Requested: ${quantity_sold}`
      });
    }

    const qty = parseInt(quantity_sold);
    const price = Number(sale_price);
    const total_revenue = qty * price;
    const date = transaction_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO Sales_Transactions (product_id, quantity_sold, sale_price, total_revenue, transaction_date) VALUES (?, ?, ?, ?, ?)',
      [product_id, qty, price, total_revenue, date]
    );

    // Deduct from inventory
    if (inv.length > 0) {
      await conn.query(
        'UPDATE Inventory SET current_stock = current_stock - ? WHERE product_id = ?',
        [qty, product_id]
      );
    }

    await conn.commit();
    res.status(201).json({ transaction_id: result.insertId, total_revenue });
  } catch (err) {
    await conn.rollback();
    console.error('Sale create error:', err);
    res.status(500).json({ error: 'Failed to record sale' });
  } finally {
    conn.release();
  }
});

// DELETE /api/data/sales/:id (super only) — does NOT restore inventory
router.delete('/sales/:id', requireSuper, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Sales_Transactions WHERE transaction_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Sale delete error:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
