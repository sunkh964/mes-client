import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setLoading(true);
        setError(null);
        // 백엔드 Controller에 설정된 /api/processes 경로로 데이터를 요청합니다.
        const response = await axios.get('http://localhost:8080/api/processes');
        setProcesses(response.data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  // 로딩 중일 때 표시될 화면
  if (loading) {
    return <div className="p-8 text-center">공정 정보를 불러오는 중입니다...</div>;
  }

  // 에러 발생 시 표시될 화면
  if (error) {
    return <div className="p-8 text-center text-red-500">에러가 발생했습니다: {error.message}</div>;
  }
  
  // 성공적으로 데이터를 불러왔을 때 표시될 화면
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">공정 정보 관리</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="py-3 px-4">공정 ID</th>
              <th className="py-3 px-4">공정명</th>
              <th className="py-3 px-4">공정 정보</th>
              <th className="py-3 px-4">공정 순서</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {processes.map((process) => (
              // Java DTO의 필드명(camelCase)과 정확히 일치시킵니다.
              <tr key={process.processId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{process.processId}</td>
                <td className="py-3 px-4">{process.processName}</td>
                <td className="py-3 px-4">{process.processInfo}</td>
                <td className="py-3 px-4">{process.processSequence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}