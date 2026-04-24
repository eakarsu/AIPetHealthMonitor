// Generic CRUD route factory for pet-related models
const express = require('express');
const auth = require('../middleware/auth');
const { Pet } = require('../models');

function createCrudRouter(Model, ownerField = 'petId') {
  const router = express.Router();
  router.use(auth);

  // Get all records for a pet
  router.get('/pet/:petId', async (req, res) => {
    try {
      const pet = await Pet.findOne({ where: { id: req.params.petId, userId: req.user.id } });
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      const records = await Model.findAll({ where: { petId: req.params.petId }, order: [['createdAt', 'DESC']] });
      res.json(records);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // Get single record
  router.get('/:id', async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      res.json(record);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // Create
  router.post('/', async (req, res) => {
    try {
      const record = await Model.create(req.body);
      res.status(201).json(record);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // Update
  router.put('/:id', async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      await record.update(req.body);
      res.json(record);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // Delete
  router.delete('/:id', async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      await record.destroy();
      res.json({ message: 'Record deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
}

module.exports = createCrudRouter;
