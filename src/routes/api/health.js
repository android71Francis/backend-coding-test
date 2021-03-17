const router = require('express').Router();

router.get('/health', (req, res) => res.send('Healthy'));

module.exports = router;
