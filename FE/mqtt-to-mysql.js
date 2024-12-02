const mqtt = require('mqtt');
const mysql = require('mysql2');

// Cấu hình MQTT
const mqttOptions = {
  host: '192.168.100.218', // Địa chỉ broker MQTT (ví dụ: 'localhost' hoặc IP của broker)
  port: 1885,
  protocol: 'mqtt'
};

// Kết nối tới MQTT broker
const client = mqtt.connect(mqttOptions);

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Manh54321',
  database: 'IOT'
});

// Kết nối MySQL
db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL: ', err);
  } else {
    console.log('Đã kết nối tới MySQL');
  }
});

// Lắng nghe khi kết nối tới MQTT broker thành công
client.on('connect', () => {
  console.log('Đã kết nối tới MQTT broker');
  
  // Đăng ký vào các topic: sensorData, các LED và tất cả LED
  client.subscribe(['esp32/sensorData', 'esp32/led1', 'esp32/led2', 'esp32/led3','esp32/led4', 'esp32/led5', 'esp32/all_leds'], (err) => {
    if (err) {
      console.error('Lỗi khi đăng ký vào các topic MQTT: ', err);
    } else {
      console.log('Đã đăng ký vào các topic: esp32/sensorData, esp32/led1, esp32/led2, esp32/led3, esp32/led4, esp32/led5, esp32/all_leds');
    }
  });
});

// Lắng nghe tin nhắn từ các topic
client.on('message', (topic, message) => {
  if (topic === 'esp32/sensorData') {
    // Xử lý dữ liệu cảm biến
    try {
      const sensorData = JSON.parse(message.toString());
      const { temperature, humidity, light } = sensorData;

      // Tạo giá trị wind ngẫu nhiên
      const wind = (Math.random() * 100).toFixed(2);

      // Lưu dữ liệu cảm biến vào MySQL, bao gồm cả wind
      const query = `INSERT INTO sensor_data (temperature, humidity, light, wind, timestamp) VALUES (?, ?, ?, ?, NOW())`;
      db.query(query, [temperature, humidity, light, wind], (err, results) => {
        if (err) {
          console.error('Lỗi khi lưu dữ liệu cảm biến vào MySQL: ', err);
        } else {
          console.log('Dữ liệu cảm biến đã được lưu vào MySQL', results);
        }
      });
    } catch (err) {
      console.error('Lỗi khi phân tích dữ liệu cảm biến: ', err);
    }
  } else if (['esp32/led1', 'esp32/led2', 'esp32/led3', 'esp32/led4', 'esp32/led5'].includes(topic)) {
    // Xử lý trạng thái LED riêng lẻ
    const device = topic.split('/')[1]; // Xác định led1, led2, led3 từ topic
    const action = message.toString(); // Trạng thái ON/OFF

    // Lưu trạng thái LED vào MySQL
    const query = `INSERT INTO device_history (device, action, timestamp) VALUES (?, ?, NOW())`;
    db.query(query, [device, action], (err, results) => {
      if (err) {
        console.error(`Lỗi khi lưu dữ liệu vào MySQL cho ${device}: `, err);
      } else {
        console.log(`Trạng thái của ${device} đã được lưu vào MySQL: ${action}`);
      }
    });
  } else if (topic === 'esp32/all_leds') {
    // Xử lý khi bật/tắt tất cả các LED
    const action = message.toString(); // Trạng thái ON/OFF cho tất cả các LED
    const devices = ['led1', 'led2', 'led3', 'led4', 'led5']; // Danh sách tất cả các LED

    // Lưu trạng thái của tất cả các LED vào MySQL
    devices.forEach(device => {
      const query = `INSERT INTO device_history (device, action, timestamp) VALUES (?, ?, NOW())`;
      db.query(query, [device, action], (err, results) => {
        if (err) {
          console.error(`Lỗi khi lưu dữ liệu vào MySQL cho ${device}: `, err);
        } else {  
          console.log(`Trạng thái của ${device} đã được lưu vào MySQL: ${action}`);
        }
      });
    });
  } 
});
