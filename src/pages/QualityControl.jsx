import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8082/api/quality-controls';

export default function QualityControl() {
  const [qcList, setQcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({ workOrderId: '', inspectorId: '', result: '합격', notes: '' });

  const fetchData = async () => {
    try { setLoading(true); await axios.get(API_URL).then(res => setQcList(res.data)); }
    catch (e) { setError(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { ...formState, workOrderId: parseInt(formState.workOrderId), inspectorId: parseInt(formState.inspectorId) });
      setFormState({ workOrderId: '', inspectorId: '', result: '합격', notes: '' });
      fetchData();
    } catch (err) { alert(`오류: ${err.response?.data?.message || err.message}`); }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">새 품질 검사 등록</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <input type="number" name="workOrderId" value={formState.workOrderId} onChange={handleFormChange} placeholder="작업지시 ID" className="p-2 border rounded" required />
          <input type="number" name="inspectorId" value={formState.inspectorId} onChange={handleFormChange} placeholder="검사자 ID" className="p-2 border rounded" required />
          <select name="result" value={formState.result} onChange={handleFormChange} className="p-2 border rounded">
            <option value="합격">합격</option><option value="불합격">불합격</option><option value="재작업">재작업</option>
          </select>
          <input type="text" name="notes" value={formState.notes} onChange={handleFormChange} placeholder="메모" className="p-2 border rounded md:col-span-3" />
          <div className="md:col-span-4 flex justify-end"><button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">등록</button></div>
        </form>
      </div>
      <h1 className="text-2xl font-bold mb-6">품질 검사 목록</h1>
      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead><tr className="bg-gray-100"><th className="py-3 px-4">검사ID</th><th className="py-3 px-4">작업지시ID</th><th className="py-3 px-4">검사자ID</th><th className="py-3 px-4">검사일</th><th className="py-3 px-4">결과</th><th className="py-3 px-4">메모</th></tr></thead>
          <tbody>
            {qcList.map((qc) => (
              <tr key={qc.qcId} className="border-b hover:bg-gray-50"><td className="py-3 px-4">{qc.qcId}</td><td className="py-3 px-4">{qc.workOrderId}</td><td className="py-3 px-4">{qc.inspectorId}</td><td className="py-3 px-4">{new Date(qc.inspectionDate).toLocaleString()}</td><td className="py-3 px-4">{qc.result}</td><td className="py-3 px-4">{qc.notes}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}