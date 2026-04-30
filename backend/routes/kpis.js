const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/kpis/revenue
// Returns monthly revenue and profit margins for the last 6 months
router.get('/revenue', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(st.transaction_date, '%Y-%m') AS month,
        SUM(st.total_revenue) AS total_revenue,
        SUM(st.total_revenue) - SUM(st.quantity_sold * p.unit_price) AS total_profit,
        ROUND(
          ((SUM(st.total_revenue) - SUM(st.quantity_sold * p.unit_price)) / SUM(st.total_revenue)) * 100,
          2
        ) AS profit_margin_pct
      FROM Sales_Transactions st
      JOIN Products p ON st.product_id = p.product_id
      GROUP BY DATE_FORMAT(st.transaction_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // Current month summary
    const currentMonth = rows.length > 0 ? rows[rows.length - 1] : null;
    const previousMonth = rows.length > 1 ? rows[rows.length - 2] : null;

    let percentChange = null;
    if (currentMonth && previousMonth && previousMonth.total_revenue > 0) {
      percentChange = (
        ((currentMonth.total_revenue - previousMonth.total_revenue) / previousMonth.total_revenue) * 100
      ).toFixed(1);
    }

    res.json({
      monthly: rows,
      current: currentMonth,
      percentChange,
    });
  } catch (err) {
    console.error('Revenue query error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// GET /api/kpis/low-stock
// Returns products where current_stock is below low_stock_threshold
router.get('/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.name,
        c.category_name,
        i.current_stock,
        i.low_stock_threshold,
        i.last_updated
      FROM Inventory i
      JOIN Products p ON i.product_id = p.product_id
      JOIN Categories c ON p.category_id = c.category_id
      WHERE i.current_stock < i.low_stock_threshold
      ORDER BY (i.current_stock / i.low_stock_threshold) ASC
    `);

    res.json({
      count: rows.length,
      items: rows,
    });
  } catch (err) {
    console.error('Low stock query error:', err);
    res.status(500).json({ error: 'Failed to fetch low stock data' });
  }
});

// GET /api/kpis/top-products
// Returns best-selling products by total quantity sold
router.get('/top-products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.name,
        c.category_name,
        SUM(st.quantity_sold) AS total_units_sold,
        SUM(st.total_revenue) AS total_revenue
      FROM Sales_Transactions st
      JOIN Products p ON st.product_id = p.product_id
      JOIN Categories c ON p.category_id = c.category_id
      GROUP BY p.product_id, p.name, c.category_name
      ORDER BY total_units_sold DESC
      LIMIT 10
    `);

    res.json({
      topProduct: rows.length > 0 ? rows[0] : null,
      rankings: rows,
    });
  } catch (err) {
    console.error('Top products query error:', err);
    res.status(500).json({ error: 'Failed to fetch top products data' });
  }
});

module.exports = router;
