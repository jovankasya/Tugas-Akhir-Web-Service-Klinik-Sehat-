const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET obat
router.get('/', (req, res) => {
  db.query('SELECT * FROM medicines', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST obat
router.post('/', (req, res) => {
    const { name, stock } = req.body;
    
    console.log('Data obat diterima:', req.body);
    
    if (!name || stock === undefined) {
        return res.status(400).json({ error: 'Nama dan stok wajib diisi' });
    }
    
    db.query(
        'INSERT INTO medicines (name, stock) VALUES (?, ?)',
        [name, parseInt(stock) || 0],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ 
                success: true,
                message: 'Medicine added successfully',
                medicine_id: result.insertId 
            });
        }
    );
});
// DELETE obat
router.delete('/:id', (req, res) => {
    const medicineId = req.params.id;
    
    console.log('Menghapus obat dengan ID:', medicineId);
    
    db.query(
        'DELETE FROM medicines WHERE id = ?',
        [medicineId],
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
                    error: 'Obat tidak ditemukan' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Obat berhasil dihapus' 
            });
        }
    );
});
module.exports = router;