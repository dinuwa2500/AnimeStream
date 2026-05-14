import express from 'express';
import multer from 'multer';
import { client, initTelegram } from '../utils/telegram.js';
import fs from 'fs';

const router = express.Router();

// Setup Multer for temporary storage (Vercel compatible)
const upload = multer({ dest: '/tmp' });

router.post('/', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  try {
    console.log(`📤 Sending "${req.file.originalname}" to Telegram...`);
    
    const result = await client.sendFile("me", {
      file: req.file.path,
      caption: `Upload: ${req.file.originalname}`,
      workers: 4, // Increased workers for speed
      progressCallback: (progress) => {
        const percent = Math.round(progress * 100);
        process.stdout.write(`\r🚀 Telegram Upload Progress: ${percent}%`);
      }
    });
    console.log("\n✅ Done!");

    // Cleanup local file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      fileId: result.media.document.id.toString(),
      accessHash: result.media.document.accessHash.toString(),
      fileReference: result.media.document.fileReference.toString('hex'),
      messageId: result.id,
      peerId: result.peerId.userId ? result.peerId.userId.toString() : result.peerId.channelId.toString()
    });

  } catch (error) {
    console.error('Telegram Upload Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
