const express = require('express');
const sensorDataRoutes = require('./sensorData');
const actionHistoryRoutes = require('./actionHistory');

const app = express();
app.use(express.json());

app.use('/api/sensor_data', sensorDataRoutes);
app.use('/api/action_history', actionHistoryRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
