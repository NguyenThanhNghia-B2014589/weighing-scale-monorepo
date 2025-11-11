
import React from "react";
import { useWeighingStation } from "../../hooks/useWeighingStation";
import Spinner from '../ui/Spinner/Spinner';
import Notification from '../ui/Notification/Notification';
import WeighingStationSkeleton from "./WeighingStationSkeleton";
import {
  ScanLine,
  Check, X
} from "lucide-react";

function WeighingStationNew() {
  const {
    // Lấy tất cả state
    standardWeight,
    deviationPercent,
    currentWeight,
    deviationPct,
    scannedCode,
    tableData,
    minWeight,
    maxWeight,
    isWeightValid,
    notificationMessage,
    notificationType,
    isLoading,
    isSubmit,
    isPageLoading,
    isUiDisabled,
    tableHeaders,
    tableValues,
    weighingType,
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit,
    handleDeviationChange,
  } = useWeighingStation();

  if (isPageLoading) {
    return <WeighingStationSkeleton />;
  }

  const getSubmitButtonContent = () => {
    if (isSubmit) return "Đang lưu...";
    if (weighingType === 'nhap') return "Hoàn Tất Cân Nhập";
    if (weighingType === 'xuat') return "Hoàn Tất Cân Xuất";
    return "Hoàn tất";
  };
  
  const pageBgClass = weighingType === 'nhap' ? 'bg-[#79cfbb]' : 'bg-sky-200';

  return (
    <div className={`${pageBgClass} text-slate-800 max-w-auto mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-300`}>
      <Notification 
        message={notificationMessage}
        type={notificationType}
      />
      
      {isUiDisabled && (
      <div className="fixed inset-0 lg:scale-125 bg-black bg-opacity-25 z-40 "></div>
      )}
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Trạm Cân</h1>

      {/* --- KHU VỰC "WEIGHT + ACTIONS" (ĐÃ SỬA) --- */}
      <section className="flex flex-col lg:flex-row gap-5 mb-6">
        
        {/* 1. CỘT TRÁI: BIG WEIGHT CARD (ĐÃ SỬA LẠI HOÀN TOÀN) */}
        <div className="lg:w-2/3">
          <div className="rounded-xl bg-white shadow-md p-5 sm:p-6 h-full flex flex-col justify-between"> 
          
            {/* --- Bố cục mới bên trong card --- */}
            <div>
              {/* Dòng 1: Tiêu đề và Input */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-s font-medium text-slate-500">Trọng lượng hiện tại</p>
                    
                {/* Input cân nặng (Style mới) */}
                <label className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 hidden sm:inline">Nhập (test):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={currentWeight ?? ''}
                      onChange={handleCurrentWeightChange}
                      className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-right font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-400"
                      disabled={!tableData || isLoading}
                    />
                </label>
              </div>
                  
              {/* Dòng 2: Trọng lượng lớn */}
              <div className="flex items-end gap-3 mb-4">
                <span className={`text-7xl font-black tabular-nums leading-none ${
                  currentWeight !== null && tableData ? (isWeightValid ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-800'
                }`}>
                  {(currentWeight ?? 0).toFixed(3)}
                </span>

                <span className="pb-2 text-2xl font-semibold text-slate-500">Kg</span>
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Dòng 3: MIN / MAX */}
              <div className="flex flex-col sm:flex-row justify-between items-start">
                    
                {/* Nhóm MIN/MAX */}
                <div className="flex gap-20">
                  <div>
                    <p className="text-s font-medium text-slate-500">MIN</p>
                    <p className="text-2xl font-bold text-emerald-500">{minWeight.toFixed(3)} kg</p>
                  </div>
                  <div>
                    <p className="text-s font-medium text-slate-500">Tiêu Chuẩn</p>
                    <p className="text-2xl font-bold text-black">{standardWeight.toFixed(3)} kg</p>
                  </div>
                  <div>
                    <p className="text-s font-medium text-slate-500">MAX</p>
                    <p className="text-2xl font-bold text-rose-500">{maxWeight.toFixed(3)} kg</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Dòng 4: Thanh chênh lệch (Đã sửa) */}
            <div>
              {/* Label chênh lệch */}
              <span className={`text-sm font-semibold ${
                isWeightValid ? "text-emerald-700" : "text-rose-700"
              }`}>
                  
                Chênh lệch: {deviationPct}%
              </span>

              {/* Thanh bar */}
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden mt-1">
                <div className={(isWeightValid ? "bg-emerald-500" : "bg-rose-500") + " h-full transition-all"}
                  style={{ width: `${Math.min(100, Math.abs((deviationPct / deviationPercent) * 50 + 50))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Cột phải: Stat cards & Scan (ĐÃ SỬA) */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {/* Stat cards (Chỉ 2 card) */}
          <div className="grid grid-cols-1 gap-4">

            <div className="rounded-xl p-4 shadow-md border bg-white border-slate-100">
              <label htmlFor="deviation-select" className="text-sm font-semibold uppercase tracking-wide text-slate-500">% TỐI ĐA</label>
              <select
                id="deviation-select"
                value={deviationPercent}
                onChange={handleDeviationChange}
                className="mt-1 text-4xl font-extrabold tabular-nums w-full bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
              >
                <option value={1}>1%</option>
                <option value={3}>3%</option>
                <option value={5}>5%</option>
              </select>
            </div>
          </div>
                
          {/* Scan Area (ĐÃ DI CHUYỂN LÊN) */}
          <div className="rounded-xl bg-white shadow-md p-5 sm:p-6 flex-1">
            <div className="flex flex-col h-full justify-between gap-3">
              <input
                type="text"
                placeholder="Scan hoặc Nhập mã tại đây..."
                className="flex-1 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-slate-800 font-mono font-bold placeholder:italic focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={scannedCode}
                onChange={handleCodeChange}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
              <button
                className="shrink-0 flex items-center justify-center w-full rounded-xl bg-[oklch(0.65_0.14_142)] px-6 py-3 text-white text-lg font-semibold hover:bg-emerald-700 active:scale-[.95] transition shadow-sm disabled:cursor-wait"
                onClick={handleScan}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="dm" /> : <div className="flex items-center space-x-2"><ScanLine className="h-5 w-5" /><span>Scan</span></div>}
              </button>
            </div>
          </div>

          {/* --- NÚT HOÀN TẤT --- */}
          <div className="flex items-center mb-6"> 
            <button
              className={`w-full flex justify-center rounded-xl px-12 py-3 text-white text-lg font-bold 
                transition-all shadow-sm disabled:bg-slate-300 disabled:text-slate-500 active:scale-95 disabled:cursor-not-allowed whitespace-nowrap
                ${weighingType === 'nhap' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                ${weighingType === 'xuat' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              `}
              onClick={handleSubmit}
              disabled={!isWeightValid || !tableData || isSubmit || !weighingType}
            >
              {getSubmitButtonContent()}
            </button>
          </div>
        </div>
      </section>
      
      

      {/* --- KHU VỰC TÓM TẮT OVNO (Giữ nguyên) --- */}
      {tableData && (
        <section className="rounded-xl bg-white shadow-md p-5 sm:p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tóm Tắt Lệnh Sản Xuất: {tableData.ovNO}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tổng Mục Tiêu */}
            <InfoChip label="Tổng Mục Tiêu" value={`${tableData.totalTargetQty.toFixed(3)} kg`} />
            {/* Tổng Đã Nhập */}
            <InfoChip label="Tổng Đã Nhập" value={`${tableData.totalNhapWeighed.toFixed(3)} kg`} />
            {/* Tổng Đã Xuất */}
            <InfoChip label="Tổng Đã Xuất" value={`${tableData.totalXuatWeighed.toFixed(3)} kg`} />
            {/* Tồn Kho */}
            <InfoChip 
              label="Tồn Kho (Nhập - Xuất)" 
              value={`${(tableData.totalNhapWeighed - tableData.totalXuatWeighed).toFixed(3)} kg`} 
            />
            {/* Tiến độ mẻ */}
            <InfoChip 
              label="Tiến độ (Đã cân nhập)" 
              value={`${tableData.x_WeighedNhap} / ${tableData.y_TotalPackages} mẻ`} 
            />
            {/* Trạng thái mã này */}
            <div className="col-span-2 md:col-span-2">
              <InfoChip 
                label="Trạng thái mã này" 
                value={
                  tableData.isNhapWeighed 
                  ? (tableData.isXuatWeighed ? 'Đã hoàn thành' : 'Đã nhập, chờ xuất') 
                  : 'Chưa cân nhập'
                } 
                icon={
                  tableData.isNhapWeighed 
                  ? <Check className="w-5 h-5 text-green-500" />
                  : <X className="w-5 h-5 text-red-500" />
                }
              />
            </div>
          </div>
        </section>
      )}

      {/* Detail table */}
      <section className="rounded-xl bg-white shadow-md overflow-hidden mb-6">
            
        {/* Phần Header của bảng */}
        <div className="hidden md:grid grid-cols-7 border-t border-r border-gray-300">
          {tableHeaders.map((header) => ( <div key={header} className="bg-sky-400 text-black font-semibold text-center p-3 border-b border-l border-gray-300">{header}</div> ))}
        </div>

        {/* --- PHẦN BODY CỦA BẢNG --- */}
        {tableData ? (
          <div className="grid grid-cols-1 md:grid-cols-7 border-r border-b border-gray-300 md:border-t-0">
            {tableValues.map((value, index) => (
              <div 
                key={index} 
                className="bg-gray-100 p-3 md:min-h-20 border-t border-l border-gray-300 md:border-t-0 flex items-start md:items-center justify-start md:justify-center font-medium text-gray-800 break-words"
              >
                <span className="font-bold md:hidden mr-2">{tableHeaders[index]}: </span>
                {value}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-3 md:h-20 border-t border-l border-r border-b border-gray-300 md:border-t-0 flex items-center justify-center text-slate-400 italic">
            Vui lòng quét mã để hiển thị thông tin
          </div>
        )}
      </section>
    </div>
  );
}

  // --- CÁC COMPONENT PHỤ ---

  /*function StatCard({ label, value, icon, subtle = false }: { label: string; value: string | number; icon?: React.ReactNode; subtle?: boolean }) {
    return (
      <div className={`rounded-xl p-4 shadow-md border ${subtle ? "bg-white border-slate-100" : "bg-gradient-to-br from-sky-50 to-white border-sky-100"}`}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          {icon}
        </div>
        <p className="mt-1 text-4xl font-extrabold tabular-nums">{value}</p>
      </div>
    );
  }*/

  function InfoChip({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          {icon}
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </div>
    );
  }


export default WeighingStationNew;