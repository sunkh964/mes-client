import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/equipment';

export default function EquipmentManagement() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    equipmentId: '', equipmentName: '', modelName: '', status: 'idle',
    lastInspectionDate: '', workCenterId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try { setLoading(true); await axios.get(API_URL).then(res => setEquipmentList(res.data)); }
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
      if (isEditing) {
        await axios.put(`${API_URL}/${formState.equipmentId}`, formState);
      } else {
        await axios.post(API_URL, formState);
      }
      resetForm();
      fetchData();
    } catch (err) { alert(`오류: ${err.response?.data?.message || err.message}`); }
  };

  const handleEdit = (equipment) => {
    setIsEditing(true);
    setFormState({
      equipmentId: equipment.equipmentId,
      equipmentName: equipment.equipmentName,
      modelName: equipment.modelName || '',
      status: equipment.status,
      lastInspectionDate: equipment.lastInspectionDate || '',
      workCenterId: equipment.workCenterId
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm(`정말로 이 설비(ID: ${id})를 삭제하시겠습니까?`)) {
      try { await axios.delete(`${API_URL}/${id}`); fetchData(); }
      catch (err) { alert(`삭제 중 오류: ${err.response?.data?.message || err.message}`); }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormState({ equipmentId: '', equipmentName: '', modelName: '', status: 'idle', lastInspectionDate: '', workCenterId: '' });
  };

  if (loading) return <div className="p-8">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">{isEditing ? '설비 수정' : '새 설비 추가'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="equipmentId" value={formState.equipmentId} onChange={handleFormChange} placeholder="설비 ID" className="p-2 border rounded" required disabled={isEditing} />
          <input type="text" name="equipmentName" value={formState.equipmentName} onChange={handleFormChange} placeholder="설비 이름" className="p-2 border rounded" required />
          <input type="text" name="modelName" value={formState.modelName} onChange={handleFormChange} placeholder="모델명" className="p-2 border rounded" />
          <select name="status" value={formState.status} onChange={handleFormChange} className="p-2 border rounded">
            <option value="idle">유휴</option><option value="running">가동</option><option value="maintenance">보수</option>
          </select>
          <input type="date" name="lastInspectionDate" value={formState.lastInspectionDate} onChange={handleFormChange} className="p-2 border rounded" />
          <input type="text" name="workCenterId" value={formState.workCenterId} onChange={handleFormChange} placeholder="작업장 ID" className="p-2 border rounded" required />
          <div className="md:col-span-3 flex justify-end space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{isEditing ? '수정' : '추가'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">취소</button>
          </div>
        </form>
      </div>
      <h1 className="text-2xl font-bold mb-6">설비 목록</h1>
      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead><tr className="bg-gray-100"><th className="py-3 px-4">ID</th><th className="py-3 px-4">이름</th><th className="py-3 px-4">모델명</th><th className="py-3 px-4">상태</th><th className="py-3 px-4">최근 점검일</th><th className="py-3 px-4">작업장</th><th className="py-3 px-4">작업</th></tr></thead>
          <tbody>
            {equipmentList.map((eq) => (
              <tr key={eq.equipmentId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{eq.equipmentId}</td><td className="py-3 px-4">{eq.equipmentName}</td><td className="py-3 px-4">{eq.modelName}</td><td className="py-3 px-4">{eq.status}</td>
                <td className="py-3 px-4">{eq.lastInspectionDate}</td><td className="py-3 px-4">{eq.workCenterId}</td>
                <td className="py-3 px-4"><button onClick={() => handleEdit(eq)} className="mr-2 text-sm bg-yellow-500 text-white px-2 py-1 rounded">수정</button><button onClick={() => handleDelete(eq.equipmentId)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}