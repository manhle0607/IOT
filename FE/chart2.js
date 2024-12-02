let windChart;

async function updateWindChartData() {
  try {
    const response = await fetch('http://localhost:3000/sensor_data'); // API của bạn để lấy dữ liệu
    const data = await response.json();

    // Lấy 10 bản ghi mới nhất
    const recentData = data.slice(0, 10);
    console.log(recentData);

    // Kiểm tra xem recentData có phải là một mảng hợp lệ
    if (!Array.isArray(recentData) || recentData.length === 0) {
      console.error("Dữ liệu không hợp lệ hoặc không có dữ liệu.");
      return;
    }

    // Lấy các giá trị cho biểu đồ wind
    const labels = recentData.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleString("vi-VN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
      });
    });
    const windData = recentData.map(item => item.wind); // Lấy dữ liệu wind

    // Cập nhật biểu đồ wind
    windChart.data.labels = labels;
    windChart.data.datasets[0].data = windData;

    // Cập nhật lại biểu đồ
    windChart.update();
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('combinedChartWind').getContext('2d'); // Đảm bảo bạn có một canvas với id là combinedChartWind

  // Tạo biểu đồ wind
  windChart = new Chart(ctx, {
    type: 'line', // Kiểu biểu đồ là line
    data: {
      labels: [], // Mảng này sẽ chứa các nhãn (thời gian)
      datasets: [
        {
          label: 'Wind Speed', // Tiêu đề cho dataset
          data: [], // Mảng này sẽ chứa dữ liệu wind
          borderColor: '#4E73DF', // Màu của đường biều đồ
          backgroundColor: 'rgba(78, 115, 223, 0.1)', // Màu nền của biểu đồ
          fill: false, // Không fill dưới đường biều đồ
          tension: 0.4, // Mức độ cong của đường biểu đồ
          borderWidth: 2,
          pointBackgroundColor: '#4E73DF', // Màu của các điểm trên biểu đồ
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.7)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#333333',
          borderWidth: 1,
          caretPadding: 10,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          title: {
            display: true,
            text: 'Time',
            color: '#858796',
            font: { size: 14, family: "'Nunito', sans-serif" },
            padding: { top: 10 }
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(234, 236, 244, 1)',
            drawBorder: false,
          },
          title: {
            display: true,
            text: 'Wind Speed (m/s)', // Nhãn trục y
            color: '#4E73DF',
          },
          ticks: {
            beginAtZero: true,
          }
        },
      }
    }
  });

  // Gọi hàm để lấy dữ liệu khi trang được tải
  updateWindChartData();

  // Cập nhật dữ liệu mỗi 3 giây
  setInterval(updateWindChartData, 3000);
});
