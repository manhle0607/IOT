const db = require('./database');

exports.getActionHistory = (req, res) => {
    const { column, query, sortColumn, sortOrder } = req.query;

    // Kiểm tra tên cột để đảm bảo rằng nó an toàn
    const allowedColumns = ['id', 'device', 'action', 'timestamp'];
    if (!allowedColumns.includes(column) && column !== 'all') {
        return res.status(400).json({ error: 'Invalid column name' });
    }

    // Kiểm tra cột sắp xếp và thứ tự sắp xếp hợp lệ
    const allowedSortColumns = ['id', 'device', 'action', 'timestamp'];
    const order = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sort = allowedSortColumns.includes(sortColumn) ? sortColumn : 'timestamp';

    let sql;
    let params = [];

    // Trường hợp "all" hoặc không có từ khóa tìm kiếm thì trả về toàn bộ dữ liệu
    if (column === 'all' || !query) {
        sql = `SELECT * FROM device_history ORDER BY ${sort} ${order}`;
    } else {
        // Tìm kiếm trong tất cả các cột nếu column là "all"
        if (column === 'all') {
            sql = `
                SELECT * FROM device_history 
                WHERE id = ? 
                OR device LIKE ? 
                OR action LIKE ? 
                OR DATE_FORMAT(timestamp, '%Y-%m-%d') LIKE ? 
                ORDER BY ${sort} ${order}
            `;
            params = [parseInt(query), `%${query}%`, `%${query}%`, `%${query}%`];
        } else {
            // Tìm kiếm chính xác nếu cột là id
            if (column === 'id') {
                sql = `SELECT * FROM device_history WHERE id = ? ORDER BY ${sort} ${order}`;
                params = [parseInt(query)];
            } else if (column === 'timestamp') {
                // Tìm kiếm theo ngày cho cột timestamp
                sql = `SELECT * FROM device_history WHERE DATE_FORMAT(timestamp, '%Y-%m-%d') LIKE ? ORDER BY ${sort} ${order}`;
                params = [`%${query}%`];
            } else {
                // Tìm kiếm bằng LIKE cho các cột khác
                sql = `SELECT * FROM device_history WHERE ${column} LIKE ? ORDER BY ${sort} ${order}`;
                params = [`%${query}%`];
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
