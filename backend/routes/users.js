const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, requireSuper } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users — list all users (any authenticated user)
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, name, email, role, is_protected, created_at FROM Users ORDER BY created_at ASC'
    );
    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users — create a new user (super only)
router.post('/', requireSuper, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const validRole = role === 'super' ? 'super' : 'viewer';
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Users (name, email, password, role, is_protected) VALUES (?, ?, ?, ?, FALSE)',
      [name, email, hashedPassword, validRole]
    );

    res.status(201).json({
      user_id: result.insertId,
      name,
      email,
      role: validRole,
      is_protected: false,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// DELETE /api/users/:id — delete a user (super only, cannot delete protected)
router.delete('/:id', requireSuper, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is protected
    const [users] = await pool.query(
      'SELECT is_protected FROM Users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].is_protected) {
      return res.status(403).json({ error: 'Cannot delete the protected super user' });
    }

    await pool.query('DELETE FROM Users WHERE user_id = ?', [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT /api/users/:id/role — update user role (super only, cannot modify protected)
router.put('/:id/role', requireSuper, async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !['super', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (super/normal) is required' });
    }

    const [users] = await pool.query(
      'SELECT is_protected FROM Users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].is_protected) {
      return res.status(403).json({ error: 'Cannot modify the protected super user' });
    }

    await pool.query('UPDATE Users SET role = ? WHERE user_id = ?', [role, userId]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

module.exports = router;
