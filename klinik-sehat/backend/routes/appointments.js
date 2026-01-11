const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET ALL APPOINTMENTS
router.get('/', (req, res) => {
  const sql = `
    SELECT
      a.appointment_id,
      p.nama_lengkap AS patient,
      d.nama_lengkap AS doctor,
      a.tanggal_janji,
      a.waktu_mulai,
      a.waktu_selesai,
      a.keluhan,
      a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN doctors d ON a.doctor_id = d.doctor_id
    ORDER BY a.tanggal_janji DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// CREATE APPOINTMENT
router.post('/', (req, res) => {
  const {
    patient_id,
    doctor_id,
    tanggal_janji,
    waktu_mulai,
    waktu_selesai,
    keluhan,
    status
  } = req.body;

  const sql = `
    INSERT INTO appointments
    (patient_id, doctor_id, tanggal_janji, waktu_mulai, waktu_selesai, keluhan, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [patient_id, doctor_id, tanggal_janji, waktu_mulai, waktu_selesai, keluhan, status],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }
      res.json({ message: 'Appointment berhasil ditambahkan' });
    }
  );
});

// DELETE APPOINTMENT
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM appointments WHERE appointment_id = ?`;
  db.query(sql, [req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Appointment berhasil dihapus' });
  });
});

module.exports = router;
