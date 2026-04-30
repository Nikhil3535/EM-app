// server.js

import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Internal ELB (PRIVATE - only accessible inside VPC)
const BACKEND_URL = 'http://internal-a1f176012278247ea82c5ca72a1b58a1-600785892.us-east-2.elb.amazonaws.com';

// Middleware
app.use(express.json());

// ===============================
// 🔁 PROXY LAYER
// ===============================
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `${BACKEND_URL}${req.originalUrl}`;

    console.log(`Proxying: ${req.method} ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('❌ Proxy Error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal proxy error' });
    }
  }
});

// ===============================
// 🌐 SERVE FRONTEND (React build)
// ===============================
app.use(express.static(path.join(__dirname, 'build')));

// React routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});