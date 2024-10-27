const express = require('express');
const router = express.Router();
const actionHistoryController = require('./actionHistoryController');

router.get('/search', actionHistoryController.getActionHistory);
module.exports = router;
