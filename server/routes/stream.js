import express from 'express';
import { client } from '../utils/telegram.js';
import { Api } from 'telegram';
import bigInt from 'big-integer';
import { Readable } from 'stream';

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

    // Set headers immediately to tell the browser "We are ready!"
    res.status(206).set({
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${start + CHUNK_SIZE - 1}/*`, // Estimated range
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const streamFromTelegram = async (ref) => {
      const iter = client.iterDownload({
        file: await getDocument(ref),
        offset: bigInt(start),
        limit: bigInt(CHUNK_SIZE),
        requestSize: 64 * 1024 // Small 64KB internal chunks for instant data flow
      });

      for await (const chunk of iter) {
        if (!res.writableEnded) {
          res.write(chunk);
        }
      }
      res.end();
    };

    try {
      await streamFromTelegram(fileReference);
    } catch (error) {
      // SELF-HEALING: If link expired, try refreshing
      if ((error.errorMessage === 'FILE_REFERENCE_EXPIRED' || error.errorMessage === 'FILE_REFERENCE_INVALID') && mid && pid) {
       
        const [msg] = await client.getMessages(pid, { ids: [parseInt(mid)] });
        if (msg?.media?.document) {
          const freshRef = msg.media.document.fileReference.toString('hex');
          await streamFromTelegram(freshRef);
        }
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Stream Error:', error.message);
    if (!res.headersSent) res.status(500).send("Streaming error");
    else res.end();
  }
});

export default router;
