import express from 'express';
import { client } from '../utils/telegram.js';
import { Api } from 'telegram';
import bigInt from 'big-integer';
import { initTelegram } from '../utils/telegram.js';

const router = express.Router();

// Memory cache to prevent hammering Telegram API on every scrub
const metadataCache = new Map();

router.get('/:fileId/:accessHash/:fileReference', async (req, res) => {
  await initTelegram();
  let { fileId, accessHash, fileReference } = req.params;
  const { mid, pid } = req.query;
  const range = req.headers.range;

  try {
    // 1. Resolve the file and get its TOTAL SIZE first
    let finalFileId = fileId;
    let finalAccessHash = accessHash;
    let finalFileRef = fileReference;
    let totalSize = 0;

    if (mid && pid) {
      const cacheKey = `${pid}_${mid}`;
      const cached = metadataCache.get(cacheKey);

      if (cached && cached.expires > Date.now()) {
        finalFileId = cached.id;
        finalAccessHash = cached.accessHash;
        finalFileRef = cached.fileReference;
        totalSize = cached.size;
      } else {
        try {
          let peer = pid;
          if (!pid.startsWith('-')) peer = `-100${pid}`;
          const [msg] = await client.getMessages(peer, { ids: [parseInt(mid)] });
          if (msg?.media?.document) {
            finalFileId = msg.media.document.id;
            finalAccessHash = msg.media.document.accessHash;
            finalFileRef = msg.media.document.fileReference;
            totalSize = msg.media.document.size.toJSNumber ? msg.media.document.size.toJSNumber() : msg.media.document.size;
            
            // Cache for 1 hour
            metadataCache.set(cacheKey, {
              id: finalFileId,
              accessHash: finalAccessHash,
              fileReference: finalFileRef,
              size: totalSize,
              expires: Date.now() + 60 * 60 * 1000 
            });
          }
        } catch (e) {
          console.error("Peer fetch failed", e.message);
        }
      }
    }

    const requestedStart = range ? parseInt(range.replace(/bytes=/, "").split("-")[0], 10) : 0;
    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB
    const end = Math.min(requestedStart + CHUNK_SIZE - 1, totalSize > 0 ? totalSize - 1 : requestedStart + CHUNK_SIZE - 1);
    const actualChunkSize = end - requestedStart + 1;

    // Telegram alignment
    const offset = Math.floor(requestedStart / 4096) * 4096;
    const skip = requestedStart - offset;

    res.status(206).set({
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${requestedStart}-${end}/${totalSize || '*'}`,
      'Content-Length': actualChunkSize,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });

    const streamFromTelegram = async () => {
      const iter = client.iterDownload({
        file: new Api.InputDocumentFileLocation({
          id: bigInt(finalFileId),
          accessHash: bigInt(finalAccessHash),
          fileReference: Buffer.isBuffer(finalFileRef) ? finalFileRef : Buffer.from(finalFileRef, 'hex'),
          thumbSize: ""
        }),
        offset: bigInt(offset),
        limit: bigInt(actualChunkSize + skip),
        requestSize: 512 * 1024 // Increased to 512KB for massive speed boost
      });

      let bytesSent = 0;
      let firstChunk = true;

      for await (const chunk of iter) {
        if (res.writableEnded || bytesSent >= actualChunkSize) break;

        let data = chunk;
        if (firstChunk) {
          data = chunk.slice(skip);
          firstChunk = false;
        }

        const remaining = actualChunkSize - bytesSent;
        if (data.length > remaining) {
          data = data.slice(0, remaining);
        }

        res.write(data);
        bytesSent += data.length;
      }
      res.end();
    };

    await streamFromTelegram();

  } catch (error) {
    console.error('Stream Error:', error.message);
    if (!res.headersSent) res.status(500).send("Streaming error");
    else res.end();
  }
});

export default router;
