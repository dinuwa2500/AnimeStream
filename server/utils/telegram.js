import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from 'dotenv';

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

// Create a SINGLE client instance
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 3, // Reduced from 5 to fail faster on bad connections
  useWSS: false, // Direct TCP is faster and consumes less memory than WebSockets
  requestRetries: 3,
  timeout: 10000, // 10 second connection timeout to prevent hanging on Vercel
});

// Disable GramJS verbose background logging (Saves I/O performance)
client.setLogLevel("none");

let isInitializing = false;

async function initTelegram() {
  // If already connected, do nothing
  if (client.connected) {
    return client;
  }

  // If another request is already initializing, wait a bit
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return client;
  }

  try {
    isInitializing = true;
  
    
    // Use start() with no arguments because the session string handles the login
    await client.start({
      phoneNumber: async () => "", // Not needed for StringSession
      password: async () => "",    // Not needed for StringSession
      phoneCode: async () => "",   // Not needed for StringSession
      onError: (err) => console.error("GramJS Error:", err.message),
    });
    
   
    return client;
  } catch (error) {
    console.error("❌ Telegram Connection Failed:", error.message);
    // If it's a duplication error, we just ignore it if we are already connected
    if (!error.message.includes('AUTH_KEY_DUPLICATED')) {
      throw error;
    }
  } finally {
    isInitializing = false;
  }
}

export { client, initTelegram };
