import express from 'express';
import { client } from '../utils/telegram.js';
import { Api } from 'telegram';
import bigInt from 'big-integer';

const router = express.Router();

router.get('/:fileId/:accessHash/:fileReference', async (req, res) => {
  let { fileId, accessHash, fileReference } = req.params;
  const { mid, pid } = req.query; // Healing parameters
  const range = req.headers.range;

  const download = async (ref) => {
    const start = range ? parseInt(range.replace(/bytes=/, "").split("-")[0], 10) : 0;
    const CHUNK_SIZE = 1024 * 1024;
    
    return await client.downloadFile(
      new Api.InputDocumentFileLocation({
        id: bigInt(fileId),
        accessHash: bigInt(accessHash),
        fileReference: Buffer.from(ref, 'hex'),
        thumbSize: ""
      }),
      { offset: bigInt(start), limit: CHUNK_SIZE }
    );
  };

  try {
    let buffer;
    try {
      buffer = await download(fileReference);
    } catch (error) {
      // SELF-HEALING: If link expired or invalid, fetch fresh metadata from Telegram
      if ((error.errorMessage === 'FILE_REFERENCE_EXPIRED' || error.errorMessage === 'FILE_REFERENCE_INVALID') && mid && pid) {
        console.log("♻️ Link invalid/expired. Refreshing from Telegram...");
        const [msg] = await client.getMessages(pid, { ids: [parseInt(mid)] });
        if (msg && msg.media && msg.media.document) {
          const freshRef = msg.media.document.fileReference.toString('hex');
          buffer = await download(freshRef); // Retry
        } else {
          throw new Error("Could not find source message to refresh link");
        }
      } else {
        throw error;
      }
    }

    if (!buffer) {
      if (!res.headersSent) res.status(404).send("File not found");
      return;
    }

    res.status(206).set({
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Content-Length': buffer.length,
      'Connection': 'keep-alive',
      'Content-Range': `bytes ${range ? range.replace(/bytes=/, "").split("-")[0] : 0}-${parseInt(range ? range.replace(/bytes=/, "").split("-")[0] : 0) + buffer.length - 1}/*`
    }).send(buffer);

  } catch (error) {
    console.error('Stream Error:', error.errorMessage || error.message);
    if (!res.headersSent) {
      res.status(500).send(error.errorMessage || 'Streaming failed');
    }
  }
});

export default router;
