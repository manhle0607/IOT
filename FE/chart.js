async function updateChartData() {
  try {
      const response = await fetch('http://localhost:3000/sensor_data');
      const data = await response.json();

      console.log(data); // In ra để kiểm tra dữ liệu trả về từ API

      const labels = data.map(item => item.time);
      const tempData = data.map(item => item.temp);
      const humidData = data.map(item => item.humid);
      const lightData = data.map(item => item.light);

      combinedChart.data.labels = labels;
      combinedChart.data.datasets[0].data = lightData;
      combinedChart.data.datasets[1].data = humidData;
      combinedChart.data.datasets[2].data = tempData;

      combinedChart.update();
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

let combinedChart;

document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('combinedChart').getContext('2d');
  
  combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // Thời gian sẽ được cập nhật từ API
      datasets: [
        {
          label: 'Light Intensity',
          data: [],
          borderColor: '#4E73DF',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#4E73DF',
          pointRadius: 3,
        },
        {
          label: 'Moisture',
          data: [],
          borderColor: '#1CC88A',
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#1CC88A',
          pointRadius: 3,
        },
        {
          label: 'Temperature',
          data: [],
          borderColor: '#F6C23E',
          backgroundColor: 'rgba(246, 194, 62, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#F6C23E',
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
          grid: {
            color: 'rgba(234, 236, 244, 1)',
            drawBorder: false,
          },
          title: {
            display: true,
            text: 'Value',
            color: '#858796',
            font: { size: 14, family: "'Nunito', sans-serif" },
            padding: { left: 10, right: 10 }
          },
          ticks: { beginAtZero: true, maxTicksLimit: 5, padding: 10 },
        }
      }
    }
  });

  // Lấy dữ liệu ngay khi trang tải xong
  updateChartData();

  // Cập nhật dữ liệu mỗi 5 giây
  setInterval(updateChartData, 5000);
});
