// apps/backend/test-XK3280.ts
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// --- CẤU HÌNH ---
// Thay đổi '/dev/ttyUSB0' thành tên cổng COM của bạn (ví dụ: 'COM3' trên Windows)
const PORT_NAME = 'COM4';
const BAUD_RATE = 9600; // Tốc độ baud mặc định của thiết bị

// Khởi tạo cổng nối tiếp
const port = new SerialPort({
  path: PORT_NAME,
  baudRate: BAUD_RATE,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

// Sử dụng ReadlineParser để đọc dữ liệu theo từng dòng (dựa vào ký tự xuống dòng CR LF)
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

/**
 * Hàm phân tích cú pháp dữ liệu từ cân dựa trên cài đặt CLA-5 (mặc định)
 * Dữ liệu mẫu (ASCII): ST,NT,+  218.64g
 * @param data Chuỗi dữ liệu thô từ cân
 * @returns Một đối tượng chứa thông tin đã được phân tích hoặc null nếu không hợp lệ
 */
function parseCla5Data(data: string): { status: string; weightType: string; sign: string; value: number; unit: string } | null {
  // Dữ liệu mẫu: ST,GS,+  218.64g
  const parts = data.split(',');
  if (parts.length < 3) {
    return null;
  }

  try {
    const status = parts[0].trim(); // ST (stable) hoặc US (unstable)
    const weightType = parts[1].trim(); // NT (net) hoặc GS (gross)
    
    // Phần còn lại chứa dấu, giá trị và đơn vị
    const remaining = parts[2].trim();
    const sign = remaining.substring(0, 1); // '+' hoặc '-'
    const valueAndUnit = remaining.substring(1).trim();
    
    // Tách giá trị và đơn vị
    let valueStr = '';
    let unit = '';
    for (let i = 0; i < valueAndUnit.length; i++) {
        const char = valueAndUnit[i];
        if (!isNaN(parseFloat(char)) || char === '.') {
            valueStr += char;
        } else if(char !== ' ') { // Bỏ qua khoảng trắng
            unit += char;
        }
    }

    const value = parseFloat(valueStr);

    return {
      status,
      weightType,
      sign,
      value,
      unit,
    };
  } catch (error) {
    console.error("Lỗi khi phân tích dữ liệu:", error);
    return null;
  }
}


// --- XỬ LÝ SỰ KIỆN ---

// Sự kiện khi mở cổng thành công
port.on('open', () => {
  console.log(`Đã mở cổng ${PORT_NAME} với tốc độ baud ${BAUD_RATE}`);
  console.log('Đang chờ dữ liệu từ cân XK-3280...');
  
  // Ví dụ: Gửi lệnh 'R' mỗi 3 giây để yêu cầu dữ liệu
  // Lưu ý: Chế độ trên cân phải là Str-5 (Command mode) để lệnh này hoạt động
  
  //setInterval(() => {
    //sendCommand('Z');
  //}, 3000);
  
});

// Sự kiện khi nhận được dữ liệu
parser.on('data', (data: string) => {
  console.log(`Dữ liệu thô nhận được: "${data}"`);
  
  // Giả sử cân đang ở chế độ mặc định CLA-5
  const parsedData = parseCla5Data(data);

  if (parsedData) {
    console.log('Dữ liệu đã xử lý:', {
        'Trạng thái': parsedData.status === 'ST' ? 'Ổn định' : 'Không ổn định',
        'Loại cân': parsedData.weightType === 'NT' ? 'Khối lượng tịnh (Net)' : 'Khối lượng tổng (Gross)',
        'Giá trị': `${parsedData.sign}${parsedData.value}`,
        'Đơn vị': parsedData.unit
    });
    console.log('---------------------------------');
  } else {
    console.warn('Không thể phân tích dữ liệu. Vui lòng kiểm tra định dạng CLA-X trên thiết bị.');
  }
});

// Sự kiện khi có lỗi
port.on('error', (err) => {
  console.error('Lỗi:', err.message);
});

// Sự kiện khi đóng cổng
port.on('close', () => {
  console.log('Đã đóng cổng nối tiếp.');
});


// --- HÀM GỬI LỆNH ---

/**
 * Gửi lệnh đến cân
 * @param command Lệnh cần gửi ('T', 'Z', hoặc 'R')
 */
function sendCommand(command: 'T' | 'Z' | 'R') {
  if (!port.isOpen) {
    console.error('Cổng chưa mở. không thể gửi lệnh.');
    return;
  }

  port.write(command, (err) => {
    if (err) {
      return console.error('Lỗi khi gửi lệnh:', err.message);
    }
    console.log(`Đã gửi lệnh '${command}' đến cân.`);
  });
}

// Ví dụ về cách sử dụng hàm gửi lệnh (bạn có thể gọi các hàm này dựa trên logic ứng dụng của mình)
// sendCommand('T'); // Gửi lệnh trừ bì
// sendCommand('Z'); // Gửi lệnh về 0
// sendCommand('R'); // Gửi lệnh yêu cầu dữ liệu