import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const router = express.Router();

// Setup Multer for temporary storage
const upload = multer({ dest: '/tmp' });

router.post('/', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  try {
    const apiKey = process.env.DOODSTREAM_API_KEY;
    if (!apiKey) throw new Error('DoodStream API Key not found in .env');

    console.log(`📤 Sending "${req.file.originalname}" to DoodStream...`);
    
    // 1. Get the upload server
    const serverCheckUrl = `https://doodapi.com/api/upload/server?key=${apiKey}`;
    console.log(`🔍 Checking upload server: ${serverCheckUrl}`);
    
    const serverRes = await axios.get(serverCheckUrl);
    console.log("📡 DoodStream API Response:", JSON.stringify(serverRes.data));

    if (!serverRes.data || !serverRes.data.result) {
        throw new Error(`DoodStream API Error: ${serverRes.data?.msg || 'Could not get upload server URL'}`);
    }
    const uploadUrl = serverRes.data.result;

    // 2. Prepare the form
    const form = new FormData();
    form.append('api_key', apiKey);
    
    const safeName = req.file.originalname.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "_");
    const fileStats = fs.statSync(req.file.path);
    const totalSize = fileStats.size;
    let uploadedSize = 0;

    const fileStream = fs.createReadStream(req.file.path);
    
    // Log progress to terminal
    fileStream.on('data', (chunk) => {
        uploadedSize += chunk.length;
        const percent = ((uploadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`\r🚀 DoodStream Upload: ${percent}% [${(uploadedSize / 1024 / 1024).toFixed(2)}MB / ${(totalSize / 1024 / 1024).toFixed(2)}MB]`);
    });

    form.append('file', fileStream, {
        filename: safeName,
        contentType: req.file.mimetype,
        knownLength: totalSize // Very important for progress tracking
    });
    
    // 3. Upload to DoodStream
    

    const uploadRes = await new Promise((resolve, reject) => {
        const reqOpts = {
            method: 'POST',
            timeout: 600000 // 10 minutes
        };

        const submitRequest = form.submit(`${uploadUrl}?${apiKey}`, (err, response) => {
            if (err) return reject(err);
            
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ data: parsed });
                } catch (e) {
                    console.error("DoodStream Raw Response:", data);
                    reject(new Error("DoodStream sent an invalid response (not JSON)"));
                }
            });
        });

        submitRequest.on('error', (err) => {
            reject(err);
        });
    });

   

    // Cleanup local file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (uploadRes.data && uploadRes.data.status === 200) {
      console.log("✅ DoodStream Upload Done!");
      const videoInfo = uploadRes.data.result[0];
      res.json({
        success: true,
        embedUrl: videoInfo.protected_embed || `https://doodstream.com/e/${videoInfo.filecode}`,
        fileCode: videoInfo.filecode,
        title: videoInfo.title
      });
    } else {
      throw new Error(uploadRes.data?.msg || 'DoodStream upload failed');
    }

  } catch (error) {
    console.error('DoodStream Upload Error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
