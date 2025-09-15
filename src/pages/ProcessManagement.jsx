// src/pages/ProcessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import useKeyboard from "../hooks/useKeyboard";

const API_URL = "http://localhost:8082/api/processes";

const formatProcessSequence = (processId) => {
  const regex = /^PRC(\d+)(?:-([A-Z]))?$/;
  const match = processId.match(regex);

  if (!match) return processId;

  const mainNumber = parseInt(match[1], 10);
  const subLetter = match[2];

  if (subLetter) {
    const subNumber = subLetter.charCodeAt(0) - "A".charCodeAt(0) + 1;
    return `${mainNumber}-${subNumber}`;
  } else {
    return `${mainNumber}`;
  }
};

export default function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState({
    processId: "",
    processName: "",
    processInfo: "",
    processSequence: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempId, setTempId] = useState(null);

  // Context 훅으로 setIconHandlers 가져오기
  const { setIconHandlers } = useIconContext();

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    if (tempId) {
      const tempData = {
        processId: tempId,
        processName: "새로운 공정",
        processInfo: "정보를 입력하세요",
        processSequence: "",
      };
      setFormState(tempData);
      setIsEditing(false);
    }
  }, [tempId]);

  // Context에 아이콘 버튼 핸들러 등록 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    setIconHandlers({
      onNew: handleNew,
      onSearch: fetchProcesses,
      onSave: handleSubmit,
      onDelete: () => handleDelete(formState.processId),
    });

    // Cleanup: 컴포넌트 언마운트 시 핸들러 초기화 (옵션)
    return () =>
      setIconHandlers({
        onNew: null,
        onSearch: null,
        onSave: null,
        onDelete: null,
      });
    // formState.processId는 useEffect에 넣지 않는 이유: 무한루프 방지
  }, [formState.processId]); // formState.processId 변경 시 핸들러 최신화

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);

      console.log("Server response data:", response.data);

      setProcesses(response.data);
    } catch (e) {
      setError(e);
      console.error(
        "데이터 로드 실패:",
        e.response ? e.response.data : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // Layout의 저장 버튼 클릭 시 event 없이 호출되는 경우 대비
    if (e && e.preventDefault) e.preventDefault();

    const isNew = !processes.some((p) => p.processId === formState.processId);

    const payload = { ...formState };

    try {
      if (isNew) {
        await axios.post(API_URL, payload);
      } else {
        await axios.put(`${API_URL}/${formState.processId}`, payload);
      }

      setTempId(null);
      resetForm();
      fetchProcesses();
    } catch (err) {
      alert(`오류: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (process) => {

    if (formState.processId === process.processId) return; 

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
    if (!id) return;

    if (window.confirm(`정말로 이 공정(ID: ${id})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        resetForm();
        fetchProcesses();
      } catch (err) {
        alert(`삭제 중 오류: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormState({
      processId: "",
      processName: "",
      processInfo: "",
      processSequence: "",
    });
  };

  const handleNew = () => {
    // 실제로 새 ID 생성 로직 필요 시 수정 가능
    const newTempId = "PRC0";
    setTempId(newTempId);
  };

  // 화면에 보여줄 리스트 (신규 아이템이 있을 때 맨 앞에 추가)
  const renderProcesses = [...processes];
  if (tempId) {
    renderProcesses.unshift({
      processId: tempId,
      processName: "새로운 공정",
      processInfo: "정보를 입력하세요",
      processSequence: "",
    });
  }

  // 키보드 훅 사용
  useKeyboard(renderProcesses, (selectedProcess) => {
    handleEdit(selectedProcess);
  }, formState,'processId');


  if (loading)
    return <div className="p-8 text-center">공정 정보를 불러오는 중입니다...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        에러: {error.message}
      </div>
    );

  return (
    <>
      <div className="p-8 flex flex-1 space-x-6 h-full">
        {/* 왼쪽: 리스트 */}
        <div className="flex-1 flex flex-col bg-white shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-100 font-bold text-lg border-b border-gray-200">
            <h2>공정 리스트</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-xs">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">공정명</th>
                  <th className="px-4 py-2">순서</th>
                  {/* <th className="px-4 py-2">편집</th> */}
                </tr>
              </thead>
              <tbody>
                {renderProcesses.map((process) => (
                  <tr
                    key={process.processId}
                    className={`border-b cursor-pointer ${
                      formState.processId === process.processId
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleEdit(process)}
                  >
                    <td className="px-4 py-2">{process.processId}</td>
                    <td className="px-4 py-2">{process.processName}</td>
                    <td className="px-4 py-2">
                      {formatProcessSequence(process.processId)}
                    </td>
                    {/* <td className="px-4 py-2 text-center">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(process.processId);
                        }}
                      >
                        삭제
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

{/*======= 오른쪽: 폼 ==========================*/}
        <div className="flex-1 flex flex-col bg-white shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-100 font-bold text-lg border-b border-gray-200">
            <h2>공정 상세/속성 정보</h2>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4 w-2/3">
              <label className="block mb-1 font-semibold" htmlFor="processId">
                공정 ID
              </label>
              <input
                id="processId"
                name="processId"
                value={formState.processId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border"
                disabled={isEditing}
                required
              />
            </div>

            <div className="mb-4 w-2/3">
              <label className="block mb-1 font-semibold" htmlFor="processName">
                공정명
              </label>
              <input
                id="processName"
                name="processName"
                value={formState.processName}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border"
                required
              />
            </div>

            <div className="mb-4 w-full">
              <label className="block mb-1 font-semibold" htmlFor="processInfo">
                공정 정보
              </label>
              <textarea
                id="processInfo"
                name="processInfo"
                value={formState.processInfo}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border"
                rows={4}
              />
            </div>

            <div className="mb-4 w-2/3">
              <label className="block mb-1 font-semibold" htmlFor="processSequence">
                공정 순서
              </label>
              <input
                type="text"
                id="processSequence"
                name="processSequence"
                value={formState.processSequence}  // 직접 수정 가능
                onChange={handleFormChange}
                className="w-full px-3 py-2 border"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
