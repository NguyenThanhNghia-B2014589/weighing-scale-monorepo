// src/data/weighingData.ts

// 1. Định nghĩa và export kiểu dữ liệu
export type WeighingData = {
  code: string;
  name: string;
  solo: string;
  somay: string;
  weight: number;
  userID: string;
  user: string;
  finalWeight: number;
  time: string;
};

// 2. Định nghĩa và export dữ liệu giả lập
export const mockApiData: Record<string, WeighingData> = {
  "1": {
    code: "123",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: 'admin',
    user: "Nguyen Van A",
    finalWeight: 550.0,
    time: "09:35 15/06/2025"
  },
  "2": {
    code: "456",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "3": {
    code: "789",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "4": {
    code: "abc",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "5": {
    code: "cba",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "6": {
    code: "321",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "7": {
    code: "654",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "8": {
    code: "987",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "9": {
    code: "346",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "10": {
    code: "912",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "11": {
    code: "997",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "12": {
    code: "4F56E7",
    name: "Phôi keo D",
    solo: "Lô 3",
    somay: "Máy 5",
    weight: 789.5,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "13": {
    code: "E3F2B9",
    name: "Phôi keo C",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 612,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "14": {
    code: "A9D8C2",
    name: "Phôi cao su E",
    solo: "Lô 4",
    somay: "Máy 4",
    weight: 876,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "15": {
    code: "B6A7C8",
    name: "Phôi keo A",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 523,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "16": {
    code: "C9D1E6",
    name: "Phôi keo B",
    solo: "Lô 1",
    somay: "Máy 2",
    weight: 915,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "17": {
    code: "D8E2F9",
    name: "Phôi keo A",
    solo: "Lô 3",
    somay: "Máy 5",
    weight: 678,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "18": {
    code: "E7F3A5",
    name: "Phôi keo C",
    solo: "Lô 4",
    somay: "Máy 1",
    weight: 599,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "19": {
    code: "F6A1B4",
    name: "Phôi keo D",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 745,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "20": {
    code: "A1B3C4",
    name: "Phôi cao su E",
    solo: "Lô 1",
    somay: "Máy 2",
    weight: 834,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
  "21": {
    code: "B2C4D5",
    name: "Phôi keo A",
    solo: "Lô 3",
    somay: "Máy 5",
    weight: 689,
    userID: '',
    user: "",
    finalWeight: 0,
    time: ""
  },
};

// --- Dữ liệu để tạo giá trị ngẫu nhiên ---
const productNames = ["Phôi keo A", "Phôi keo B", "Phôi keo C", "Phôi keo D", "Phôi cao su E"];
const soloNumbers = ["Lô 1", "Lô 2", "Lô 3", "Lô 4"];
const machineNumbers = ["Máy 1", "Máy 2", "Máy 3", "Máy 4", "Máy 5"];
const userIDs = ["admin", "user01", "user02", "user03", "user04"];
const userNames = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E"];

// Hàm tiện ích để lấy ngẫu nhiên một phần tử từ mảng
function getRandomItem<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Hàm tiện ích để tạo ngày/giờ ngẫu nhiên
function getRandomTime(): string {
  const year = 2024;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Giới hạn 28 để tránh lỗi
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);

  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinute = minute.toString().padStart(2, '0');
  const formattedDay = day.toString().padStart(2, '0');
  const formattedMonth = month.toString().padStart(2, '0');
  
  return `${formattedHour}:${formattedMinute} ${formattedDay}/${formattedMonth}/${year}`;
}

export type WeighingDataRandom = {
  code: string;
  name: string;
  solo: string;
  somay: string;
  weight: number;
  userID: string;
  user: string;
  finalWeight: number;
  time: string;
};

export const mockApiRandomData: Record<string, WeighingDataRandom> = {};

const numberOfRecords = 100;

for (let i = 1; i <= numberOfRecords; i++) {
  // Tạo ngẫu nhiên các giá trị từ các mảng đã định nghĩa ở trên
  const randomProductName = getRandomItem(productNames);
  const randomSolo = getRandomItem(soloNumbers);
  const randomSomay = getRandomItem(machineNumbers);
  const randomUserID = getRandomItem(userIDs);
  const randomUserName = getRandomItem(userNames);

  // Tạo code ngẫu nhiên và trọng lượng ngẫu nhiên
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const weight = Math.floor(Math.random() * (1000 - 500 + 1)) + 500; // Trọng lượng từ 500 đến 1000
  // Tính dao động ±3%
  const variation = (Math.random() * 0.06) - 0.03;
  const adjustedWeight = Math.round(weight * (1 + variation));
  // Ngẫu nhiên chọn finalWeight = weight hoặc adjustedWeight
  const finalWeight = Math.random() < 0.5 ? weight : adjustedWeight;

  // Gán dữ liệu vào đối tượng mockApiData
  mockApiRandomData[i.toString()] = {
    code: code,
    name: randomProductName,
    solo: randomSolo,
    somay: randomSomay,
    weight: weight,
    userID: randomUserID,
    user: randomUserName,
    finalWeight: finalWeight,
    time: getRandomTime(),
  };
} 