import React, { useState, useEffect } from 'react';
import axios from 'axios';

// LocalDateTime 형식을 "YYYY-MM-DD HH:MM"으로 바꿔주는 헬퍼 함수
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  // 'T'를 공백으로 바꾸고, 초(seconds) 부분을 잘라냅니다.
  return dateTimeString.replace('T', ' ').substring(0, 16);
};

export default function WorkOrderInquiry() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // Controller에 정의된 /api/work-orders 경로로 데이터를 요청합니다.
        const response = await axios.get('http://localhost:8080/api/work-orders');
        setWorkOrders(response.data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">작업지시 목록을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">에러가 발생했습니다: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">작업지시 조회</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase">
              <th className="py-3 px-4">지시 ID</th>
              <th className="py-3 px-4">지시 내용</th>
              <th className="py-3 px-4">상태</th>
              <th className="py-3 px-4">계획 시작일</th>
              <th className="py-3 px-4">계획 종료일</th>
              <th className="py-3 px-4">계획/생산 수량</th>
              <th className="py-3 px-4">작업장 ID</th>
              <th className="py-3 px-4">공정 ID</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {workOrders.map((order) => (
              <tr key={order.workOrderId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{order.workOrderId}</td>
                <td className="py-3 px-4">{order.instruction}</td>
                <td className="py-3 px-4">{order.currentStatus}</td>
                <td className="py-3 px-4">{formatDateTime(order.plannedStartDate)}</td>
                <td className="py-3 px-4">{formatDateTime(order.plannedEndDate)}</td>
                <td className="py-3 px-4">{`${order.quantityProduced} / ${order.quantityToProduce}`}</td>
                <td className="py-3 px-4">{order.workCenterId}</td>
                <td className="py-3 px-4">{order.processId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}