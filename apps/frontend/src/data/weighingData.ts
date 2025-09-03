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
    user: "Nguyễn Văn A",
    finalWeight: 550.0,
    time: "8:20 01/01/2024"
  },
  "2": {
    code: "456",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/02/2024"
  },
  "3": {
    code: "789",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: 'admin',
    user: "Nguyễn Văn A",
    finalWeight: 550.0,
    time: "8:20 01/03/2024"
  },
  "4": {
    code: "abc",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/04/2024"
  },
  "5": {
    code: "cba",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: 'admin',
    user: "Nguyễn Văn A",
    finalWeight: 550.0,
    time: "8:20 01/05/2024"
  },
  "6": {
    code: "321",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/06/2024"
  },
  "7": {
    code: "654",
    name: "Phôi keo A",
    solo: "Lô 1",
    somay: "Máy 1",
    weight: 550.0,
    userID: 'admin',
    user: "Nguyễn Văn A",
    finalWeight: 550.0,
    time: "8:20 01/06/2024"
  },
  "8": {
    code: "987",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/08/2024"
  },
  "9": {
    code: "346",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/09/2024"
  },
  "10": {
    code: "912",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/10/2024"
  },
  "11": {
    code: "997",
    name: "Phôi keo B",
    solo: "Lô 2",
    somay: "Máy 3",
    weight: 620.5,
    userID: 'user01',
    user: "Trần Thị B",
    finalWeight: 620.5,
    time: "8:20 01/11/2024"
  },
};