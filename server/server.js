// server.js - point d'entrée du serveur Gomoku avec PostgreSQL et Socket.IO
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Pool } = require('pg');
const setupSocket = require('./socket');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à la base PostgreSQL Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Route pour visualiser les parties enregistrées
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération des parties :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Création du serveur HTTP et initialisation de Socket.IO
const server = http.createServer(app);
setupSocket(server, pool);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
