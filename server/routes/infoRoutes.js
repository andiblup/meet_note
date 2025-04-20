// /server/routes/infoRoutes.js

const express = require('express');
const router = express.Router();
const getRealLocalIp = require('../utils/getRealLocalIp');

router.get('/', (req, res) => {
  const PORT = process.env.PORT || 6060;
  const ip = getRealLocalIp();

  res.json({
    ip,
    port: PORT,
    status: 'online',
    version: '0.0.1' // optional aus package.json laden später
  });
});

module.exports = router;
