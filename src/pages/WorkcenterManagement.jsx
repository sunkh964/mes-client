import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function WorkcenterManagement() {
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true); // 데이터를 가져오는 중인지 여부
  const [error, setError] = useState(null);     // 오류 발생 여부

  // 컴포넌트가 처음 렌더링될 때 데이터를 불러옵니다.
  useEffect(() => {
    // 데이터를 가져오는 비동기 함수 정의
    const fetchWorkCenters = async () => {
      try {
        // API 요청 시작 전에 상태 초기화
        setLoading(true);
        setError(null);

        // 실제 백엔드 API 엔드포인트 호출
        const response = await axios.get('http://localhost:8080/api/work-centers');
        
        // 성공적으로 데이터를 받아오면 workCenters 상태 업데이트
        setWorkCenters(response.data);

      } catch (e) {
        // API 호출 중 에러 발생 시 error 상태 업데이트
        setError(e);
      } finally {
        // 성공하든 실패하든 로딩 상태 종료
        setLoading(false);
      }
    };

    fetchWorkCenters(); // 함수 호출
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행

  // 1. 로딩 중일 때 표시할 UI
  if (loading) {
    return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>;
  }

  // 2. 에러 발생 시 표시할 UI
  if (error) {
    return <div className="p-8 text-center text-red-500">에러가 발생했습니다: {error.message}</div>;
  }
  
  // 3. 데이터 로딩 성공 시 표시할 UI
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">작업장 관리</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="py-3 px-4">작업장 ID</th>
              <th className="py-3 px-4">작업장 이름</th>
              <th className="py-3 px-4">위치</th>
              <th className="py-3 px-4">활성화 상태</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {workCenters.map((center) => (
              <tr key={center.workCenterId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{center.workCenterId}</td>
                <td className="py-3 px-4">{center.workCenterName}</td>
                <td className="py-3 px-4">{center.location}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      center.active 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {center.active ? '활성' : '비활성'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}