const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// إنشاء تطبيق Express
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));  // لتقديم ملفات HTML و CSS و JS

// فتح قاعدة البيانات (أو إنشائها إذا لم تكن موجودة)
const db = new sqlite3.Database(':memory:');

// إنشاء جدول الأعضاء مع كافة الحقول
db.serialize(() => {
  db.run(`
    CREATE TABLE members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      national_id TEXT NOT NULL UNIQUE,
      spouse_name TEXT,
      spouse_national_id TEXT,
      phone_number TEXT,
      family_members INTEGER,
      males INTEGER,
      females INTEGER,
      under_3_years INTEGER,
      from_3_to_5_years INTEGER,
      males_under_16 INTEGER,
      females_under_16 INTEGER,
      males_above_16 INTEGER
    )
  `);
});

// مسار لإضافة عضو
app.post('/members', (req, res) => {
  const { name, national_id, spouse_name, spouse_national_id, phone_number, family_members, males, females, under_3_years, from_3_to_5_years, males_under_16, females_under_16, males_above_16 } = req.body;

  const stmt = db.prepare(`
    INSERT INTO members (name, national_id, spouse_name, spouse_national_id, phone_number, family_members, males, females, under_3_years, from_3_to_5_years, males_under_16, females_under_16, males_above_16)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(name, national_id, spouse_name, spouse_national_id, phone_number, family_members, males, females, under_3_years, from_3_to_5_years, males_under_16, females_under_16, males_above_16, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Data added successfully', id: this.lastID });
  });

  stmt.finalize();
});

// مسار لاسترجاع الأعضاء
app.get('/members', (req, res) => {
  db.all('SELECT * FROM members', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// مسار لحذف عضو
app.delete('/members/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM members WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Data deleted successfully' });
  });
});

// مسار لتحديث عضو
app.put('/members/:id', (req, res) => {
  const { id } = req.params;
  const { name, national_id, spouse_name, spouse_national_id, phone_number, family_members, males, females, under_3_years, from_3_to_5_years, males_under_16, females_under_16, males_above_16 } = req.body;

  const stmt = db.prepare(`
    UPDATE members
    SET name = ?, national_id = ?, spouse_name = ?, spouse_national_id = ?, phone_number = ?, family_members = ?, males = ?, females = ?, under_3_years = ?, from_3_to_5_years = ?, males_under_16 = ?, females_under_16 = ?, males_above_16 = ?
    WHERE id = ?
  `);

  stmt.run(name, national_id, spouse_name, spouse_national_id, phone_number, family_members, males, females, under_3_years, from_3_to_5_years, males_under_16, females_under_16, males_above_16, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Data updated successfully' });
  });

  stmt.finalize();
});

// بدء الخادم على المنفذ 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
