# Cá mập Con City

Trang giới thiệu sắp ra mắt bằng tiếng Việt, sử dụng HTML, CSS và JavaScript thuần. Không cần cài đặt thư viện hoặc chạy lệnh build. Netlify phục vụ trực tiếp các tệp trong thư mục gốc.

Trang có lộ trình ba bước có thể mở rộng, đồng hồ đếm ngược trực tiếp và chức năng tải lịch hẹn `.ics`. Mốc ra mắt cố định là **31/12/2026 lúc 19:00, giờ Việt Nam (UTC+7)**, tương ứng `2026-12-31T12:00:00Z`. Đồng hồ không đặt lại khi tải trang và dừng ở 0 sau thời điểm ra mắt.

Để thay đổi mốc ra mắt, cập nhật `launchDate` và ngày sự kiện trong `app.js`, cùng nội dung ngày tháng trong `index.html`. Font chữ trực tuyến có font dự phòng; hình minh họa được lưu trực tiếp trong trang và không phụ thuộc dịch vụ ảnh bên ngoài.

Xem trước bằng Netlify CLI: `netlify dev --port 8889`.

Giao diện biển xanh có sóng chuyển động, bong bóng, cá mập bơi nhẹ, hiệu ứng xuất hiện khi cuộn và phản hồi khi tương tác. Nút cạnh trạng thái ra mắt cho phép tạm dừng hoặc bật lại hiệu ứng. Website tự giảm chuyển động theo cài đặt `prefers-reduced-motion` của thiết bị và tạm dừng hoạt ảnh khi tab không hiển thị. Nếu trình duyệt không hỗ trợ hiệu ứng xuất hiện khi cuộn, nội dung vẫn hiển thị bình thường.
