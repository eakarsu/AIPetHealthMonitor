const express = require('express');
const { Pet } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(pets);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json(pet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pet = await Pet.create({ ...req.body, userId: req.user.id });
    res.status(201).json(pet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    await pet.update(req.body);
    res.json(pet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    await pet.destroy();
    res.json({ message: 'Pet deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
