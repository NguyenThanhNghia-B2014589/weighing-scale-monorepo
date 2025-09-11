import {mockApiRandomData} from "../data/weighingData";
import {useMemo} from "react";

export function useDashboard () {
    const weighingHistory = useMemo(() => Object.values(mockApiRandomData), []);

// --- LOGIC XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ ---

// 1. Dữ liệu cho biểu đồ cột: Đếm số lần cân của mỗi người dùng
    const userPerformanceData = useMemo(() => {
        const userCounts = weighingHistory.reduce((acc, item) => {
            acc[item.user] = (acc[item.user] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(userCounts).map(([name, count]) => ({name, 'Số lần cân': count}));
    }, [weighingHistory]);

// 2. Dữ liệu cho biểu đồ tròn: Đếm số lần cân của mỗi loại phôi keo
    const glueTypeData = useMemo(() => {
        const glueCounts = weighingHistory.reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(glueCounts).map(([name, value]) => ({name, value}));
    }, [weighingHistory]);

// 3. DỮ LIỆU MỚI: Xu hướng số lần cân theo thời gian
    const weighingTrendData = useMemo(() => {
        // Nhóm các bản ghi theo tháng/năm
        const monthlyCounts = weighingHistory.reduce((acc, item) => {
            const datePart = item.time.split(' ')[1]; // Lấy phần "01/01/2024"
            const [ , month, year] = datePart.split('/');
            const monthYear = `${month}/${year}`; // Tạo key là "Tháng/Năm"

            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Chuyển đổi thành mảng và sắp xếp theo thời gian
        return Object.entries(monthlyCounts)
            .map(([date, count]) => ({date, "Số lần cân": count}))
            .sort((a, b) => {
                const [monthA, yearA] = a.date.split('/');
                const [monthB, yearB] = b.date.split('/');
                return new Date(`${yearA}-${monthA}-01`).getTime() - new Date(`${yearB}-${monthB}-01`).getTime();
            });
    }, [weighingHistory]);

    const COLORS = ['#0088FE', '#B93992FF', '#00C49F', '#FFBB28', '#FF8042'];

    return {
        userPerformanceData,
        glueTypeData,
        weighingTrendData,
        COLORS,
    };
}