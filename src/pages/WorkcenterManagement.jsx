import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API 기본 URL 설정
const API_URL = 'http://localhost:8080/api/work-centers';

export default function WorkcenterManagement() {
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 입력 폼을 위한 state
  const [formState, setFormState] = useState({
    workCenterId: '',
    workCenterName: '',
    location: '',
    isActive: true,
  });
  // 수정 모드인지 확인하기 위한 state
  const [isEditing, setIsEditing] = useState(false);

  // 데이터 불러오기
  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setWorkCenters(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // 폼 입력 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 폼 제출 핸들러 (생성 & 수정)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { workCenterId, ...data } = formState;

    try {
      if (isEditing) {
        // 수정 모드
        await axios.put(`${API_URL}/${workCenterId}`, data);
      } else {
        // 생성 모드
        await axios.post(API_URL, formState);
      }
      resetForm();
      fetchWorkCenters(); // 데이터 다시 불러오기
    } catch (err) {
      alert(`오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = (center) => {
    setIsEditing(true);
    setFormState({
      workCenterId: center.workCenterId,
      workCenterName: center.workCenterName,
      location: center.location,
      isActive: center.active, // DTO 필드명 'active'에 맞춤
    });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async (id) => {
    if (window.confirm(`정말로 이 작업장(ID: ${id})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchWorkCenters(); // 데이터 다시 불러오기
      } catch (err) {
        alert(`삭제 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // 폼 리셋 함수
  const resetForm = () => {
    setIsEditing(false);
    setFormState({
      workCenterId: '',
      workCenterName: '',
      location: '',
      isActive: true,
    });
  };

  if (loading) return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      {/* 입력/수정 폼 */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">{isEditing ? '작업장 수정' : '새 작업장 추가'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <input type="text" name="workCenterId" value={formState.workCenterId} onChange={handleFormChange} placeholder="작업장 ID" className="p-2 border rounded" required disabled={isEditing} />
          <input type="text" name="workCenterName" value={formState.workCenterName} onChange={handleFormChange} placeholder="작업장 이름" className="p-2 border rounded" required />
          <input type="text" name="location" value={formState.location} onChange={handleFormChange} placeholder="위치" className="p-2 border rounded" />
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={formState.isActive} onChange={handleFormChange} className="mr-2 h-4 w-4" />
            <label>활성화</label>
          </div>
          <div className="md:col-span-4 flex justify-end space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? '수정 완료' : '추가'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">취소</button>
          </div>
        </form>
      </div>

      {/* 데이터 테이블 */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">작업장 관리</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">이름</th>
              <th className="py-3 px-4">위치</th>
              <th className="py-3 px-4">상태</th>
              <th className="py-3 px-4">작업</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {workCenters.map((center) => (
              <tr key={center.workCenterId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{center.workCenterId}</td>
                <td className="py-3 px-4">{center.workCenterName}</td>
                <td className="py-3 px-4">{center.location}</td>
                <td className="py-3 px-4">
                  <span className={center.active ? 'text-green-600' : 'text-red-600'}>
                    {center.active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => handleEdit(center)} className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">수정</button>
                  <button onClick={() => handleDelete(center.workCenterId)} className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}