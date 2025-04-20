// /server/routes/notesRoutes.js

const express = require('express');
const router = express.Router();
const notesController = require('../controller/notesController');

// File CRUD
router.get('/', notesController.getAllFiles);
router.get('/:id', notesController.getFile);
router.post('/', notesController.createFile);
router.post('/rename', notesController.renameFile);
router.delete('/:id', notesController.deleteFile);

// Notes inside files - Erweiterbar später

module.exports = router;
