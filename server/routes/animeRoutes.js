import express from 'express';
import Anime from '../models/Anime.js';

const router = express.Router();

// Get all anime
router.get('/', async (req, res) => {
  try {
    const animes = await Anime.find().sort({ createdAt: -1 });
    res.json(animes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single anime by ID
router.get('/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an anime (Admin only - for now just basic)
router.post('/', async (req, res) => {
  const anime = new Anime(req.body);
  try {
    const newAnime = await anime.save();
    res.status(201).json(newAnime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an anime
router.patch('/:id', async (req, res) => {
  try {
    const updatedAnime = await Anime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAnime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an anime
router.delete('/:id', async (req, res) => {
  try {
    await Anime.findByIdAndDelete(req.params.id);
    res.json({ message: 'Anime deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
