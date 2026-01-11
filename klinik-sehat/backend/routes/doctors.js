const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* =========================
   GET ALL DOCTORS
========================= */
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      doctor_id,
      nama_lengkap,
      spesialisasi,
      no_telepon,
      email,
      biaya_konsultasi
    FROM doctors
    ORDER BY doctor_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* =========================
   CREATE DOCTOR
========================= */
router.post('/', (req, res) => {
  const {
    nama_lengkap,
    spesialisasi,
    no_str,
    no_telepon,
    email,
    biaya_konsultasi
  } = req.body;

  const sql = `
    INSERT INTO doctors
    (nama_lengkap, spesialisasi, no_str, no_telepon, email, biaya_konsultasi)
    VALUES (?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      nama_lengkap,
      spesialisasi,
      no_str || null,
      no_telepon || null,
      email || null,
      biaya_konsultasi
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Doctor berhasil ditambahkan' });
    }
  );
});

/* =========================
   DELETE DOCTOR
========================= */
router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM doctors WHERE doctor_id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Doctor dihapus' });
    }
  );
});

module.exports = router;
