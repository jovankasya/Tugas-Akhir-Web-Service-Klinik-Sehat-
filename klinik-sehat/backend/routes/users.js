const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET user
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST user
router.post('/', (req, res) => {
  const { username, role } = req.body;
  db.query(
    'INSERT INTO users (username, role) VALUES (?, ?)',
    [username, role],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ 
        message: 'User berhasil ditambahkan',
        id: result.insertId 
      });
    }
  );
});

// DELETE user - INI YANG PERLU DITAMBAHKAN
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  
  console.log('Menghapus user dengan ID:', userId);
  
  db.query(
    'DELETE FROM users WHERE id = ?',
    [userId],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          error: 'Database error',
          message: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'User tidak ditemukan' 
        });
      }
      
      res.json({ 
        success: true,
        message: 'User berhasil dihapus' 
      });
    }
  );
});

module.exports = router;