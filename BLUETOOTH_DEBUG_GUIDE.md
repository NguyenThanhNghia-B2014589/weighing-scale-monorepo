# 🔍 Hướng dẫn Debug Kết nối Bluetooth Cân SPP

## 🎯 Tóm tắt Vấn đề
- Kết nối Bluetooth thành công (Windows tạo COM port ảo như COM3/COM4)
- Nhưng frontend không nhận dữ liệu từ cân

## 🛠️ Patch Debug Đã Áp dụng
Đã thêm logging chi tiết vào `apps/frontend/src/services/scaleService.ts`:
- **Raw data logging**: Hiển thị mỗi chunk nhận được + mã ký tự ASCII
- **Buffer state**: Theo dõi nội dung buffer sau mỗi bước
- **Robust line splitting**: Hỗ trợ `\r\n`, `\n`, `\r` (trước chỉ `\r\n`)
- **Auto-send 'R' command**: Gửi lệnh yêu cầu dữ liệu tự động sau 500ms khi connect
- **Parse logging**: Log chi tiết từng bước phân tích dữ liệu

---

## 📋 Các Bước Debug (Theo Thứ Tự)

### **Bước 1: Xác Nhận Kết Nối Bluetooth & COM Port**

#### 1.1 - Kiểm tra Device Manager
1. Mở **Device Manager** (Win+X → Device Manager)
2. Mở rộng **Ports (COM & LPT)**
3. Tìm COM port của cân (ví dụ: `COM3`, `COM4`, có thể ghi "Bluetooth"...)
4. **Ghi nhớ**: Tên chính xác của COM port

#### 1.2 - Kiểm tra Trình Duyệt hỗ trợ Web Serial
1. Mở app (trên localhost hoặc HTTPS)
2. Mở **Developer Tools** (F12)
3. Chuyển sang tab **Console**
4. Chạy lệnh sau:
```javascript
// Kiểm tra hỗ trợ Web Serial
console.log('✅ Web Serial supported:', 'serial' in navigator);

// Liệt kê các port đã cấp quyền trước
navigator.serial.getPorts().then(ports => {
  console.log('Ports đã cấp quyền:', ports.length, ports);
});
```
**Kết quả mong đợi**: 
- `✅ Web Serial supported: true`
- `Ports đã cấp quyền:` có thể rỗng nếu chưa kết nối lần nào

---

### **Bước 2: Chạy Backend Test (Xác Nhận OS Nhận Data từ Cân)**

Điều này sẽ giúp xác minh liệu **Windows/COM** có thực sự nhận data từ cân không (nếu OS nhận được, vấn đề chỉ ở browser).

#### 2.1 - Setup & Chạy test-COM4.ts
1. Mở **PowerShell** 
2. Chuyển vào thư mục backend:
```powershell
cd C:\TN\weighing-scale-monorepo\apps\backend
```

3. Cài phụ thuộc (nếu chưa):
```powershell
npm install
```

4. **QUAN TRỌNG**: Sửa file `test-COM4.ts` để chỉ định COM port đúng
   - Mở file: `apps/backend/test-COM4.ts`
   - Tìm dòng `const PORT_NAME = 'COM4';`
   - Thay `COM4` bằng COM port bạn tìm thấy ở Bước 1.1 (ví dụ: `COM3`)
   - **Lưu file**

5. Chạy script:
```powershell
npx ts-node .\test-COM4.ts
```

6. **Quan sát output**:
   - Nếu **ĐÃ thấy dữ liệu** từ cân (in ra console log):
     ```
     📦 Đã nhận data từ cân:
     Trạng thái: ST (Ổn định)
     Loại cân: Khối lượng tịnh (Net)
     Khối lượng: 218.64 g
     ```
     → **Cân đang gửi data tốt, vấn đề ở browser/Web Serial**
   
   - Nếu **KHÔNG thấy data** (script chạy nhưng không output):
     - Kiểm tra lại COM port (Device Manager)
     - Thử baud rate khác (42, 4800, 19200, 115200 trong test-COM4.ts dòng `baudRate: 9600,`)
     - Kiểm tra cân đã bật / ghép đôi Bluetooth chưa
     - Cân có chế độ "transmit mode" hay cần lệnh yêu cầu không

---

### **Bước 3: Test Frontend với Debug Logging**

#### 3.1 - Chạy dev server
```powershell
cd C:\TN\weighing-scale-monorepo
npm run dev
```
Mở browser đến `http://localhost:5173` (hoặc port mà terminal hiển thị)

#### 3.2 - Mở Console (F12) & Kích Hoạt Kết Nối
1. **DevTools → Console**
2. Tìm nút "Connect" hoặc tương tự trong giao diện ứng dụng để kết nối cân
3. Trình duyệt sẽ hiện dialog "Select device" → **Chọn COM port cân**
4. **Quan sát Console** → Bạn sẽ thấy log chi tiết:

**Nếu thành công**, console sẽ hiển thị tương tự:
```
✅ Đã kết nối với cân
[ScaleService] Đang mở cổng với baudRate: 9600
[ScaleService] Gửi lệnh R tự động để yêu cầu dữ liệu...
[ScaleService] Chunk #1: { text: "ST,NT,+  218.64g\r\n", charCodes: [...], length: 19, bufferLenBeforeAdd: 0 }
[ScaleService] Buffer sau thêm: "ST,NT,+  218.64g\r\n" (length: 19)
[ScaleService] Phân tích 1 dòng, buffer còn lại: 
[ScaleService] Xử lý dòng: "ST,NT,+  218.64g"
[ScaleService] parseCla5Data: status="ST", weightType="NT", sign="+", valueAndUnit="  218.64g"
[ScaleService] parseCla5Data: valueStr="218.64", value=218.64, unit="g"
✅ Dữ liệu parse thành công: { status: 'ST', weightType: 'NT', sign: '+', value: 218.64, unit: 'g' }
```

**Nếu lỗi / không thấy data**, console sẽ hiển thị:
- `[ScaleService] Đang mở cổng với baudRate: 9600` ✅ **Nhưng không thấy `Chunk #1`**
  → COM port mở nhưng cân không gửi data. **Hãy kiểm tra**:
  - Cân có bật / Bluetooth kết nối không?
  - Có cần gửi lệnh khác không (không phải 'R')?
  - Baud rate có sai không? (thử 4800, 19200...)

- `[ScaleService] parseCla5Data: value không phải số...` ⚠️
  → Định dạng data từ cân khác CLA-5. Cần điều chỉnh parser.

- `Web Serial API không được hỗ trợ...` ❌
  → Trình duyệt không hỗ trợ hoặc app không chạy trên secure context.

---

### **Bước 4: Điều Chỉnh Nếu Cần**

#### 4.1 - Nếu baud rate sai
1. Mở `apps/frontend/src/services/scaleService.ts`
2. Tìm dòng gọi `connect(baudRate)` (thường ở component hoặc hook)
3. Thay `9600` bằng baud rate cần (4800, 19200, 115200...)

#### 4.2 - Nếu định dạng CLA-5 khác
1. **Backend console output** sẽ hiển thị data thô từ cân
2. So sánh với định dạng `ST,NT,+  218.64g` (trong `parseCla5Data`)
3. Nếu khác, điều chỉnh regex/split logic trong `parseCla5Data()`

#### 4.3 - Nếu cần gửi lệnh khác (không phải 'R')
1. Mở `scaleService.ts` → hàm `connect()`
2. Tìm `this.sendCommand('R');`
3. Thay 'R' bằng lệnh cần (ví dụ 'T', 'Z', hoặc tuỳ cân)

---

## 🎯 Kết Quả Mong Đợi sau Debug

✅ **Kết quả tốt**:
- Backend test thấy data từ cân
- Frontend console thấy `[ScaleService] Chunk #1:` với data đúng
- Ứng dụng hiển thị khối lượng cân đúng trên UI

❌ **Nếu vẫn có vấn đề**:
1. **Gửi logs** từ bước 2 & 3 (backend output + browser console)
2. Tôi sẽ điều chỉnh code tiếp

---

## 📞 Quick Troubleshooting

| Triệu Chứng | Nguyên Nhân | Giải Pháp |
|---|---|---|
| `navigator.serial` undefined | Trình duyệt không hỗ trợ / không HTTPS/localhost | Dùng Chrome/Edge, chạy localhost |
| Backend thấy data, frontend không | COM port không được Web Serial access | Kiểm tra permission, thử COM port khác |
| Mở cổng OK nhưng không thấy chunk | Cân không gửi data / baud rate sai | Xác nhận baud rate, kiểm tra cân bật |
| Data nhưng parse thất bại | Định dạng không CLA-5 | Log data thô từ backend, điều chỉnh parser |

---

## 📝 Ghi Chú
- Debug logging có thể bỏ sau khi sửa xong (xóa `console.log` để app chạy nhanh hơn)
- Nếu muốn test nhanh, có thể mock data: edit `parseCla5Data()` để return test data
