Hệ Thống Quản Lý Cân Keo (Weighing Management System)

Đây là một ứng dụng web full-stack (React/Node.js) được thiết kế để giám sát, quản lý và ghi lại dữ liệu từ các trạm cân công nghiệp (cụ thể là cân keo cho xưởng đế).
Hệ thống cung cấp giải pháp theo dõi thời gian thực cho các Lệnh Sản Xuất (OVNO), quản lý khối lượng nhập/xuất, và cung cấp các dashboard tổng quan mạnh mẽ cho cấp quản lý.

✨ Tính Năng Nổi Bật
📊 Dashboard Tổng Quan:
  Biểu đồ Tồn Kho (2 vòng): Trực quan hóa tỷ lệ Tồn Kho (chi tiết theo từng loại keo) so với Tổng Đã Xuất.
  Biểu đồ Theo Ca: Tự động tính toán tổng khối lượng Nhập/Xuất theo 3 ca làm việc (Ca 1, Ca 2, Ca 3).
  Biểu đồ Xu Hướng: Phân tích tổng khối lượng cân (Nhập/Xuất) theo từng tháng trong năm (có thể tùy chọn năm).

📜 Lịch Sử Cân Chi Tiết:
  Sử dụng react-virtualized để hiển thị mượt mà hàng ngàn bản ghi lịch sử.
  Tự động nhóm các lượt cân (Nhập/Xuất) theo từng Lệnh Sản Xuất (OVNO).
  Tô màu sọc (zebra striping) để dễ dàng phân biệt các hàng.

⚠️ Giám Sát Công Việc:
  Trang Quản Lý Mã Chưa Cân chuyên dụng, hiển thị các OVNO chưa hoàn thành.
  Thống kê nhanh số lượng mã Chưa Cân Nhập và Chưa Cân Xuất.
  Click để xem chi tiết (drill-down) danh sách các mã code đang chờ của từng OVNO.

⚙️ Bộ Lọc Mạnh Mẽ & Cài Đặt:
  Lọc trang Lịch Sử theo: Tên phôi, Ngày cụ thể, và Tìm kiếm (theo Mã Code, Lô, Máy, Người thao tác, Loại cân).
  Bộ nhớ cài đặt: Tự động lưu các bộ lọc (Ngày, Tên phôi, Phạm vi ngày) vào localStorage để tải lại khi người dùng quay lại.
  Tùy chỉnh Phạm vi ngày (7/15/30/90/Tất cả) và Tự động làm mới dữ liệu.

🔐 Phân Quyền:
  Sử dụng AdminProtectedRoute để bảo vệ các trang quản trị (Lịch sử, Dashboard, Mã chưa cân).

🚀 Công Nghệ Sử Dụng
  Frontend (Giao diện người dùng)
  Ngôn ngữ: TypeScript
  Thư viện: React (Hooks)
  Giao diện: Tailwind CSS
  Gọi API: Axios
  Trực quan hóa (Charts): recharts
  Tối ưu hóa (Lists): react-virtualized
  Quản lý State: React Context (Context API)
  Backend (Máy chủ)
  Nền tảng: Node.js
  Framework: Express
  Ngôn ngữ: TypeScript
  Cơ sở dữ liệu: Microsoft SQL Server
  Driver CSDL: mssql
  Tích hợp Phần cứng (Hardware)
  Hệ thống được thiết kế để nhận dữ liệu từ các đầu cân (Indicator) như XK-3280E-V1 qua cổng RS232 và truyền không dây qua module Bluetooth HC-05.

🏃 Cài Đặt & Chạy Dự Án
- Yêu cầu:
  Node.js (v16 trở lên)
  Một instance Microsoft SQL Server đang chạy.
  (Tùy chọn) Git

1. Cài đặt Backend (Máy chủ)
Bash

# 1. Clone dự án (nếu có)
git clone [URL_GITHUB_CUA_BAN]
cd [TEN_THU_MUC_DU_AN]/apps/backend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Tạo file .env
# (Copy file .env.example và điền thông tin CSDL của bạn)
cp .env.example .env

# 4. Chỉnh sửa file .env:
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_SERVER=localhost
# DB_DATABASE=your_database_name
# PORT=3636

# 5. Chạy máy chủ
npm run dev
# Máy chủ sẽ chạy tại http://localhost:3636
2. Cài đặt Frontend (Giao diện)
Bash

# 1. Mở một terminal mới, đi đến thư mục frontend
cd [TEN_THU_MUC_DU_AN]/apps/frontend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. (Nếu cần) Cấu hình proxy API trong file vite.config.ts
# Đảm bảo target trỏ về cổng backend (ví dụ: http://localhost:8080)

# 4. Chạy giao diện
npm run dev
# Ứng dụng sẽ mở tại http://localhost:5173 (hoặc cổng Vite mặc định)

📋 Các API Chính (Endpoints)
GET /api/history: Lấy dữ liệu trang lịch sử (lọc theo ?days=).

GET /api/dashboard/inventory-summary: Lấy dữ liệu tổng quan tồn kho (cho biểu đồ tròn 2 vòng).

GET /api/dashboard/hourly-weighing: Lấy dữ liệu cân theo ca (lọc theo ?date=).

GET /api/dashboard/weighing-trend: Lấy dữ liệu xu hướng theo tháng (lọc theo ?year=).

GET /api/unweighed/summary: Lấy danh sách tóm tắt các OVNO chưa hoàn thành.

GET /api/unweighed/details/:ovno: Lấy danh sách chi tiết các mã code chưa cân của một OVNO.