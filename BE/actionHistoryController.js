const db = require('./database');

exports.getActionHistory = (req, res) => {
    const { column, query } = req.query;
    const sql = `SELECT * FROM action_history WHERE ?? LIKE ?`;
    db.query(sql, [column, `%${query}%`], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Query error' });
        } else {
            res.json(results);
        }
    });
};
