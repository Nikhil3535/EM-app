import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Internal ELB (PRIVATE - only accessible inside VPC)
const BACKEND_URL = 'http://internal-a3c53ec3847c14313982790c3fb5d9b2-1575810271.us-east-2.elb.amazonaws.com';

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
        // forward auth headers if needed
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
      res.status(504).json({ message: 'Backend not responding (timeout)' });
    } else {
      res.status(500).json({ message: 'Internal proxy error' });
    }
  }
});

// ===============================
// 🌐 SERVE FRONTEND (React build)
// ===============================
app.use(express.static(path.join(__dirname, 'build')));

// React routing fallback (important for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});