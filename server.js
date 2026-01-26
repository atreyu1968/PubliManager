
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Inicializar SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Error abriendo SQLite:', err.message);
  else console.log('Conectado a SQLite en Servidor.');
});

// Crear tabla de datos si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS application_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Obtener datos
app.get('/api/data', (req, res) => {
  db.get("SELECT data FROM application_data WHERE id = 1", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json(null);
    res.json(JSON.parse(row.data));
  });
});

// Guardar datos
app.post('/api/data', (req, res) => {
  const data = JSON.stringify(req.body);
  db.run(`INSERT OR REPLACE INTO application_data (id, data, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)`, 
    [data], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor ASD activo en puerto ${PORT}`);
});
