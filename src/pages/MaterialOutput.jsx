import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/material-outputs';

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return dateTimeString.replace('T', ' ').substring(0, 16);
};

export default function MaterialOutput() {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    quantity: '',
    destination: '',
    workOrderId: '',
    warehouseName: '',
  });

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setOutputs(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.quantity || !formState.workOrderId) return alert('수량과 작업지시 ID를 모두 입력해주세요.');
    
    try {
      const payload = {
        ...formState,
        quantity: parseInt(formState.quantity, 10),
        workOrderId: parseInt(formState.workOrderId, 10),
      };
      await axios.post(API_URL, payload);
      alert('자재 출고가 성공적으로 등록되었습니다.');
      setFormState({ quantity: '', destination: '', workOrderId: '', warehouseName: '' });
      fetchOutputs(); // 등록 후 목록 새로고침
    } catch (err) {
      alert(`등록 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">자재 출고 관리</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 왼쪽: 출고 등록 폼 */}
        <div className="lg:w-1/3">
          <div className="p-6 border rounded-lg bg-white shadow-md h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-700">출고 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="number" name="workOrderId" value={formState.workOrderId} onChange={handleFormChange} placeholder="작업지시 ID" className="w-full p-2 border rounded" required />
              <input type="number" name="quantity" value={formState.quantity} onChange={handleFormChange} placeholder="출고 수량" className="w-full p-2 border rounded" required />
              <input type="text" name="destination" value={formState.destination} onChange={handleFormChange} placeholder="출고 목적지" className="w-full p-2 border rounded" />
              <input type="text" name="warehouseName" value={formState.warehouseName} onChange={handleFormChange} placeholder="창고명" className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                등록
              </button>
            </form>
          </div>
        </div>

        {/* 오른쪽: 출고 현황 테이블 */}
        <div className="flex-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-gray-700 p-6">출고 현황</h2>
            {loading ? <p className="p-6">로딩 중...</p> : error ? <p className="p-6 text-red-500">에러 발생</p> : (
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                    <th className="py-3 px-4">ID</th><th className="py-3 px-4">수량</th><th className="py-3 px-4">작업지시 ID</th><th className="py-3 px-4">창고</th><th className="py-3 px-4">출고일</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {outputs.map(item => (
                    <tr key={`out-${item.outputId}`} className="border-b"><td className="py-3 px-4">{item.outputId}</td><td className="py-3 px-4">{item.quantity}</td><td className="py-3 px-4">{item.workOrderId}</td><td className="py-3 px-4">{item.warehouseName}</td><td className="py-3 px-4">{formatDateTime(item.outputDate)}</td></tr>
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