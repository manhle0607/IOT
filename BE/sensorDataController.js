const db = require('./database');

exports.getSensorData = (req, res) => {
    const { column, query } = req.query;

    // Kiểm tra tên cột để đảm bảo rằng nó an toàn
    const allowedColumns = ['id', 'temperature', 'humidity', 'light', 'timestamp'];
    if (!allowedColumns.includes(column) && column !== 'all') {
        return res.status(400).json({ error: 'Invalid column name' });
    }

    let sql;
    let params = [];

    // Trường hợp "all" hoặc không có từ khóa tìm kiếm thì trả về toàn bộ dữ liệu
    if (column === 'all' || !query) {
        sql = `SELECT * FROM sensor_data ORDER BY timestamp DESC`;
    } else {
        // Tìm kiếm trong tất cả các cột nếu column là "all"
        if (column === 'all') {
            sql = `
                SELECT * FROM sensor_data 
                WHERE id = ? 
                OR temperature LIKE ? 
                OR humidity LIKE ? 
                OR light LIKE ? 
                ORDER BY timestamp DESC
            `;
            params = [parseInt(query), `%${query}%`, `%${query}%`, `%${query}%`];
        } else {
            // Tìm kiếm chính xác nếu cột là id
            if (column === 'id') {
                sql = `SELECT * FROM sensor_data WHERE id = ? ORDER BY timestamp DESC`;
                params = [parseInt(query)];
            } else {
                // Tìm kiếm bằng LIKE cho các cột khác
                sql = `SELECT * FROM sensor_data WHERE ?? LIKE ? ORDER BY timestamp DESC`;
                params = [column, `%${query}%`];
            }
        }
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Query error:', err);
            res.status(500).json({ error: 'Query error' });
        } else {
            res.json(results);
        }
    });
};
