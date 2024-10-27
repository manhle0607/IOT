const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Kết nối đến MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Manh54321@', // Điền mật khẩu nếu có
  database: 'IOT' // Tên database của bạn
});

// Kiểm tra kết nối MySQL
db.connect((err) => {
  if (err) {
    console.error('Không thể kết nối đến MySQL:', err);
  } else {
    console.log('Đã kết nối đến MySQL thành công!');
  }
});

app.use(cors());
app.use(bodyParser.json());

/* ------- Endpoint cho sensor_data ------- */

// Lấy dữ liệu từ bảng `sensor_data`
app.get('/sensor_data', (req, res) => {
  const query = 'SELECT * FROM sensor_data ORDER BY timestamp DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy dữ liệu sensor:', err);
      res.status(500).json({ error: 'Lỗi khi lấy dữ liệu sensor' });
    } else {
      res.json(results);
    }
  });
});

// Thêm dữ liệu mới vào `sensor_data`
app.post('/sensor_data', (req, res) => {
  const { temperature, humidity, light } = req.body;
  const query = 'INSERT INTO sensor_data (temperature, humidity, light, timestamp) VALUES (?, ?, ?, NOW())';
  db.query(query, [temperature, humidity, light], (err) => {
    if (err) {
      console.error('Lỗi khi chèn dữ liệu sensor:', err);
      res.status(500).json({ error: 'Lỗi khi chèn dữ liệu sensor' });
    } else {
      res.status(200).send('Dữ liệu sensor đã được cập nhật');
    }
  });
});

/* ------- Endpoint cho device_history ------- */

// Lấy lịch sử thiết bị từ bảng `device_history`
app.get('/device_history', (req, res) => {
  const query = 'SELECT * FROM device_history ORDER BY timestamp DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy lịch sử thiết bị:', err);
      res.status(500).json({ error: 'Lỗi khi lấy lịch sử thiết bị' });
    } else {
      res.json(results);
    }
  });
});

// Thêm hành động thiết bị mới vào `device_history`
app.post('/device_history', (req, res) => {
  const { device, action } = req.body;
  const query = 'INSERT INTO device_history (device, action) VALUES (?, ?)';
  db.query(query, [device, action], (err) => {
    if (err) {
      console.error('Lỗi khi chèn dữ liệu thiết bị:', err);
      res.status(500).json({ error: 'Lỗi khi chèn dữ liệu thiết bị' });
    } else {
      res.status(200).send('Lịch sử thiết bị đã được cập nhật');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
