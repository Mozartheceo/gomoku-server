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

// Route simple de test
app.get('/api', (req, res) => {
  res.json({ message: 'API Gomoku active !' });
});

// Création du serveur HTTP et initialisation de Socket.IO
const server = http.createServer(app);
setupSocket(server, pool);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
