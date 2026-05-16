
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.DOODSTREAM_API_KEY;
const API_BASE = 'https://doodapi.com/api';

/**
 * DoodStream Keep-Alive Bot
 * This script fetches all files from your DoodStream account and "pings" their embed URLs
 * to prevent automatic deletion due to inactivity (30 days no views).
 */

async function startBot() {
    if (!API_KEY) {
        console.error('❌ Error: DOODSTREAM_API_KEY not found in .env');
        return;
    }

    console.log('🚀 DoodStream Keep-Alive Bot Started');
    console.log('📅 Time:', new Date().toLocaleString());

    try {
        // 1. Fetch total number of files/pages
        console.log('📡 Fetching file list from DoodStream...');
        const listRes = await axios.get(`${API_BASE}/file/list?key=${API_KEY}`);
        
        if (listRes.data.status !== 200) {
            throw new Error(`API Error: ${listRes.data.msg}`);
        }

        const totalPages = listRes.data.result.total_pages || 1;
        let allFiles = [];

        // 2. Iterate through all pages
        for (let page = 1; page <= totalPages; page++) {
            console.log(`📖 Fetching page ${page}/${totalPages}...`);
            const pageRes = await axios.get(`${API_BASE}/file/list?key=${API_KEY}&page=${page}`);
            if (pageRes.data.status === 200) {
                allFiles = allFiles.concat(pageRes.data.result.files);
            }
        }

        console.log(`✅ Found ${allFiles.length} files in total.`);

        if (allFiles.length === 0) {
            console.log('ℹ️ No files found to ping.');
            return;
        }

        // 3. Ping each file's embed URL
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < allFiles.length; i++) {
            const file = allFiles[i];
            const fileCode = file.file_code;
            
            // DoodStream uses many domains, try a few common ones
            const domains = ['doodstream.com', 'd0000d.com', 'dood.to', 'dood.so', 'dood.wf'];
            let pinged = false;

            process.stdout.write(`\r🔄 Progress: ${i + 1}/${allFiles.length} | Ping: ${fileCode}... `);

            for (const domain of domains) {
                const embedUrl = `https://${domain}/e/${fileCode}`;
                try {
                    // Extra activity: Fetch file info via API
                    await axios.get(`${API_BASE}/file/info?key=${API_KEY}&file_code=${fileCode}`);

                    // Simulate view
                    await axios.get(embedUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Referer': 'https://google.com'
                        },
                        timeout: 5000
                    });
                    pinged = true;
                    break; // Success!
                } catch (err) {
                    // Try next domain
                }
            }

            if (pinged) {
                successCount++;
            } else {
                failCount++;
                // console.log(`\n❌ All domains failed for ${fileCode}`);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n\n✨ Bot Execution Finished!');
        console.log(`📊 Total Files: ${allFiles.length}`);
        console.log(`✅ Successfully Pinged: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log('💡 Note: This bot refreshes the "last viewed" status by visiting the embed page.');

    } catch (error) {
        console.error('\n❌ Bot crashed:', error.message);
    }
}

// Run the bot if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startBot();
}

export { startBot };
