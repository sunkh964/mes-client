import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/processes';

//  공정 ID에서 순서 추출 ======================================== //
const formatProcessSequence = (processId) => {
  // 'PRC'로 시작하고, 숫자(1개 이상)가 오고, 선택적으로 '-문자'가 오는 패턴을 찾음
  const regex = /^PRC(\d+)(?:-([A-Z]))?$/;
  const match = processId.match(regex);

  if (!match) {
    // 패턴과 일치하지 않으면 원본 processId를 반환
    return processId;
  }

  const mainNumber = parseInt(match[1], 10);
  const subLetter = match[2];

  if (subLetter) {
    // 'PRC01-A'와 같은 형식일 경우 '1-1'로 변환
    const subNumber = subLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    return `${mainNumber}-${subNumber}`;
  } else {
    // 'PRC01'와 같은 형식일 경우 '1'로 변환
    return `${mainNumber}`;
  }
};


export default function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 신규 할 때, 임시 공간?
  const [tempId, setTempId] = useState(null);

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

  // tempId가 변경될 때 폼 상태를 자동으로 업데이트하는 useEffect
  useEffect(() => {
    if (tempId) {
      setFormState({
        processId: tempId,
        processName: '새로운 공정',
        processInfo: '정보를 입력하세요',
        processSequence: ''
      });
      setIsEditing(false);
    }
  }, [tempId]);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(API_URL);
      setProcesses(response.data);
    } catch (e) {
      setError(e);
      console.error("데이터 로드 실패:", e.response ? e.response.data : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  // 신규 ID를 체크하여 신규/수정 구분
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { processId, ...data } = formState;

    const isNew = !processes.some(p => p.processId === formState.processId);

    const payload = {
      ...formState,
    };

    try {
      if (isNew) {
      // 신규 항목은 processId를 서버로 보내지 않음
        const { processId, ...newPayload } = payload;
        await axios.post(API_URL, newPayload);
      } else {
        // 기존 항목은 processId를 포함하여 PUT 요청
        await axios.put(`${API_URL}/${formState.processId}`, payload);
      }
      resetForm();
      fetchProcesses();
    } catch (err) {
      alert(`오류: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (process) => {
    setTempId(null);

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

  // 신규 기능 ========================================
  const handleNew = () => {
    const newTempId = 'PRC' + '0';
    setTempId(newTempId);
  };

  // 렌더링을 위한 데이터 준비
  const renderProcesses = [...processes];
  if (tempId) {
      renderProcesses.unshift({ 
          processId: tempId, 
          processName: '새로운 공정', 
          processInfo: '정보를 입력하세요', 
          processSequence: '' 
      });
  }


  if (loading) return <div className="p-8 text-center">공정 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8 flex flex-1 space-x-6 h-full">

      {/* 왼쪽 패널: 공정 리스트 */}
      <div className="flex-1 flex flex-col bg-white shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-100 font-bold text-lg border-b border-gray-200">
          <h2>공정 리스트</h2>
          {/* 추가 -> 신규 버튼 */}
          <div className="flex space-x-2 text-sm font-semibold">
            <button
              onClick={handleNew}
              className="bg-blue-500 text-white px-3 py-1 hover:bg-blue-600"
            >
              신규
            </button>
            <button
              onClick={fetchProcesses}
              className="bg-green-500 text-white px-3 py-1 hover:bg-green-600"
            >
              조회
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm border-b">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">이름</th>
                <th className="py-3 px-4">공정 순서</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {renderProcesses.map((process) => (
                <tr 
                  key={process.processId} 
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEdit(process)}
                >
                  <td className="py-3 px-4">{process.processId}</td>
                  <td className="py-3 px-4">{process.processName}</td>
                  <td className="py-3 px-4">{formatProcessSequence(process.processId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 오른쪽 패널: 공정 상세/속성 정보 */}
      <div className="w-1/3 flex flex-col bg-white shadow-md">
        <div className="flex justify-between items-center p-4 bg-gray-100 font-bold text-lg border-b border-gray-200">
          <h2>공정 상세/속성 정보</h2>
          <div className="flex space-x-2 text-sm font-semibold">
            {/* 저장 버튼 추가 */}
            <button
              type="submit"
              form="process-form"
              className="bg-blue-500 text-white px-3 py-1 hover:bg-blue-600"
            >
              {isEditing ? '수정' : '저장'}
            </button>
                <button
                type="button"
                onClick={() => handleDelete(formState.processId)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                삭제
              </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* form에 id 추가 */}
          <form id="process-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">공정 ID</label>
              <input
                type="text"
                name="processId"
                value={formState.processId}
                onChange={handleFormChange}
                placeholder="공정 ID"
                className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">공정명</label>
              <input
                type="text"
                name="processName"
                value={formState.processName}
                onChange={handleFormChange}
                placeholder="공정 이름"
                className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">공정 정보</label>
              <input
                type="text"
                name="processInfo"
                value={formState.processInfo}
                onChange={handleFormChange}
                placeholder="공정 정보"
                className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">공정 순서</label>
              <input
                type="text"
                name="processSequence"
                value={formatProcessSequence(formState.processId)}
                onChange={handleFormChange}
                placeholder="공정 순서"
                className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}