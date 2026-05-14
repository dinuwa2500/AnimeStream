import mongoose from 'mongoose';

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  posterUrl: { type: String, required: true },
  bannerUrl: { type: String },
  rating: { type: Number, default: 0 },
  episodes: { type: Number, default: 0 },
  status: { type: String, enum: ['Ongoing', 'Finished'], default: 'Ongoing' },
  genres: [{ type: String }],
  releaseDate: { type: Date },
  type: { type: String, enum: ['TV', 'Movie', 'OVA'], default: 'TV' },
  dubAvailable: { type: Boolean, default: false },
  subAvailable: { type: Boolean, default: true },
  seasons: [{
    seasonNumber: { type: Number, required: true },
    title: { type: String },
    episodes: [{
      episodeNumber: { type: Number, required: true },
      title: { type: String, required: true },
      videoUrl: { type: String }, // For legacy or other hosts
      telegram: {
        fileId: { type: String },
        accessHash: { type: String },
        fileReference: { type: String },
        messageId: { type: Number },
        peerId: { type: String }
      },
      duration: { type: String },
      thumbnailUrl: { type: String },
    }]
  }],
}, { timestamps: true });

const Anime = mongoose.model('Anime', animeSchema);
export default Anime;
