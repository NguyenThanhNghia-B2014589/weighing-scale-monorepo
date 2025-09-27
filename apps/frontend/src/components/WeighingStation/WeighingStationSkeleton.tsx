// src/components/WeighingStation/WeighingStationSkeleton.tsx

import React from 'react';

// Component con cho các thẻ thông số skeleton
const SkeletonStatCard = () => (
  <div className="rounded-xl p-4 shadow-md border bg-gray-200 border-gray-300 h-[104px] w-full">
      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
  </div>
);

function WeighingStationSkeleton() {
  return (
    // animate-pulse sẽ tạo hiệu ứng nhấp nháy cho tất cả các phần tử con
    <div className=" bg-sky-200 text-slate-800">
      <main className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Title Row Skeleton */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Trạm Cân</h1>

        {/* Weight + Stats Skeleton */}
        <section className="animate-pulse flex flex-col lg:flex-row gap-5 mb-6">
          {/* Big weight card skeleton */}
          <div className="lg:w-2/3">
            <div className="rounded-xl bg-gray-200 shadow-md p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-12 bg-gray-300 rounded w-48"></div>
                  </div>
                  <div className="h-10 bg-gray-300 rounded-xl w-36"></div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
                <div className="h-2 flex-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Stat cards skeleton */}
          <div className="lg:w-1/3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </section>

        {/* Submit Button Skeleton */}
        <div className="flex justify-end mb-6">
          <div className="h-12 w-full px-40 md:w-40 bg-gray-200 rounded-xl"></div>
        </div>
        
        {/* Detail table Skeleton */}
        <section className="rounded-xl bg-gray-200 shadow-md overflow-hidden mb-6">
          <div className="bg-gray-300 h-12"></div>
          <div className="h-20 border-t border-gray-300"></div>
        </section>

        {/* Scan area Skeleton */}
        <section className="rounded-xl bg-gray-200 shadow-md p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="h-12 flex-1 bg-gray-300 rounded-xl"></div>
            <div className="h-12 w-full px-20 sm:w-auto bg-gray-300 rounded-xl"></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WeighingStationSkeleton;