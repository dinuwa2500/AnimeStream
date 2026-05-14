import express from 'express';
import { client } from '../utils/telegram.js';
import { Api } from 'telegram';
import bigInt from 'big-integer';

const router = express.Router();

router.get('/:fileId/:accessHash/:fileReference', async (req, res) => {
  let { fileId, accessHash, fileReference } = req.params;
  const { mid, pid } = req.query;
  const range = req.headers.range;

  const getDocument = async (ref) => {
    return new Api.InputDocumentFileLocation({
      id: bigInt(fileId),
      accessHash: bigInt(accessHash),
      fileReference: Buffer.from(ref, 'hex'),
      thumbSize: ""
    });
  };

  try {
    const start = range ? parseInt(range.replace(/bytes=/, "").split("-")[0], 10) : 0;
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

    let buffer;
    try {
      buffer = await client.downloadFile(await getDocument(fileReference), {
        offset: bigInt(start),
        limit: CHUNK_SIZE,
      });
    } catch (error) {
      if ((error.errorMessage === 'FILE_REFERENCE_EXPIRED' || error.errorMessage === 'FILE_REFERENCE_INVALID') && mid && pid) {
        const [msg] = await client.getMessages(pid, { ids: [parseInt(mid)] });
        if (msg?.media?.document) {
          fileReference = msg.media.document.fileReference.toString('hex');
          buffer = await client.downloadFile(await getDocument(fileReference), {
            offset: bigInt(start),
            limit: CHUNK_SIZE,
          });
        }
      } else {
        throw error;
      }
    }

    if (!buffer) return res.status(404).send("Not found");

    // Important: Browsers need the Content-Range header to be very specific
    const end = start + buffer.length - 1;
    
    res.status(206).set({
      'Content-Type': 'video/mp4', // Most browsers will try to decode this
      'Accept-Ranges': 'bytes',
      'Content-Length': buffer.length,
      'Content-Range': `bytes ${start}-${end}/*`,
      'Cache-Control': 'no-cache'
    }).send(buffer);

  } catch (error) {
    console.error('Stream Error:', error.message);
    if (!res.headersSent) res.status(500).send("Streaming error");
  }
});

export default router;
