// src/components/WeighingStation/WeighingStationModern.tsx
import React from "react";
import { useWeighingStation } from "../../hooks/useWeighingStation";
import Spinner from '../ui/Spinner/Spinner';
import Notification from '../ui/Notification/Notification';
import WeighingStationSkeleton from "./WeighingStationSkeleton";
import {
  ScanLine,
} from "lucide-react";

// --- COMPONENT GIAO DIỆN MỚI ---
function WeighingStationNew() {
  // SỬ DỤNG HOOK ĐỂ LẤY LOGIC VÀ STATE
  const {
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
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit,
  } = useWeighingStation();

  // HIỂN THỊ SKELETON NẾU isPageLoading LÀ TRUE
  if (isPageLoading) {
    return <WeighingStationSkeleton />;
  }

  return (
      <div className="bg-sky text-slate-800 max-w-auto mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Notification 
          message={notificationMessage}
          type={notificationType}
        />
        
        {/* Lớp phủ màu đen và logic vô hiệu hóa UI */}
        {isUiDisabled && (
          <div className="fixed inset-0 lg:scale-125 bg-black bg-opacity-25 z-40 "></div>
        )}
        
          {/* Title Row */}
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Trạm Cân</h1>

          {/* --- KHU VỰC "WEIGHT + STATS" --- */}
          <section className="flex flex-col lg:flex-row gap-5 mb-6">
            
            {/* Cột trái: Big weight card */}
            <div className="lg:w-2/3">
              {/* Thêm h-full và flex flex-col để nội dung có thể giãn ra */}
              <div className="rounded-xl bg-white shadow-md p-5 sm:p-6 h-full flex flex-col justify-between"> 
                {/* Phần trên của card */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-s font-medium text-slate-500">Trọng lượng hiện tại</p>
                      <div className="mt-1 flex items-end gap-3">
                        <span className={`text-6xl sm:text-6xl font-black tabular-nums leading-none ${
                          currentWeight !== null && tableData ? (isWeightValid ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-800'
                        }`}>
                          {(currentWeight ?? 0).toFixed(1)}
                        </span>
                        <span className="pb-1 text-lg font-semibold text-slate-500">g</span>
                      </div>
                    </div>
                    {/* */}
                    <label className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">Nhập cân nặng:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={currentWeight ?? ''}
                        onChange={handleCurrentWeightChange}
                        className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-400"
                        disabled={!tableData || isLoading}
                      />
                    </label>
                  </div>
                </div>

                {/* Phần dưới của card (thanh chênh lệch) */}
                {<div className="mt-4 flex items-center justify-between gap-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      isWeightValid ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    Chênh lệch: {deviationPct}%
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={(isWeightValid ? "bg-emerald-400" : "bg-rose-400") + " h-full transition-all"}
                      style={{ width: `${Math.min(100, Math.abs((deviationPct / deviationPercent) * 50 + 50))}%` }}
                    />
                  </div>
                </div>}
              </div>
            </div>

            {/* Cột phải: Stat cards */}
            <div className="lg:w-1/3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
              <StatCard label="Tiêu chuẩn" value={`${standardWeight.toFixed(1)} g`} />
              <StatCard label="% tối đa" value={`${deviationPercent}%`} />
              <StatCard label="MIN" value={`${minWeight.toFixed(1)} g`} subtle />
              <StatCard label="MAX" value={`${maxWeight.toFixed(1)} g`} subtle />
            </div>
          </section>
          
          <div className="flex items-center justify-end mb-6">
            <button
              className="w-full md:w-40 flex justify-center rounded-xl bg-[#00446e] px-40 py-3 text-white font-bold hover:bg-[#0b7abe] 
                        transition-colors shadow-sm disabled:bg-slate-300 disabled:text-slate-500 active:scale-95 disabled:cursor-not-allowed whitespace-nowrap"
                  
              onClick={handleSubmit}
              disabled={!isWeightValid || !tableData || isLoading }
            >
              {isSubmit ? "Đang lưu..." : "Hoàn tất"}
            </button>
          </div>

          {/* Detail table */}
        <section className="rounded-xl bg-white shadow-md overflow-hidden mb-6">
          
          {/* Phần Header của bảng */}
          <div className="hidden md:grid grid-cols-6 border-t border-r border-gray-300">
            {tableHeaders.map((header) => ( <div key={header} className="bg-sky-400 text-black font-semibold text-center p-3 border-b border-l border-gray-300">{header}</div> ))}
          </div>

          {/* --- PHẦN BODY CỦA BẢNG --- */}
          {tableData ? (
            <div className="grid grid-cols-1 md:grid-cols-6 border-r border-b border-gray-300 md:border-t-0">
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

          {/* Scan area */}
          <section className="rounded-xl bg-white shadow-md p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Scan hoặc Nhập mã tại đây..."
                className="flex-1 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-slate-800 font-mono font-bold placeholder:italic focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={scannedCode}
                onChange={handleCodeChange}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                
              />
              <button
                className="shrink-0 flex items-center justify-center w-full md:w-40 rounded-xl bg-[oklch(0.65_0.14_142)] px-6 py-3 text-white font-semibold hover:bg-emerald-700 active:scale-[.95] transition shadow-sm disabled:cursor-wait"
                onClick={handleScan}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="dm" /> : <div className="flex items-center space-x-2"><ScanLine className="h-5 w-5" /><span>Scan</span></div>}
              </button>
            </div>
          </section>
      </div>
  );
}

// --- CÁC COMPONENT PHỤ ---

function StatCard({ label, value, icon, subtle = false }: { label: string; value: string | number; icon?: React.ReactNode; subtle?: boolean }) {
  return (
    <div className={`rounded-xl p-4 shadow-md border ${subtle ? "bg-white border-slate-100" : "bg-gradient-to-br from-sky-50 to-white border-sky-100"}`}>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-4xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}


export default WeighingStationNew;