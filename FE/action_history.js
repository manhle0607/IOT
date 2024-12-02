$(document).ready(function() {
    // Khởi tạo DataTable cho Action History với phân trang và tìm kiếm theo từng cột
    var actionTable = $('#actionTable').DataTable({
        "ajax": {
            "url": "http://localhost:3000/device_history", // Địa chỉ API của bạn cho Action History
            "dataSrc": "" // Vì API trả về một mảng JSON
        },
        "columns": [
            { "data": "id", "title": "ID" },
            { "data": "device", "title": "Device" },
            { "data": "action", "title": "Action" },
            { 
                "data": "timestamp", 
                "title": "Time",
                "render": function(data) {
                    const date = new Date(data);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                }
            }
        ],
        "order": [[ 0, "asc" ]], // Sắp xếp theo ID tăng dần
        "paging": true,        // Kích hoạt phân trang
        "searching": false,    // Không sử dụng tìm kiếm mặc định của DataTables
        "ordering": true,      // Kích hoạt sắp xếp
        "pageLength": 10,      // Hiển thị 10 dòng mỗi trang
        "lengthChange": false,
        "dom": 'ltip'
    });

    // Hàm gọi API tìm kiếm backend
    function searchBackend2(column, query) {
        $.ajax({
            url: `http://localhost:3000/device_history/search?column=${column}&query=${query}`,
            method: 'GET',
            success: function(data) {
                // Cập nhật DataTable với dữ liệu trả về từ backend
                actionTable.clear().rows.add(data).draw();
            },
            error: function(err) {
                console.error("Lỗi khi tìm kiếm dữ liệu:", err);
            }
        });
    }

    // Tìm kiếm theo trường được chọn từ dropdown
    $('#actionSearchBox').on('keyup', function(event) {
        if (event.key === "Enter") {
            var selectedColumn = $('#actionSearchField').val();
            var searchQuery = this.value;

            if (selectedColumn === "all" || searchQuery === "") {
                actionTable.ajax.reload(); // Tải lại toàn bộ dữ liệu nếu chọn "All" hoặc không nhập nội dung tìm kiếm
            } else {
                searchBackend2(selectedColumn, searchQuery); // Gọi hàm tìm kiếm backend
            }
        }
    });

    // Sự kiện khi chọn "All" trong dropdown
    $('#actionSearchField').on('change', function() {
        if (this.value === "all") {
            $('#actionSearchBox').val(''); // Xóa nội dung tìm kiếm
            actionTable.ajax.reload(); // Tải lại toàn bộ dữ liệu từ API
        }
    });

    // Bắt sự kiện khi người dùng nhấn nút "Go" để chuyển trang
    $('#gotoActionButton').click(function() {
        var page = parseInt($('#gotoActionPage').val(), 10) - 1;
        if (!isNaN(page) && page >= 0 && page < actionTable.page.info().pages) {
            actionTable.page(page).draw('page');
        } else {
            alert("Trang không hợp lệ, vui lòng nhập trang từ 1 đến " + actionTable.page.info().pages);
        }
    });
});

function toggleLight(ledNumber) {
    const isChecked = document.getElementById(`led${ledNumber}`).checked;
    const action = isChecked ? 'ON' : 'OFF';

    // Gửi yêu cầu tới server Node.js
    fetch('http://localhost:3000/toggle-light', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device: `led${ledNumber}`, action }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Lỗi từ server:', data.error);
        } else {
            console.log(data);
        }
    })
    .catch(error => {
        console.error('Lỗi khi gửi yêu cầu:', error);
    });
}

