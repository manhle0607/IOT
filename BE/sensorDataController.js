const db = require('./database');

exports.getSensorData = (req, res) => {
    const { column, query } = req.query;
    const sql = `SELECT * FROM sensor_data WHERE ?? LIKE ?`;
    db.query(sql, [column, `%${query}%`], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Query error' });
        } else {
            res.json(results);
        }
    });
};
