// /server/routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');

router.get('/', settingsController.getSettings);
router.post('/', settingsController.saveSettings);

module.exports = router;
