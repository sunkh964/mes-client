import React, { useState, useEffect, useCallback } from 'react';

import { getToken } from '../utils/api';

import axios from 'axios';
// 요청 API 주소
const ProjectPlan_Proxy_API_URL = 'http://localhost:8083/api/proxy/project_plans';

export default function ProjectPlanInquiry() {
  // --- 상태 관리 ---
  // 1. 변수명을 소문자로 시작하도록 수정 (projectPlans)
  const [projectPlans, setProjectPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 불러오기 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError(new Error("로그인이 필요합니다."));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(ProjectPlan_Proxy_API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjectPlans(response.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = async (planToUpdate) => {
        const currentStatus = planToUpdate.status;
        if (currentStatus === 2) { // '완료' 상태이면 더 이상 변경하지 않음
            alert("'완료' 상태의 계획은 더 이상 변경할 수 없습니다.");
            return;
        }

        const nextStatus = (currentStatus + 1) % 3; // 다음 상태 계산 (0->1, 1->2)
        const nextStatusText = getStatusText(nextStatus);

        if (!window.confirm(`'${planToUpdate.planId}' 계획의 상태를 '${nextStatusText}'(으)로 변경하시겠습니까?`)) {
            return;
        }

        try {
            // 1. 서버에 보낼 업데이트된 객체 생성
            const updatedPlan = { ...planToUpdate, status: nextStatus };

            // 2. 서버에 PUT 요청 전송 (API 서버를 통해 ERP로 전달)
            await axios.put(`${ProjectPlan_Proxy_API_URL}/${planToUpdate.planId}`, updatedPlan, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            // 3. 화면(state)에도 변경사항 즉시 반영
            setProjectPlans(currentPlans =>
                currentPlans.map(plan =>
                    plan.planId === planToUpdate.planId
                        ? { ...plan, status: nextStatus }
                        : plan
                )
            );
            alert("상태가 성공적으로 변경되었습니다.");

        } catch (err) {
            console.error("상태 업데이트 실패:", err);
            alert("상태 업데이트 중 오류가 발생했습니다.");
        }
    };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 상태값을 텍스트로 변환하는 함수 ---
  const getStatusText = (status) => {
    switch (status) {
      case 0: return '계획';
      case 1: return '진행';
      case 2: return '완료';
      default: return '알 수 없음';
    }
  };

  // --- 렌더링 ---
  if (loading) return <div className="p-8 text-center">프로젝트 계획 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">프로젝트 계획 조회</h1>
        <div>
          <button
            onClick={fetchData}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            새로고침
          </button>
          
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계획 ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">프로젝트 ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선박 ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계획 범위</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시작일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종료일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
           
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectPlans.length > 0 ? (
              projectPlans.map((plan) => (
                <tr key={plan.planId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.planId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.projectId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.vesselId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.planScope}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span
                        onClick={() => handleStatusUpdate(plan)}
                        className="font-semibold text-blue-600 cursor-pointer hover:underline"
                    >
                        {getStatusText(plan.status)}
                    </span>
                </td>
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-sm text-gray-500">
                  조회된 프로젝트 계획이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}