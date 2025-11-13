/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/services/scaleService.ts

export interface ScaleData {
  status: string; // ST (stable) hoặc US (unstable)
  weightType: string; // NT (net) hoặc GS (gross)
  sign: string; // '+' hoặc '-'
  value: number;
  unit: string;
}

class ScaleService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private listeners: ((data: ScaleData) => void)[] = [];
  private connectionStatusListeners: ((connected: boolean) => void)[] = [];
  private isReading = false;
  
  // 🔹 Throttle: chỉ notify listeners mỗi 300ms
  private lastNotifyTime = 0;
  private throttleInterval = 300; // ms
  private pendingData: ScaleData | null = null;

  /**
   * Kiểm tra xem trình duyệt có hỗ trợ Web Serial API không
   */
  isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Yêu cầu người dùng chọn cổng COM
   */
  async requestPort(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('Web Serial API không được hỗ trợ trong trình duyệt này');
      return false;
    }

    try {
      // Yêu cầu người dùng chọn cổng
      this.port = await navigator.serial.requestPort();
      return true;
    } catch (error) {
      console.error('Người dùng đã hủy chọn cổng:', error);
      return false;
    }
  }

  /**
   * Kết nối với cân
   */
  async connect(baudRate: number = 9600): Promise<boolean> {
    if (!this.port) {
      console.error('Chưa chọn cổng COM. Vui lòng gọi requestPort() trước.');
      return false;
    }

    try {
      // Mở cổng với cấu hình
      console.log(`[ScaleService] Đang mở cổng với baudRate: ${baudRate}`);
      await this.port.open({
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      });

      console.log('✅ Đã kết nối với cân');
      this.notifyConnectionStatus(true);

      // Bắt đầu đọc dữ liệu
      this.startReading();

      // 🔍 DEBUG: Tự động gửi lệnh 'R' sau 500ms để yêu cầu cân gửi dữ liệu
      setTimeout(() => {
        console.log('[ScaleService] Gửi lệnh R tự động để yêu cầu dữ liệu...');
        this.sendCommand('R');
      }, 500);

      return true;

    } catch (error) {
      console.error('Lỗi khi kết nối với cân:', error);
      this.notifyConnectionStatus(false);
      return false;
    }
  }

  /**
   * Đọc dữ liệu liên tục từ cân
   */
  private async startReading() {
  if (!this.port?.readable || this.isReading) return;

  this.isReading = true;
  const textDecoder = new TextDecoderStream();
    
    // Sử dụng pipeThrough với TransformStream (như code gốc của bạn)
    // để TypeScript hiểu đúng kiểu dữ liệu cho pipeTo
  const readableStreamClosed = this.port.readable
   .pipeThrough(new TransformStream({
    transform(chunk: any, controller: any) {
     controller.enqueue(new Uint8Array(chunk));
    },
   }))
   .pipeTo(textDecoder.writable);
  
    this.reader = textDecoder.readable.getReader();

  let buffer = ''; // Dùng buffer để xử lý
  let readChunkCount = 0; // Debug: đếm chunk

  try {
   while (this.isReading) {
    const { value, done } = await this.reader.read();
    
    if (done) {
     console.log('[ScaleService] Reader done, breaking loop');
     break;
    }
    if (!value) continue;

    readChunkCount++;

    buffer += value; // Thêm vào buffer

    // Robust split: hỗ trợ \r\n, \n, \r
    const lines = buffer.split(/\r\n|\n|\r/);
    buffer = lines.pop() || ''; // Giữ lại phần thừa

    for (const line of lines) {
     if (line.trim()) {
      const parsedData = this.parseCla5Data(line);
      if (parsedData) {
       this.notifyListeners(parsedData);
      }
     }
    }
   }
  } catch (error) {
   // Expected error khi stream bị cancel
   if (error instanceof Error && error.name === 'AbortError') {
    console.log('[ScaleService] Stream bị cancel (AbortError) - bình thường');
   } else {
    console.error('Lỗi khi đọc dữ liệu từ cân:', error);
    this.notifyConnectionStatus(false); // Báo lỗi
   }
  } finally {
   try {
    if (this.reader) {
     this.reader.releaseLock();
     console.log('[ScaleService] Reader lock đã release');
    }
   } catch (e) {
    console.warn('[ScaleService] Lỗi release lock:', e);
   }
   
   try {
    await readableStreamClosed.catch(() => {
     console.log('[ScaleService] readableStreamClosed promise rejected (bình thường)');
    });
   } catch (e) {
    console.warn('[ScaleService] Error chờ readableStreamClosed:', e);
   }
   
   this.isReading = false;
   console.log(`[ScaleService] Đã dừng reading sau ${readChunkCount} chunk`);
  }
 }

  /**
   * Phân tích dữ liệu từ cân
   * Hỗ trợ 2 định dạng:
   * - CLA-5: ST,NT,+  218.64g
   * - Đơn giản: 0.00kg (chỉ giá trị + đơn vị)
   */
  private parseCla5Data(data: string): ScaleData | null {
    const trimmedData = data.trim();
    
    // Thử parse CLA-5 format trước (có dấu phẩy)
    if (trimmedData.includes(',')) {
      return this.parseCla5Format(trimmedData);
    }
    
    // Thử parse định dạng đơn giản (chỉ giá trị + đơn vị)
    return this.parseSimpleFormat(trimmedData);
  }

  /**
   * Parse CLA-5 format: ST,NT,+  218.64g
   */
  private parseCla5Format(data: string): ScaleData | null {
    const parts = data.split(',');
    if (parts.length < 3) {
      console.warn(`[ScaleService] parseCla5Format: dữ liệu không đủ phần (${parts.length}), dữ liệu gốc:`, data);
      return null;
    }

    try {
      const status = parts[0].trim(); // ST hoặc US
      const weightType = parts[1].trim(); // NT hoặc GS
      const remaining = parts[2].trim();
      const sign = remaining.substring(0, 1); // '+' hoặc '-'
      const valueAndUnit = remaining.substring(1).trim();
      
      console.log(`[ScaleService] parseCla5Format: status="${status}", weightType="${weightType}", sign="${sign}", valueAndUnit="${valueAndUnit}"`);
      
      // Tách giá trị và đơn vị
      let valueStr = '';
      let unit = '';
      for (let i = 0; i < valueAndUnit.length; i++) {
        const char = valueAndUnit[i];
        if (!isNaN(parseFloat(char)) || char === '.') {
          valueStr += char;
        } else if (char !== ' ') {
          unit += char;
        }
      }

      const value = parseFloat(valueStr);
      
      console.log(`[ScaleService] parseCla5Format: valueStr="${valueStr}", value=${value}, unit="${unit}"`);

      if (isNaN(value)) {
        console.warn(`[ScaleService] parseCla5Format: value không phải số, valueStr="${valueStr}"`);
        return null;
      }

      return {
        status,
        weightType,
        sign,
        value,
        unit,
      };
    } catch (error) {
      console.error("Lỗi khi phân tích CLA-5 format:", error);
      return null;
    }
  }

  /**
   * Parse định dạng đơn giản: 0.00kg, 10.5g, 218.64kg, v.v.
   */
  private parseSimpleFormat(data: string): ScaleData | null {
    try {
      // Regex để tách số và đơn vị
      // Ví dụ: "0.00kg" → ["0.00", "kg"], "10.5g" → ["10.5", "g"]
      const match = data.match(/^([+-]?\d+\.?\d*)\s*([a-zA-Z%]*)$/);
      
      if (!match) {
        return null;
      }

      const valueStr = match[1];
      const unit = match[2] || '';
      const value = parseFloat(valueStr);

      if (isNaN(value)) {
        return null;
      }

      // Trả về với status/weightType mặc định
      return {
        status: 'ST', // Giả định ổn định
        weightType: 'NT', // Giả định net
        sign: value >= 0 ? '+' : '-',
        value: Math.abs(value),
        unit,
      };
    } catch {
      return null;
    }
  }

  /**
   * Ngắt kết nối với cân
   */
  async disconnect() {
    console.log('[ScaleService] Bắt đầu disconnect...');
    this.isReading = false;

    // Bước 1: Release reader lock
    if (this.reader) {
      try {
        console.log('[ScaleService] Đang release reader lock...');
        await this.reader.cancel();
      } catch (error) {
        console.error('Lỗi khi hủy reader:', error);
      }
      this.reader = null;
    }

    // Bước 2: Wait 100ms để stream hoàn toàn release
    await new Promise(resolve => setTimeout(resolve, 100));

    // Bước 3: Đóng port
    if (this.port) {
      try {
        console.log('[ScaleService] Đang close port...');
        
        // Cố gắng close readable stream nếu có
        if (this.port.readable) {
          try {
            await this.port.readable.cancel();
            console.log('[ScaleService] Đã cancel readable stream');
          } catch (e) {
            console.warn('[ScaleService] Không thể cancel readable stream:', e);
          }
        }

        // Cố gắng close writable stream nếu có
        if (this.port.writable) {
          try {
            await this.port.writable.abort();
            console.log('[ScaleService] Đã abort writable stream');
          } catch (e) {
            console.warn('[ScaleService] Không thể abort writable stream:', e);
          }
        }

        // Cuối cùng close port
        await this.port.close();
        console.log('[ScaleService] Port đã close');
      } catch (error) {
        console.error('Lỗi khi đóng cổng:', error);
      }
      this.port = null;
    }

    console.log('❌ Đã ngắt kết nối với cân');
    this.notifyConnectionStatus(false);
  }

  /**
   * Gửi lệnh đến cân (nếu cần)
   */
  async sendCommand(command: 'T' | 'Z' | 'R') {
    if (!this.port?.writable) {
      console.error('Cổng chưa mở, không thể gửi lệnh.');
      return;
    }

    const writer = this.port.writable.getWriter();
    try {
      await writer.write(new TextEncoder().encode(command));
      console.log(`Đã gửi lệnh '${command}' đến cân.`);
    } catch (error) {
      console.error('Lỗi khi gửi lệnh:', error);
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Đăng ký listener để nhận dữ liệu từ cân
   */
  onScaleData(callback: (data: ScaleData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Đăng ký listener để nhận trạng thái kết nối
   */
  onConnectionStatus(callback: (connected: boolean) => void): () => void {
    this.connectionStatusListeners.push(callback);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(data: ScaleData) {
    const now = Date.now();
    const timeSinceLastNotify = now - this.lastNotifyTime;

    // 🔹 Nếu chưa đủ throttle interval, lưu data pending
    if (timeSinceLastNotify < this.throttleInterval) {
      this.pendingData = data;
      return;
    }

    // 🔹 Đủ thời gian, notify ngay
    this.lastNotifyTime = now;
    this.listeners.forEach(callback => callback(data));

    // 🔹 Nếu có pending data, schedule notify cho pending data
    if (this.pendingData) {
      const delayedData = this.pendingData;
      this.pendingData = null;
      setTimeout(() => this.notifyListeners(delayedData), this.throttleInterval);
    }
  }

  private notifyConnectionStatus(connected: boolean) {
    this.connectionStatusListeners.forEach(callback => callback(connected));
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.port !== null && this.isReading;
  }
}


// Singleton instance
export const scaleService = new ScaleService();