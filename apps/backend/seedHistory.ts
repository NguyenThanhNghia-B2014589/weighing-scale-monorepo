// apps/backend/seedHistory.ts

import pool from './src/config/db.js';

// Dữ liệu mẫu mà chúng ta muốn thêm vào database
const historyData = [
  {
    user_id: 'admin',
    user_name: 'Nguyen Van A (Admin)',
    time: '2025-08-25 08:20:00',
    code: '123',
    name: 'Phôi keo A',
    solo: 'Lô 1',
    somay: 'Máy 1',
    weight: 550.0,
    final_weight: 551.5,
  },
  {
    user_id: 'user01',
    user_name: 'Tran Thi B',
    time: '2025-08-25 09:30:15',
    code: '456',
    name: 'Phôi keo B',
    solo: 'Lô 2',
    somay: 'Máy 3',
    weight: 620.5,
    final_weight: 620.0,
  },
  {
    user_id: 'admin',
    user_name: 'Nguyen Van A (Admin)',
    time: '2025-08-26 10:05:45',
    code: '789',
    name: 'Phôi keo C',
    solo: 'Lô 5',
    somay: 'Máy 1',
    weight: 700.0,
    final_weight: 705.0,
  },
  {
    user_id: 'user01',
    user_name: 'Tran Thi B',
    time: '2025-08-26 11:15:20',
    code: '456',
    name: 'Phôi keo B',
    solo: 'Lô 2',
    somay: 'Máy 3',
    weight: 620.5,
    final_weight: 622.5,
  }
];

async function seedHistory() {
  console.log('Bắt đầu gieo dữ liệu lịch sử...');
  
  try {
    // Xóa tất cả dữ liệu cũ trong bảng để tránh trùng lặp
    //await pool.query('DELETE FROM weighing_history;');
    //console.log('Đã xóa dữ liệu lịch sử cũ.');

    // Chèn từng bản ghi mới vào database
    for (const record of historyData) {
      const queryText = `
        INSERT INTO weighing_history(user_id, user_name, time, code, name, solo, somay, weight, final_weight) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      const values = [
        record.user_id, record.user_name, record.time, record.code,
        record.name, record.solo, record.somay, record.weight, record.final_weight
      ];
      await pool.query(queryText, values);
    }

    console.log('Gieo dữ liệu thành công! Đã thêm', historyData.length, 'bản ghi.');

  } catch (error) {
    console.error('Lỗi khi gieo dữ liệu:', error);
  } finally {
    // Đóng kết nối đến database sau khi hoàn tất
    await pool.end();
  }
}

seedHistory();