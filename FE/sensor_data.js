$(document).ready(function() {
    // Khởi tạo DataTable với dữ liệu từ server
    var table = $('#sensorTable').DataTable({
        "ajax": {
            "url": "http://localhost:3000/sensor_data",
            "dataSrc": ""
        },
        "columns": [
            { "data": "id", "title": "ID" },
            { "data": "temperature", "title": "Nhiệt độ" },
            { "data": "humidity", "title": "Độ ẩm" },
            { "data": "light", "title": "Ánh sáng" },
            { "data": "wind", "title": "Sức gió" },
            { 
                "data": "timestamp", 
                "title": "Thời gian",
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
        "order": [[ 0, "asc" ]],
        "paging": true,
        "searching": false,
        "ordering": true,
        "pageLength": 10,
        "lengthChange": false,
        "dom": 'ltip',
    });

    // Hàm gọi API tìm kiếm backend
    function searchBackend(column, query) {
        $.ajax({
            url: `http://localhost:3000/sensor_data/search?column=${column}&query=${query}`,
            method: 'GET',
            success: function(data) {
                // Cập nhật DataTable với dữ liệu trả về từ backend
                table.clear().rows.add(data).draw();
            },
            error: function(err) {
                console.error("Lỗi khi tìm kiếm dữ liệu:", err);
            }
        });
    }

    // Tìm kiếm theo trường được chọn từ dropdown
    $('#searchBox').on('keyup', function(event) {
        if (event.key === "Enter") { // Khi nhấn Enter
            var selectedColumn = $('#searchField').val(); // Lấy giá trị của trường được chọn từ dropdown
            var searchQuery = this.value; // Giá trị tìm kiếm
            if (selectedColumn === "all" || searchQuery === "") {
                // Nếu chọn "Tất cả" hoặc không có nội dung tìm kiếm, tải lại toàn bộ dữ liệu
                table.ajax.reload();
            } else {
                searchBackend(selectedColumn, searchQuery); // Gọi hàm tìm kiếm backend
            }      
        }
    });

    $('#searchField').on('change', function() {
        if (this.value === "all") {
            // Nếu chọn "Tất cả", xóa nội dung tìm kiếm và tải lại toàn bộ dữ liệu
            $('#searchBox').val(''); // Xóa nội dung tìm kiếm
            table.ajax.reload(); // Tải lại toàn bộ dữ liệu từ API
        }
    });

    // Bắt sự kiện khi người dùng nhấn nút "Go" để chuyển trang
    $('#gotoButton').click(function() {
        var page = parseInt($('#gotoPage').val(), 10) - 1;
        if (!isNaN(page) && page >= 0 && page < table.page.info().pages) {
            table.page(page).draw('page');
        } else {
            alert("Trang không hợp lệ, vui lòng nhập trang từ 1 đến " + table.page.info().pages);
        }
    });      
});


