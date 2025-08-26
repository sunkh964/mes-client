import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/work-results';

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return dateTimeString.replace('T', ' ').substring(0, 16);
};

export default function WorkResultLogging() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    workOrderId: '',
    completedQuantity: '',
    defectiveQuantity: '0',
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      // 최신 등록 순으로 보여주기 위해 데이터를 역순으로 정렬
      setResults(response.data.sort((a, b) => b.resultId - a.resultId));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.workOrderId || !formState.completedQuantity) {
        return alert('작업지시 ID와 완료 수량을 입력해주세요.');
    }
    
    try {
      const payload = {
        workOrderId: parseInt(formState.workOrderId, 10),
        completedQuantity: parseInt(formState.completedQuantity, 10),
        defectiveQuantity: parseInt(formState.defectiveQuantity, 10),
      };
      await axios.post(API_URL, payload);
      alert('생산 실적이 성공적으로 등록되었습니다.');
      setFormState({ workOrderId: '', completedQuantity: '', defectiveQuantity: '0' });
      fetchResults(); // 등록 후 목록 새로고침
    } catch (err) {
      alert(`등록 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">생산 실적 등록</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 왼쪽: 실적 등록 폼 */}
        <div className="lg:w-1/3">
          <div className="p-6 border rounded-lg bg-white shadow-md h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-700">실적 입력</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="number" name="workOrderId" value={formState.workOrderId} onChange={handleFormChange} placeholder="작업지시 ID" className="w-full p-2 border rounded" required />
              <input type="number" name="completedQuantity" value={formState.completedQuantity} onChange={handleFormChange} placeholder="완료 수량" className="w-full p-2 border rounded" required />
              <input type="number" name="defectiveQuantity" value={formState.defectiveQuantity} onChange={handleFormChange} placeholder="불량 수량" className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                실적 등록
              </button>
            </form>
          </div>
        </div>

        {/* 오른쪽: 실적 현황 테이블 */}
        <div className="flex-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-gray-700 p-6">최근 실적 현황</h2>
            {loading ? <p className="p-6">로딩 중...</p> : error ? <p className="p-6 text-red-500">에러 발생</p> : (
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                    <th className="py-3 px-4">ID</th><th className="py-3 px-4">작업지시 ID</th><th className="py-3 px-4">완료 수량</th><th className="py-3 px-4">불량 수량</th><th className="py-3 px-4">등록 시간</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {results.map(item => (
                    <tr key={item.resultId} className="border-b"><td className="py-3 px-4">{item.resultId}</td><td className="py-3 px-4">{item.workOrderId}</td><td className="py-3 px-4">{item.completedQuantity}</td><td className="py-3 px-4">{item.defectiveQuantity}</td><td className="py-3 px-4">{formatDateTime(item.inputTime)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}