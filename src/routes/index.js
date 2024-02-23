const express = require('express');
const router = express.Router();

/**
 * GET /
 */
router.get('/', (req, res) => res.sendFile('public/index.html', { root: '.' }));

router.get('/create', (req, res) => res.sendFile('public/create.html', { root: '.' }));

router.get('/send', (req, res) => res.sendFile('public/send.html', { root: '.' }));

module.exports = router;
