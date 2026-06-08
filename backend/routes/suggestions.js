const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/suggestions — admin sees all, viewer sees only their own
router.get('/', async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'super') {
      query = `
        SELECT s.suggestion_id, s.title, s.description, s.created_at,
               u.name AS submitted_by_name, u.email AS submitted_by_email
        FROM Suggestions s
        JOIN Users u ON s.submitted_by = u.user_id
        ORDER BY s.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT s.suggestion_id, s.title, s.description, s.created_at,
               u.name AS submitted_by_name, u.email AS submitted_by_email
        FROM Suggestions s
        JOIN Users u ON s.submitted_by = u.user_id
        WHERE s.submitted_by = ?
        ORDER BY s.created_at DESC
      `;
      params = [req.user.userId];
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Suggestions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// POST /api/suggestions — any logged-in user can submit
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO Suggestions (title, description, submitted_by) VALUES (?, ?, ?)',
      [title.trim(), description.trim(), req.user.userId]
    );

    res.status(201).json({
      suggestion_id: result.insertId,
      message: 'Suggestion submitted successfully',
    });
  } catch (err) {
    console.error('Suggestion create error:', err);
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
});

// DELETE /api/suggestions/:id — admin only
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'super') {
      return res.status(403).json({ error: 'Only admins can delete suggestions' });
    }

    const [result] = await pool.query(
      'DELETE FROM Suggestions WHERE suggestion_id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Suggestion not found' });
    res.json({ message: 'Suggestion deleted' });
  } catch (err) {
    console.error('Suggestion delete error:', err);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

module.exports = router;
