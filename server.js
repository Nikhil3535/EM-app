import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import client from 'prom-client';

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// 📊 PROMETHEUS METRICS INIT
// ===============================
client.collectDefaultMetrics();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Internal ELB (PRIVATE - only accessible inside VPC)
const BACKEND_URL = 'http://localhost:8080';

// Middleware
app.use(express.json());

// ===============================
// 🔁 PROXY LAYER (FIXED)
// ===============================
app.use('/api', async (req, res) => {
  try {
    // ✅ Remove /api prefix before forwarding
    const backendPath = req.originalUrl.replace(/^\/api/, '');
    const targetUrl = `${BACKEND_URL}${backendPath}`;

    console.log(`➡️ ${req.method} ${req.originalUrl} → ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',

        // Forward auth headers if needed
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        })
      },
      timeout: 10000
    });

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('❌ Proxy Error:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);

    } else if (error.request) {
      res.status(504).json({
        message: 'Backend not responding (timeout)'
      });

    } else {
      res.status(500).json({
        message: 'Internal proxy error'
      });
    }
  }
});

// ===============================
// 📊 PROMETHEUS METRICS ROUTE
// ===============================
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());

  } catch (error) {
    console.error('❌ Metrics Error:', error.message);
    res.status(500).end(error);
  }
});

// ===============================
// 🌐 SERVE FRONTEND (React build)
// ===============================
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'frontend', 'build', 'index.html')
  );
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
