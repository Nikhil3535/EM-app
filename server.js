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

// ===============================
// 🔗 KUBERNETES BACKEND SERVICE
// ===============================
const BACKEND_URL = 'http://backend-service:80';

// ===============================
// 🧩 MIDDLEWARE
// ===============================
app.use(express.json());

// ===============================
// 🔁 API PROXY
// ===============================
app.use('/api', async (req, res) => {
  try {

    // Forward original API path
    const targetUrl = `${BACKEND_URL}${req.originalUrl}`;

    console.log(`➡️ ${req.method} ${req.originalUrl} → ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',

        // Forward auth header if present
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        })
      },
      timeout: 10000
    });

    res.status(response.status).json(response.data);

  } catch (error) {

    console.error('❌ Proxy Error:', error.message);

    // Backend returned error response
    if (error.response) {

      console.error('❌ Backend Response:', error.response.data);

      res.status(error.response.status).json(
        error.response.data
      );

    // Backend unreachable / timeout
    } else if (error.request) {

      res.status(504).json({
        message: 'Backend not responding'
      });

    // Internal proxy failure
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
// 🌐 SERVE REACT BUILD
// ===============================
app.use(
  express.static(
    path.join(__dirname, 'frontend', 'build')
  )
);

// ===============================
// 🌍 REACT ROUTER SUPPORT
// ===============================
app.get('*', (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      'frontend',
      'build',
      'index.html'
    )
  );
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {

  console.log(`✅ Server running on port ${PORT}`);

  console.log(`🔗 Backend URL: ${BACKEND_URL}`);

});