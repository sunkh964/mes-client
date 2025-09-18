import React, { useState, useEffect, useCallback } from 'react';
import { getToken } from '../utils/api';
import axios from 'axios';

// 요청 API 주소
const Worker_Proxy_API_URL = 'http://localhost:8083/api/proxy/employees';

export default function WorkInquiry() {
  // --- 상태 관리 ---
  const [workers, setWorkers] = useState([]);
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
      
      const response = await axios.get(Worker_Proxy_API_URL,{
        headers: {
            'Authorization': `Bearer ${token}`
        }
        }
      );
      setWorkers(response.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  },[]);

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 렌더링 ---
  if (loading) return <div className="p-8 text-center">작업자 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">작업자 정보 조회</h1>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사원 ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직위</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.length > 0 ? (
              workers.map((worker) => (
                <tr key={worker.employeeId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{worker.employeeNm}</td>
                  {/* API 응답에 부서/직위 객체가 포함되어 있다고 가정합니다. 실제 데이터 구조에 맞게 수정 필요 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{worker.department?.departmentNm || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{worker.position?.positionNm || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{worker.phone || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                  등록된 작업자 정보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}