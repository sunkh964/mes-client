import React from 'react';

export default function MaterialInventory() {
  return (
    <div className="p-8">
      <div className="p-6 border rounded-lg bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">자재 재고 현황</h1>
        <p className="text-gray-600">
          이 페이지는 향후 ERP 시스템의 재고 API와 연동될 예정입니다.
        </p>
      </div>
    </div>
  );
}