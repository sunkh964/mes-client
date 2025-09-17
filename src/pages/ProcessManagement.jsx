// src/pages/ProcessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/processes";

export default function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

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
  const handleNew = () => {
    if (processes.some((p) => p._isNew)) return; // 이미 신규행 있으면 추가 안함
    const newRow = {
      processId: "",
      processNm: "",
      processInfo: "",
      isActive: true,
      _isNew: true,
    };
    setProcesses((prev) => [newRow, ...prev]);
    setSelectedRow(newRow);
  };

  // ================= 신규 행 입력값 변경 =================
  const handleNewRowChange = (field, value) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p._isNew
          ? {
              ...p,
              [field]: field === "isActive" ? value === "true" : value,
            }
          : p
      )
    );
  };

  // ================= 저장 =================
  const handleSave = async () => {
    const newRow = processes.find((p) => p._isNew);
    if (!newRow) return;

    if (!newRow.processId || !newRow.processNm) {
      alert("공정 ID와 공정명은 필수입니다.");
      return;
    }

    try {
      await axios.post(API_URL, {
        processId: newRow.processId,
        processNm: newRow.processNm,
        processInfo: newRow.processInfo,
        isActive: newRow.isActive,
      });
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

  // ================= 아이콘 컨텍스트 연결 =================
  useEffect(() => {
    setIconHandlers({
      onSearch: () => fetchProcesses(searchParams),
      onNew: handleNew,
      onSave: handleSave,
      onDelete: handleDelete,
    });
    return () => {
      setIconHandlers({ onSearch: null, onNew: null, onSave: null, onDelete: null });
    };
  }, [searchParams, processes, selectedRow]);

  // ================= 검색창 입력 =================
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // ================= 화면 렌더링 =================
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", height: "90vh" }}>
      {/* 검색영역 */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input
              type="text"
              id="processId"
              name="processId"
              value={searchParams.processId}
              onChange={handleSearchChange}
              style={{ border: "1px solid black" }}
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
              style={{ border: "1px solid black" }}
            />
          </div>
          <div>
            <label htmlFor="isActive">활성 여부: </label>
            <select
              id="isActive"
              name="isActive"
              value={searchParams.isActive === null ? "" : searchParams.isActive}
              onChange={handleSearchChange}
              style={{ border: "1px solid black", marginLeft: "5px" }}
            >
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 결과 테이블 */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <div>데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div>에러가 발생했습니다: {error.message}</div>
        ) : (
          <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ padding: "8px" }}>공정 ID</th>
                <th style={{ padding: "8px" }}>공정명</th>
                <th style={{ padding: "8px" }}>공정 정보</th>
                <th style={{ padding: "8px" }}>활성 여부</th>
              </tr>
            </thead>
            <tbody>
            {processes.map((process, idx) =>
              process._isNew ? (
                <tr key={`new-${idx}`} style={{ backgroundColor: "#fffbe6" }}>
                  <td style={{ padding: "8px" }}>
                    <input
                      style={{ width: "100%", border: "1px solid #ccc", padding: "4px" }}
                      placeholder="공정 ID"
                      value={process.processId}
                      onChange={(e) => handleNewRowChange("processId", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <input
                      style={{ width: "100%", border: "1px solid #ccc", padding: "4px" }}
                      placeholder="공정명"
                      value={process.processNm}
                      onChange={(e) => handleNewRowChange("processNm", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <input
                      style={{ width: "100%", border: "1px solid #ccc", padding: "4px" }}
                      placeholder="공정 정보"
                      value={process.processInfo}
                      onChange={(e) => handleNewRowChange("processInfo", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <select
                      style={{ width: "100%", border: "1px solid #ccc", padding: "4px" }}
                      value={process.isActive ? "true" : "false"}
                      onChange={(e) => handleNewRowChange("isActive", e.target.value)}
                    >
                      <option value="true">활성</option>
                      <option value="false">비활성</option>
                    </select>
                  </td>
                </tr>
              ) : (
                <tr
                  key={process.processId}
                  style={{
                    backgroundColor:
                      selectedRow?.processId === process.processId ? "#e6f7ff" : "white",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedRow(process)}
                >
                  <td style={{ padding: "8px" }}>{process.processId}</td>
                  <td style={{ padding: "8px" }}>{process.processNm}</td>
                  <td style={{ padding: "8px" }}>{process.processInfo}</td>
                  <td style={{ padding: "8px" }}>
                    {process.isActive ? "활성" : "비활성"}
                  </td>
                </tr>
              )
            )}
          </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
