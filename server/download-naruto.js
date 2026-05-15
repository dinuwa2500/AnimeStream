import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';

const START_EPISODE = 1;
const END_EPISODE = 200;
const RESOLUTION = '720';
const SERIES_NAME = 'naruto';
const BASE_URL = `https://hlsxst1.burntburst45.store/${SERIES_NAME}`;
const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');

// Ensure the downloads directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
}

async function getDuration(m3u8Url, headers) {
  return new Promise((resolve) => {
    const ffmpeg = spawn(ffmpegStatic, ['-headers', headers, '-i', m3u8Url]);
    let output = '';
    ffmpeg.stderr.on('data', (data) => {
      output += data.toString();
    });
    ffmpeg.on('close', () => {
      const match = output.match(/Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (match) {
        resolve(parseTimeToSeconds(match[1]));
      } else {
        resolve(null);
      }
    });
  });
}

async function downloadEpisode(episodeNumber) {
  const m3u8Url = `${BASE_URL}/${episodeNumber}/${RESOLUTION}/index.m3u8`;
  const outputFile = path.join(DOWNLOAD_DIR, `Naruto_Episode_${episodeNumber}.mp4`);

  if (fs.existsSync(outputFile)) {
    console.log(`Episode ${episodeNumber} already downloaded. Skipping...`);
    return;
  }

  console.log(`\n--- Episode ${episodeNumber} ---`);
  
  const headers = [
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Referer: https://aniwaves.ru/",
    "Origin: https://aniwaves.ru"
  ].join("\r\n") + "\r\n";

  const duration = await getDuration(m3u8Url, headers);
  if (!duration) {
    console.log(`Could not determine duration for Episode ${episodeNumber}. Progress will be shown in time.`);
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-headers', headers,
      '-reconnect', '1',
      '-reconnect_at_eof', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', m3u8Url,
      '-c', 'copy',
      '-y', // Overwrite if exists
      outputFile
    ];

    const ffmpeg = spawn(ffmpegStatic, args);

    ffmpeg.stderr.on('data', (data) => {
      const line = data.toString();
      
      // Log errors if they appear
      if (line.includes('Error') || line.includes('Failed')) {
        console.error(`\n[FFmpeg Error] ${line.trim()}`);
      }

      const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (timeMatch) {
        const currentTime = parseTimeToSeconds(timeMatch[1]);
        if (duration) {
          let percent = ((currentTime / duration) * 100);
          if (percent > 100) percent = 100;
          process.stdout.write(`\rDownload Progress: ${percent.toFixed(2)}% (${timeMatch[1]} / ${secondsToTime(duration)})`);
        } else {
          process.stdout.write(`\rDownloaded: ${timeMatch[1]}`);
        }
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        if (duration) {
          process.stdout.write(`\rDownload Progress: 100.00% (${secondsToTime(duration)} / ${secondsToTime(duration)})`);
        }
        process.stdout.write(`\n✅ Episode ${episodeNumber} completed!\n`);
        resolve();
      } else {
        console.error(`\n❌ Failed Episode ${episodeNumber} (Exit code: ${code})`);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

function secondsToTime(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toFixed(2).padStart(5, '0');
  return `${h}:${m}:${s}`;
}

async function main() {
  console.log(`Starting bulk download for Naruto episodes ${START_EPISODE} to ${END_EPISODE}...`);
  
  for (let i = START_EPISODE; i <= END_EPISODE; i++) {
    try {
      await downloadEpisode(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      // Continue to next episode even if one fails
    }
  }
  
  console.log("\nAll downloads finished!");
}

main().catch(console.error);
