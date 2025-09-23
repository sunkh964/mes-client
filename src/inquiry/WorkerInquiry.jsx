import React, { useState, useEffect, useCallback } from 'react';
import { getToken } from '../utils/api';
import axios from 'axios';
import TableGrid from '../layouts/TableGrid';

// 요청 API 주소
const Worker_Proxy_API_URL = 'http://localhost:8083/api/proxy/employees';

export default function WorkInquiry() {
  // --- 상태 관리 ---
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TableGrid 컬럼 정의
  const columns = [
    { header: "사원 ID", accessor: "employeeId" },
    { header: "이름", accessor: "employeeNm" },
    { header: "부서", accessor: "department.departmentNm" }, // 중첩 데이터
    { header: "직위", accessor: "position.positionNm" },
    { header: "연락처", accessor: "phone" },
  ];

  // 중첩 데이터 안전하게 접근 (department?.departmentNm)
  const processedData = workers.map(w => ({
    ...w,
    "department.departmentNm": w.department?.departmentNm || "N/A",
    "position.positionNm": w.position?.positionNm || "N/A",
  }));

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

      {/* TableGrid */}
      <TableGrid 
        columns={columns} 
        data={processedData} 
        rowKey="employeeId"
        readOnly={true} 
      />
    </div>
  );
}