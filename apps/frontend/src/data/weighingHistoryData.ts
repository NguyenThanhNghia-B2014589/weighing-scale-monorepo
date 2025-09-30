export type HistoryRecord = {
  id: number;
  user_id: string; // Đổi thành snake_case
  user_name: string; // Đổi thành snake_case
  time: string;
  code: string;
  name: string;
  solo: string;
  somay: string;
  weight: number;
  final_weight: number; // Đổi thành snake_case
};