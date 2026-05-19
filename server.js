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

// Custom HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Custom HTTP Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// ===============================
// 📁 FIX __dirname FOR ES MODULES
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// 🔗 BACKEND SERVICE (K8S DNS)
// ===============================
const BACKEND_URL = 'http://backend-service';

// ===============================
// 🔧 MIDDLEWARE
// ===============================
app.use(express.json());

// ===============================
// 📊 REQUEST METRICS MIDDLEWARE
// ===============================
app.use((req, res, next) => {

  const start = Date.now();

  res.on('finish', () => {

    const duration = (Date.now() - start) / 1000;

    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.path,
        status: res.statusCode,
      },
      duration
    );
  });

  next();
});

// ===============================
// 🔁 API PROXY
// ===============================
app.use('/api', async (req, res) => {

  try {

    // Remove /api prefix
    const backendPath = req.originalUrl.replace(/^\/api/, '');

    const targetUrl = `${BACKEND_URL}${backendPath}`;

    console.log(
      `➡️ ${req.method} ${req.originalUrl} → ${targetUrl}`
    );

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',

        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
      timeout: 10000,
    });

    res.status(response.status).json(response.data);

  } catch (error) {

    console.error('❌ Proxy Error:', error.message);

    if (error.response) {

      return res.status(error.response.status).json(
        error.response.data
      );
    }

    if (error.request) {

      return res.status(504).json({
        message: 'Backend not responding',
      });
    }

    return res.status(500).json({
      message: 'Internal proxy error',
    });
  }
});

// ===============================
// 📊 PROMETHEUS METRICS ROUTE
// ===============================
app.get('/metrics', async (req, res) => {

  try {

    res.set(
      'Content-Type',
      client.register.contentType
    );

    res.end(await client.register.metrics());

  } catch (error) {

    console.error(
      '❌ Metrics Error:',
      error.message
    );

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
// ⚛️ REACT CATCH-ALL ROUTE
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

  console.log(
    `✅ Frontend server running on port ${PORT}`
  );

  console.log(
    `📊 Metrics available at /metrics`
  );
});