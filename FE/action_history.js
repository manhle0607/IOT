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
            {  "data": "timestamp", 
                "title": "Thời gian",
                "render": function(data) {
                    // Tạo đối tượng Date từ chuỗi thời gian
                    const date = new Date(data);
                    
                    // Lấy các thành phần của ngày và giờ
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
                    const year = date.getFullYear();
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    
                    // Định dạng lại chuỗi
                    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                }}
        ],
        "order": [[ 0, "asc" ]], // Sắp xếp theo ID tăng dần
        "paging": true,        // Kích hoạt phân trang
        "searching": true,     // Kích hoạt tìm kiếm toàn bảng
        "ordering": true,      // Kích hoạt sắp xếp
        "pageLength": 10,      // Hiển thị 10 dòng mỗi trang
        "lengthChange": false,
        "dom": 'ltip',      // Hiển thị 10 dòng mỗi trang
    });

    // Tìm kiếm theo từng cột trong Action History
    $('#actionSearchBox').on('keyup', function() {
        var selectedColumn = $('#actionSearchField').val(); // Lấy giá trị của trường được chọn
        actionTable.column(selectedColumn).search(this.value).draw(); // Thực hiện tìm kiếm trong trường được chọn
    });

    // Bắt sự kiện khi người dùng nhấn nút "Go" để chuyển trang
    $('#gotoActionButton').click(function() {
        var page = parseInt($('#gotoActionPage').val(), 10) - 1; // Lấy giá trị trang từ input (trừ 1 vì index bắt đầu từ 0)
        if (!isNaN(page) && page >= 0 && page < actionTable.page.info().pages) {
            actionTable.page(page).draw('page'); // Chuyển đến trang yêu cầu
        } else {
            alert("Trang không hợp lệ, vui lòng nhập trang từ 1 đến " + actionTable.page.info().pages);
        }
    });
});
