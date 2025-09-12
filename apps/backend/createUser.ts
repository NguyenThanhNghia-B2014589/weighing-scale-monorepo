// apps/backend/createUser.ts
import bcrypt from 'bcryptjs';
import pool from './src/config/db'; // Import từ file db.ts

async function createUsers() {
  const users = [
    { userID: 'admin', password: '123', userName: 'Nguyen Van A (Admin)', role: 'admin' },
    { userID: 'user01', password: 'password', userName: 'Tran Thi B', role: 'user' }
  ];

  for (const userData of users) {
    const { userID, password, userName, role } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const queryText = 'INSERT INTO users(user_id, password, user_name, role) VALUES($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING';
    await pool.query(queryText, [userID, hashedPassword, userName, role]);
    console.log(`Người dùng "${userID}" đã được xử lý.`);
  }
  
  console.log('Hoàn tất việc tạo người dùng.');
  await pool.end(); // Đóng kết nối sau khi xong
}

createUsers();