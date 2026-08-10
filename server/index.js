import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing.js";
import { initTelegram } from './utils/telegram.js';
import streamRoutes from './routes/stream.js';
import jwt from 'jsonwebtoken';
import compression from 'compression';

import animeRoutes from './routes/animeRoutes.js';
import uploadTelegram from './routes/uploadTelegram.js';
import uploadGofile from './routes/uploadGofile.js';
import uploadDoodstream from './routes/uploadDoodstream.js';
import Visitor from './models/Visitor.js';
import Anime from './models/Anime.js';
import { startBot } from './utils/doodstream-bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Database Connection Optimization for Serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Don't hang if connection fails!
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB Connection Error:', e);
    throw e;
  }

  return cached.conn;
};

// Ensure DB is connected before handling any requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// UploadThing Route
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);



// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const token = req.headers['admin-token'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_PASSWORD);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Login Route
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    // Generate a JWT token that lasts for 24 hours
    const token = jwt.sign({ admin: true }, process.env.ADMIN_PASSWORD, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Anime Routes
app.use('/api/animes', (req, res, next) => {
  // Allow GET requests for everyone, protect everything else
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
}, animeRoutes);

app.use('/api/upload-telegram', adminAuth, uploadTelegram);
app.use('/api/upload-gofile', adminAuth, uploadGofile);
app.use('/api/upload-doodstream', adminAuth, uploadDoodstream);

// Use the stream routes (Public)
app.use('/api/stream', streamRoutes);


// Visitor Tracking Logic
app.post('/api/stats/track', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  try {
    // Basic IP check to avoid duplicates too frequently
    let visitor = await Visitor.findOne({ ip });
    
    if (visitor) {
      visitor.visitCount += 1;
      visitor.lastVisit = new Date();
      await visitor.save();
      return res.json({ message: 'Visit updated' });
    }

    // New visitor - get geo data
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

    visitor = new Visitor({
      ip,
      country: geoData.country || 'Unknown',
      countryCode: geoData.countryCode || '??',
      city: geoData.city || 'Unknown'
    });

    await visitor.save();
    res.json({ message: 'Visit logged' });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Stats Retrieval (Protected)
app.get('/api/stats', async (req, res) => {
  const password = req.headers['x-stats-password'];
  if (password !== process.env.STATS_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const visitors = await Visitor.find().sort({ lastVisit: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health Check Endpoints
const healthCheck = (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV || 'development'
  };
  res.json(status);
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// SEO Dynamic Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
`User-agent: *
Allow: /
Disallow: /admin
Disallow: /stats
Disallow: /api/

Sitemap: https://animezstream.netlify.app/sitemap.xml`
  );
});

// SEO Dynamic Sitemap.xml
app.get(['/sitemap.xml', '/api/sitemap.xml'], async (req, res) => {
  try {
    const animes = await Anime.find({}, 'slug _id updatedAt').lean();
    const baseUrl = 'https://animezstream.netlify.app';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Anime pages
    animes.forEach(item => {
      const slugOrId = item.slug || item._id;
      const lastMod = item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/anime/${slugOrId}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Background initialization
initTelegram().catch(err => console.error("Telegram init failed:", err));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  });
}

export default app;