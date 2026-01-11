const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET semua pasien
router.get("/", (req, res) => {
  db.query("SELECT * FROM patients ORDER BY patient_id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST tambah pasien
router.post("/", (req, res) => {
  const {
    nama_lengkap,
    nik,
    tanggal_lahir,
    jenis_kelamin,
    alamat,
    no_telepon,
    email,
    golongan_darah
  } = req.body;

  const sql = `
    INSERT INTO patients
    (nama_lengkap, nik, tanggal_lahir, jenis_kelamin, alamat, no_telepon, email, golongan_darah)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nama_lengkap, nik, tanggal_lahir, jenis_kelamin, alamat, no_telepon, email, golongan_darah],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Pasien berhasil ditambahkan" });
    }
  );
});

// DELETE pasien - INI YANG PERLU DITAMBAHKAN
router.delete("/:id", (req, res) => {
  const patientId = req.params.id;
  
  console.log('Menghapus pasien dengan ID:', patientId);
  
  const sql = `DELETE FROM patients WHERE patient_id = ?`;
  
  db.query(sql, [patientId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: 'Database error',
        message: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Pasien tidak ditemukan' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Pasien berhasil dihapus' 
    });
  });
});

module.exports = router;