const express = require('express');
const { EmergencyContact } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const records = await EmergencyContact.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await EmergencyContact.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const record = await EmergencyContact.create({ ...req.body, userId: req.user.id });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const record = await EmergencyContact.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    await record.update(req.body);
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await EmergencyContact.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    await record.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
