import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProcessPlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcessPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        // Controller에 정의된 경로로 API를 호출합니다.
        const response = await axios.get('http://localhost:8080/api/process-plans');
        setPlans(response.data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessPlans();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">생산계획을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">에러가 발생했습니다: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">생산계획 관리</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="py-3 px-4">계획 ID</th>
              <th className="py-3 px-4">블록 ID</th>
              <th className="py-3 px-4">공정 ID</th>
              <th className="py-3 px-4">계획 시작일</th>
              <th className="py-3 px-4">계획 종료일</th>
              <th className="py-3 px-4">예상 작업량</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {plans.map((plan) => (
              // DTO 필드명(camelCase)과 정확히 일치시켜 데이터를 표시합니다.
              <tr key={plan.processPlanId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{plan.processPlanId}</td>
                <td className="py-3 px-4">{plan.blockId}</td>
                <td className="py-3 px-4">{plan.processId}</td>
                <td className="py-3 px-4">{plan.startDate}</td>
                <td className="py-3 px-4">{plan.endDate}</td>
                <td className="py-3 px-4">{plan.expectedWorkload}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}