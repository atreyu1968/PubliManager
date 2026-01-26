
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
app.use(bodyParser.json({ limit: '100mb' }));

// Inicializar SQLite con reintentos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('CRITICAL: Error abriendo SQLite:', err.message);
    process.exit(1);
  } else {
    console.log('--- ASD BACKEND ACTIVE ---');
    console.log(`Database connected: ${DB_PATH}`);
  }
});

// Inicialización de esquema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS application_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creando tabla:", err);
  });
});

// Rutas API
app.get('/api/data', (req, res) => {
  db.get("SELECT data FROM application_data WHERE id = 1", (err, row) => {
    if (err) {
      console.error("DB GET ERROR:", err);
      return res.status(500).json({ error: "Error de lectura en base de datos" });
    }
    if (!row) {
      console.log("No data found, returning null");
      return res.json(null);
    }
    try {
      res.json(JSON.parse(row.data));
    } catch (e) {
      res.status(500).json({ error: "Datos corruptos en base de datos" });
    }
  });
});

app.post('/api/data', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: "Cuerpo de solicitud inválido" });
  }

  const data = JSON.stringify(req.body);
  db.run(`INSERT INTO application_data (id, data, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`, 
    [data], 
    function(err) {
      if (err) {
        console.error("DB SAVE ERROR:", err);
        return res.status(500).json({ error: "Error de escritura en servidor" });
      }
      console.log(`Data saved successfully at ${new Date().toISOString()}`);
      res.json({ success: true });
    }
  );
});

// Servir Frontend
const DIST_PATH = path.join(__dirname, 'dist');
app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ASD escuchando en: http://localhost:${PORT}`);
});
