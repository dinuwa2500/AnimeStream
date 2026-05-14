import { client, initTelegram } from "./utils/telegram.js";
import fs from "fs";

async function test() {
  try {
    await initTelegram();
    console.log("🚀 Telegram connected...");

    const fileName = "test.mp4";
    
    // Check if file exists
    if (!fs.existsSync(fileName)) {
      console.log(`❌ Error: ${fileName} not found!`);
      console.log("Please put a small video named 'test.mp4' in the server folder.");
      process.exit(1);
    }

    console.log("📤 Uploading test file to 'Saved Messages'...");
    
    const result = await client.sendFile("me", {
      file: `./${fileName}`,
      caption: "Test Upload for AnimeStream",
      workers: 1, // Keep it simple for testing
    });

    console.log("\n✅ UPLOAD SUCCESSFUL!");
    console.log("-----------------------------------------");
    console.log("Save these values to test your stream:");
    console.log(`FILE_ID: ${result.media.document.id.toString()}`);
    console.log(`ACCESS_HASH: ${result.media.document.accessHash.toString()}`);
    console.log(`FILE_REFERENCE: ${result.media.document.fileReference.toString('hex')}`);
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  }
}

test();
