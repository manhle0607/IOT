let combinedChart;

async function updateChartData() {
  try {
    const response = await fetch('http://localhost:3000/sensor_data');
    const data = await response.json();

    // Lấy 10 bản ghi mới nhất
    const recentData = data.slice(0, 10);
    console.log(recentData);

    // Kiểm tra xem recentData có phải là một mảng hợp lệ
    if (!Array.isArray(recentData) || recentData.length === 0) {
      console.error("Dữ liệu không hợp lệ hoặc không có dữ liệu.");
      return;
    }

    // Lấy các giá trị cho biểu đồ
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
    const tempData = recentData.map(item => item.temperature);
    const humidData = recentData.map(item => item.humidity);
    const lightData = recentData.map(item => item.light);

    // Cập nhật biểu đồ
    combinedChart.data.labels = labels;
    combinedChart.data.datasets[0].data = tempData;
    combinedChart.data.datasets[1].data = humidData;
    combinedChart.data.datasets[2].data = lightData;

    combinedChart.update();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('combinedChart').getContext('2d');

  combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Temperature',
          data: [],
          borderColor: '#F6C23E',
          backgroundColor: 'rgba(246, 194, 62, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
          borderWidth: 2,
          pointBackgroundColor: '#F6C23E',
          pointRadius: 3,
        },
        {
          label: 'Humidity',
          data: [],
          borderColor: '#1CC88A',
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y2',
          borderWidth: 2,
          pointBackgroundColor: '#1CC88A',
          pointRadius: 3,
        },
        {
          label: 'Light Intensity',
          data: [],
          borderColor: '#4E73DF',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y3',
          borderWidth: 2,
          pointBackgroundColor: '#4E73DF',
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
        y1: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(234, 236, 244, 1)',
            drawBorder: false,
          },
          title: {
            display: true,
            text: 'Temperature',
            color: '#F6C23E',
          },
          ticks: {
            beginAtZero: true,
          }
        },
        y2: {
          type: 'linear',
          position: 'left',
          grid: {
            color: 'rgba(234, 236, 244, 0.5)',
            drawBorder: false,
          },
          title: {
            display: true,
            text: 'Humidity',
            color: '#1CC88A',
          },
          ticks: {
            beginAtZero: true,
          },
          offset: true
        },
        y3: {
          type: 'linear',
          position: 'right',
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: 'Light Intensity',
            color: '#4E73DF',
          },
          ticks: {
            beginAtZero: true,
          },
          offset: true
        },
      }
    }
  });

  // Gọi hàm để lấy dữ liệu khi trang được tải
  updateChartData();

  // Cập nhật dữ liệu mỗi 5 giây
  setInterval(updateChartData, 5000);
});
