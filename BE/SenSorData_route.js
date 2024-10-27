const express = require('express');
const router = express.Router();
const sensorDataController = require('./sensorDataController');

router.get('/search', sensorDataController.getSensorData);
module.exports = router;
