const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const mqtt = require('mqtt');
const app = express();
const PORT = 3000;

// Kết nối đến MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Manh54321', // Điền mật khẩu nếu có
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

app.use(cors({
  origin: '*',  // Cho phép tất cả các domain truy cập
  methods: ['GET', 'POST'],  // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization']  // Các header được phép
}));
app.use(express.json()); 

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
  const query = 'SELECT * FROM device_history ORDER BY timestamp ASC';
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

app.get('/sensor_data/search', (req, res) => {
  const column = req.query.column;
  const query = req.query.query;
  
  // Kiểm tra tên cột để đảm bảo rằng nó an toàn
  const allowedColumns = ['id', 'temperature', 'humidity', 'light', 'timestamp']; // Các tên cột hợp lệ
  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ error: 'Tên cột không hợp lệ' });
  }

  const sql = `SELECT * FROM sensor_data WHERE \`${column}\` LIKE ? ORDER BY timestamp ASC`;

  db.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error('Lỗi khi tìm kiếm dữ liệu sensor:', err);
      res.status(500).json({ error: 'Lỗi khi tìm kiếm dữ liệu sensor' });
    } else {
      res.json(results);
    }
  });
});

app.get('/device_history/search', (req, res) => {
  const column = req.query.column;
  const query = req.query.query;
  
  // Kiểm tra tên cột để đảm bảo rằng nó an toàn
  const allowedColumns = ['id', 'device', 'action', 'timestamp']; // Các tên cột hợp lệ
  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ error: 'Tên cột không hợp lệ' });
  }

  const sql = `SELECT * FROM device_history WHERE \`${column}\` LIKE ? ORDER BY timestamp DESC LIMIT 10`;

  db.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error('Lỗi khi tìm kiếm dữ liệu history:', err);
      res.status(500).json({ error: 'Lỗi khi tìm kiếm dữ liệu history' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/wind', (req, res) => {
  // Truy vấn để lấy giá trị wind mới nhất
  const query = 'SELECT wind FROM sensor_data ORDER BY timestamp DESC LIMIT 1'; // Lấy giá trị wind mới nhất
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching wind data:', err);
          return res.status(500).json({ error: 'Error fetching wind data' });
      }
      if (results.length > 0) {
          res.json({ wind: results[0].wind }); // Trả về giá trị wind dưới dạng JSON
      } else {
          res.json({ wind: 'No data available' }); // Nếu không có dữ liệu
      }
  });
});

// cho đèn
const mqttClient = mqtt.connect({
  host: '192.168.100.218',
  port: 1885,
  username: 'lexuanmanh',
  password: 'b21dcat125',
});

mqttClient.on('connect', () => {
  console.log('Đã kết nối đến MQTT broker');
});

// Hàm publish MQTT
function publishMQTT(topic, message) {
  mqttClient.publish(topic, message, (err) => {
    if (err) {
      console.error('Lỗi khi gửi MQTT:', err);
    } else {
      console.log(`Đã gửi MQTT: ${topic} - ${message}`);
    }
  });
}

app.post('/toggle-light', (req, res) => {
  const { device, action } = req.body;

  // Kiểm tra xem action có hợp lệ hay không (ON hoặc OFF)
  if (action !== 'ON' && action !== 'OFF') {
    return res.status(400).json({ error: 'Hành động không hợp lệ' });
  }

  // Gửi tín hiệu MQTT đến ESP32
  publishMQTT(`esp32/${device}`, action);

  // Lưu lịch sử vào MySQL
  const query = 'INSERT INTO device_history (device, action, timestamp) VALUES (?, ?, NOW())';
  db.query(query, [device, action], (err) => {
    if (err) {
      console.error('Lỗi khi ghi lịch sử thiết bị:', err);
      return res.status(500).json({ error: 'Lỗi khi ghi lịch sử thiết bị' });
    }
    // Trả về JSON hợp lệ thay vì chuỗi
    res.status(200).json({ message: `Đèn ${device} đã được ${action}` });
  });
});


app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

