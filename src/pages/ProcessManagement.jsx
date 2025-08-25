import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/processes';

export default function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState({
    processId: '',
    processName: '',
    processInfo: '',
    processSequence: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setProcesses(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { processId, ...data } = formState;

    // processSequence를 숫자로 변환
    const payload = {
        ...data,
        processSequence: parseInt(data.processSequence, 10)
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${processId}`, payload);
      } else {
        await axios.post(API_URL, { ...formState, processSequence: parseInt(formState.processSequence, 10) });
      }
      resetForm();
      fetchProcesses();
    } catch (err) {
      alert(`오류: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (process) => {
    setIsEditing(true);
    setFormState({
      processId: process.processId,
      processName: process.processName,
      processInfo: process.processInfo,
      processSequence: process.processSequence,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm(`정말로 이 공정(ID: ${id})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProcesses();
      } catch (err) {
        alert(`삭제 중 오류: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormState({
      processId: '',
      processName: '',
      processInfo: '',
      processSequence: '',
    });
  };

  if (loading) return <div className="p-8 text-center">공정 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      {/* 입력/수정 폼 */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">{isEditing ? '공정 수정' : '새 공정 추가'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <input type="text" name="processId" value={formState.processId} onChange={handleFormChange} placeholder="공정 ID" className="p-2 border rounded" required disabled={isEditing} />
          <input type="text" name="processName" value={formState.processName} onChange={handleFormChange} placeholder="공정 이름" className="p-2 border rounded" required />
          <input type="text" name="processInfo" value={formState.processInfo} onChange={handleFormChange} placeholder="공정 정보" className="p-2 border rounded" />
          <input type="number" name="processSequence" value={formState.processSequence} onChange={handleFormChange} placeholder="공정 순서" className="p-2 border rounded" required />
          <div className="md:col-span-4 flex justify-end space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? '수정 완료' : '추가'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">취소</button>
          </div>
        </form>
      </div>

      {/* 데이터 테이블 */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">공정 정보 관리</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">이름</th>
              <th className="py-3 px-4">정보</th>
              <th className="py-3 px-4">순서</th>
              <th className="py-3 px-4">작업</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {processes.map((process) => (
              <tr key={process.processId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{process.processId}</td>
                <td className="py-3 px-4">{process.processName}</td>
                <td className="py-3 px-4">{process.processInfo}</td>
                <td className="py-3 px-4">{process.processSequence}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleEdit(process)} className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">수정</button>
                  <button onClick={() => handleDelete(process.processId)} className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}