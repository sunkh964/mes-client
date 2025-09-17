import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8082/api/workers';

export default function WorkerManagement() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState({
    workerId: '',
    workerName: '',
    department: '',
    position: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // 데이터 불러오기 함수
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setWorkers(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchData();
  }, []);

  // 폼 입력 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // 폼 제출 핸들러 (생성 & 수정)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // 수정 API는 아직 백엔드에 없지만, 미리 만들어 둡니다.
        // await axios.put(`${API_URL}/${formState.workerId}`, formState);
        alert('수정 API는 아직 구현되지 않았습니다.');
      } else {
        await axios.post(API_URL, formState);
      }
      resetForm();
      fetchData(); // 데이터 목록 새로고침
    } catch (err) {
      alert(`오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = (worker) => {
    setIsEditing(true);
    setFormState({
      workerId: worker.workerId,
      workerName: worker.workerName,
      department: worker.department || '',
      position: worker.position || '',
    });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async (id) => {
    if (window.confirm(`정말로 이 작업자(ID: ${id})를 삭제하시겠습니까?`)) {
        // 삭제 API는 아직 백엔드에 없지만, 미리 만들어 둡니다.
        // await axios.delete(`${API_URL}/${id}`);
        alert('삭제 API는 아직 구현되지 않았습니다.');
        fetchData();
    }
  };

  // 폼 리셋 함수
  const resetForm = () => {
    setIsEditing(false);
    setFormState({
      workerId: '',
      workerName: '',
      department: '',
      position: '',
    });
  };

  if (loading) return <div className="p-8 text-center">작업자 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      {/* 입력/수정 폼 */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">{isEditing ? '작업자 수정' : '신규 작업자 등록'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="workerId" value={formState.workerId} onChange={handleFormChange} placeholder="사원 ID" className="p-2 border rounded" required disabled={isEditing} />
          <input type="text" name="workerName" value={formState.workerName} onChange={handleFormChange} placeholder="이름" className="p-2 border rounded" required />
          <input type="text" name="department" value={formState.department} onChange={handleFormChange} placeholder="부서" className="p-2 border rounded" />
          <input type="text" name="position" value={formState.position} onChange={handleFormChange} placeholder="직급" className="p-2 border rounded" />
          <div className="md:col-span-2 flex justify-end space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? '수정' : '추가'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">취소</button>
          </div>
        </form>
      </div>

      {/* 데이터 테이블 */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">작업자 목록</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase">
              <th className="py-3 px-4">사원 ID</th>
              <th className="py-3 px-4">이름</th>
              <th className="py-3 px-4">부서</th>
              <th className="py-3 px-4">직급</th>
              <th className="py-3 px-4">작업</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {workers.map((worker) => (
              <tr key={worker.workerId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{worker.workerId}</td>
                <td className="py-3 px-4">{worker.workerName}</td>
                <td className="py-3 px-4">{worker.department}</td>
                <td className="py-3 px-4">{worker.position}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleEdit(worker)} className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">수정</button>
                  <button onClick={() => handleDelete(worker.workerId)} className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}