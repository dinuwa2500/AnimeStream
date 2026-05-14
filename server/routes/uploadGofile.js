import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const router = express.Router();

// Setup Multer for temporary storage (Vercel compatible)
const upload = multer({ dest: '/tmp' });

router.post('/', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  try {
    console.log(`📤 Sending "${req.file.originalname}" to Gofile...`);
    
    // 1. Get the best server (Optional, but good for reliability)
    let server = 'upload'; // Default to global
    try {
      const serverRes = await axios.get('https://api.gofile.io/servers');
      if (serverRes.data.status === 'ok' && serverRes.data.data.servers.length > 0) {
        server = serverRes.data.data.servers[0].name;
      }
    } catch (e) {
      console.log("Using default global upload server...");
    }

    // 2. Prepare the form
    const form = new FormData();
    const fileStats = fs.statSync(req.file.path);
    const totalSize = fileStats.size;
    let uploadedSize = 0;

    const fileStream = fs.createReadStream(req.file.path);

    // Log progress to terminal
    fileStream.on('data', (chunk) => {
      uploadedSize += chunk.length;
      const percent = ((uploadedSize / totalSize) * 100).toFixed(2);
      process.stdout.write(`\r🚀 Gofile Upload: ${percent}% [${(uploadedSize / 1024 / 1024).toFixed(2)}MB / ${(totalSize / 1024 / 1024).toFixed(2)}MB]`);
    });

    form.append('file', fileStream, {
        knownLength: totalSize
    });
    
    // 3. Upload to Gofile
    console.log(`\n🚀 Starting binary upload to: ${server}.gofile.io`);
    const uploadRes = await axios.post(`https://${server}.gofile.io/uploadFile`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.GOFILE_TOKEN}`,
        'Content-Length': form.getLengthSync()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    console.log("\n✅ Gofile Upload Finished!");

    // Cleanup local file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (uploadRes.data.status === 'ok') {
      console.log("✅ Gofile Upload Done!");
      res.json({
        success: true,
        downloadPage: uploadRes.data.data.downloadPage,
        fileId: uploadRes.data.data.fileId,
        fileName: uploadRes.data.data.fileName
      });
    } else {
      throw new Error(uploadRes.data.status || 'Upload failed');
    }

  } catch (error) {
    console.error('Gofile Upload Error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
