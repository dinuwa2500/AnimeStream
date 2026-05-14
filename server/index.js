import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing.js";
import { initTelegram } from './utils/telegram.js';
import streamRoutes from './routes/stream.js';

import animeRoutes from './routes/animeRoutes.js';
import uploadTelegram from './routes/uploadTelegram.js';
import Visitor from './models/Visitor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// UploadThing Route
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);

// Anime Routes
app.use('/api/animes', animeRoutes);
app.use('/api/upload-telegram', uploadTelegram);
// Use the stream routes
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

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

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

// Background initialization
initTelegram().catch(err => console.error("Telegram init failed:", err));

export default app;