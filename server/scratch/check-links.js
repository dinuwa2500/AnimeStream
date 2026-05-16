
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const animeSchema = new mongoose.Schema({
  title: String,
  seasons: [{
    episodes: [{
      videoUrl: String
    }]
  }]
});

const Anime = mongoose.model('Anime', animeSchema);

async function checkDoodstream() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const animes = await Anime.find({});
    let doodCount = 0;
    const doodLinks = [];

    animes.forEach(anime => {
      anime.seasons?.forEach(season => {
        season.episodes?.forEach(episode => {
          if (episode.videoUrl && episode.videoUrl.includes('dood')) {
            doodCount++;
            doodLinks.push(episode.videoUrl);
          }
        });
      });
    });

    console.log(`Found ${doodCount} DoodStream links.`);
    if (doodLinks.length > 0) {
      console.log('Sample link:', doodLinks[0]);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDoodstream();
