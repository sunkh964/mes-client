import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8082/api/shipments';

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return dateTimeString.replace('T', ' ').substring(0, 16);
};

export default function ShipmentManagement() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState({
    blockId: '',
    destination: '',
    status: '준비중',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setShipments(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formState, blockId: parseInt(formState.blockId, 10) };
      await axios.post(API_URL, payload);
      alert('출하 정보가 등록되었습니다.');
      resetForm();
      fetchData();
    } catch (err) {
      alert(`등록 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    }
  };
  
  const resetForm = () => {
    setFormState({ blockId: '', destination: '', status: '준비중', notes: '' });
  };

  if (loading) return <div className="p-8 text-center">출하 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      {/* 등록 폼 */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">신규 출하 등록</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <input type="number" name="blockId" value={formState.blockId} onChange={handleFormChange} placeholder="블록 ID" className="p-2 border rounded" required />
          <input type="text" name="destination" value={formState.destination} onChange={handleFormChange} placeholder="목적지" className="p-2 border rounded" />
          <select name="status" value={formState.status} onChange={handleFormChange} className="p-2 border rounded">
            <option value="준비중">준비중</option>
            <option value="완료">완료</option>
          </select>
          <input type="text" name="notes" value={formState.notes} onChange={handleFormChange} placeholder="메모" className="p-2 border rounded" />
          <div className="md:col-span-4 flex justify-end">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">등록</button>
          </div>
        </form>
      </div>

      {/* 데이터 테이블 */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">출하 목록</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase">
              <th className="py-3 px-4">출하 ID</th>
              <th className="py-3 px-4">블록 이름</th>
              <th className="py-3 px-4">목적지</th>
              <th className="py-3 px-4">상태</th>
              <th className="py-3 px-4">출하일</th>
              <th className="py-3 px-4">메모</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {shipments.map((shipment) => (
              <tr key={shipment.shipmentId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{shipment.shipmentId}</td>
                <td className="py-3 px-4">{shipment.blockName} (ID: {shipment.blockId})</td>
                <td className="py-3 px-4">{shipment.destination}</td>
                <td className="py-3 px-4">{shipment.status}</td>
                <td className="py-3 px-4">{formatDateTime(shipment.shipmentDate)}</td>
                <td className="py-3 px-4">{shipment.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}