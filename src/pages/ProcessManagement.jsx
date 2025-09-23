// src/pages/ProcessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/processes";

export default function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null); // 수정 중인 행 ID

  // 검색 조건
  const [searchParams, setSearchParams] = useState({
    processId: "",
    processNm: "",
    isActive: null,
  });

  const { setIconHandlers } = useIconContext();

  // ================= 데이터 조회 =================
  const fetchProcesses = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([key, value]) => {
          if (key === "isActive") return value !== null;
          return value !== "";
        })
      ).toString();

      const response = await axios.get(
        `${API_URL}${queryParams ? `?${queryParams}` : ""}`
      );
      setProcesses(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  // ================= 신규 행 추가 =================
  const handleAddRow = () => {
    if (processes.some((p) => p._isNew)) return; // 이미 신규행 있으면 추가 안함
    const newRow = {
      processId: "PROC",
      processNm: "",
      processInfo: "",
      processSequence: null,
      standardTime: null,
      isActive: true,
      remark: "",
      _isNew: true,
    };
    setProcesses((prev) => [...prev, newRow]); // 맨 아래에 추가
    setSelectedRow(newRow);
  };

  // ================= 저장 =================
  const handleSave = async () => {
    const newRow = processes.find((p) => p._isNew);

    try {
      if (newRow) {
        // 신규 저장 (POST)
        if (!newRow.processId || !newRow.processNm) {
          alert("공정 ID와 공정명은 필수입니다.");
          return;
        }
        await axios.post(API_URL, {
          processId: newRow.processId,
          processNm: newRow.processNm,
          processInfo: newRow.processInfo,
          processSequence:
            newRow.processSequence === "" ? null : Number(newRow.processSequence),
          standardTime:
            newRow.standardTime === "" ? null : Number(newRow.standardTime),
          isActive: newRow.isActive,
          remark: newRow.remark,
        });
      } else if (editingRowId) {
        // 기존 수정 (PUT)
        const updatedRow = processes.find((p) => p.processId === editingRowId);
        await axios.put(`${API_URL}/${editingRowId}`, updatedRow);
        setEditingRowId(null); // 수정모드 해제
      }

      await fetchProcesses(searchParams);
      alert("저장 완료!");
    } catch (e) {
      alert(`저장 실패: ${e?.response?.data?.message || e.message}`);
    }
  };

  // ================= 삭제 =================
  const handleDelete = async () => {
    if (!selectedRow) {
      alert("삭제할 행을 선택하세요.");
      return;
    }
    if (!window.confirm(`정말 삭제하시겠습니까? (${selectedRow.processId})`))
      return;

    try {
      await axios.delete(`${API_URL}/${selectedRow.processId}`);
      await fetchProcesses(searchParams);
      alert("삭제 완료!");
    } catch (e) {
      alert(`삭제 실패: ${e?.response?.data?.message || e.message}`);
    }
  };

  // --- 3. 이벤트 핸들러 ---
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchProcesses(searchParams);
  };

  // --- 사이드 이펙트 ---
  useEffect(() => {
    setIconHandlers({
      onSearch: () => fetchProcesses(searchParams),
      onNew: handleAddRow,
      onSave: handleSave,
      onDelete: handleDelete,
    });
    return () => {
      setIconHandlers({
        onSearch: null,
        onNew: null,
        onSave: null,
        onDelete: null,
      });
    };
  }, [searchParams, processes, selectedRow, editingRowId]);

  // 컬럼 정의
  const columns = [
    { header: "공정 ID", accessor: "processId", editable: (row) => row._isNew }, // 신규만 편집
    { header: "공정명", accessor: "processNm", editable: true },
    { header: "공정 설명", accessor: "processInfo", editable: true },
    { header: "공정 순서", accessor: "processSequence", editable: true },
    { header: "표준 작업시간", accessor: "standardTime", editable: true },
    { header: "활성 여부", accessor: "isActive", editable: true },
    { header: "비고", accessor: "remark", editable: true },
  ];

  // --- 행 더블클릭: 수정모드 진입 ---
  const handleRowDoubleClick = (process) => {
    if (!process._isNew) {
      setEditingRowId(process.processId);
      setSelectedRow(process);
    }
  };

  return (
    <div className="p-5 flex flex-col h-[90vh]">
      {/* 검색영역 */}
      <div className="border border-gray-300 p-3 mb-5">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input
              type="text"
              id="processId"
              name="processId"
              value={searchParams.processId}
              onChange={handleSearchChange}
              className="border border-black px-1"
            />
          </div>
          <div>
            <label htmlFor="processNm">공정명: </label>
            <input
              type="text"
              id="processNm"
              name="processNm"
              value={searchParams.processNm}
              onChange={handleSearchChange}
              className="border border-black px-1"
            />
          </div>
          <div>
            <label htmlFor="isActive">활성 여부: </label>
            <select
              id="isActive"
              name="isActive"
              value={searchParams.isActive === null ? "" : searchParams.isActive}
              onChange={handleSearchChange}
              className="border border-black ml-2"
            >
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 결과 테이블 */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div>데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div>에러가 발생했습니다: {error.message}</div>
        ) : (
          <TableGrid
            columns={columns}
            data={processes}
            rowKey="processId"
            selectedRow={selectedRow}
            onRowSelect={setSelectedRow}
            onCellUpdate={(rowIndex, field, value) => {
              setProcesses((prev) =>
                prev.map((p, i) =>
                  i === rowIndex ? { ...p, [field]: value } : p
                )
              );
            }}
            editingRowId={editingRowId}
            onRowDoubleClick={handleRowDoubleClick} 
            readOnly={false}
          />
        )}
      </div>
    </div>
  );
}