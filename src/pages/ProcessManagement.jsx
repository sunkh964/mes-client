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
  const handleNew = () => {
    if (processes.some((p) => p._isNew)) return; // 이미 신규행 있으면 추가 안함
    const newRow = {
      processId: "",
      processNm: "",
      processInfo: "",
      processSequence: null,
      standardTime: null,
      isActive: true,
      remark: "",
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
              [field]:
                field === "isActive"
                  ? value === "true"
                  : value === ""
                  ? null
                  : value,
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
        processSequence:
          newRow.processSequence === "" ? null : Number(newRow.processSequence),
        standardTime:
          newRow.standardTime === "" ? null : Number(newRow.standardTime),
        isActive: newRow.isActive,
        remark: newRow.remark,
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

  // --- 3. 이벤트 핸들러 ---
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchProcesses(searchParams);
  };

  // --- 4. 사이드 이펙트 ---
  useEffect(() => {
    setIconHandlers({
      onSearch: () => fetchProcesses(searchParams),
      onNew: handleNew,
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
  }, [searchParams, processes, selectedRow]);

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "90vh",
      }}
    >
      {/* 검색영역 */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
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
                <th style={{ padding: "8px" }}>공정 설명</th>
                <th style={{ padding: "8px" }}>공정 순서</th>
                <th style={{ padding: "8px" }}>표준 작업시간</th>
                <th style={{ padding: "8px" }}>활성 여부</th>
                <th style={{ padding: "8px" }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, idx) =>
                process._isNew ? (
                  <tr key={`new-${idx}`} style={{ backgroundColor: "#fffbe6" }}>
                    {/* 공정 ID */}
                    <td style={{ padding: "8px" }}>
                      <input
                        style={{width: "100%",border: "1px solid #ccc",padding: "4px"}}
                        placeholder="공정 ID"
                        value={process.processId}
                        onChange={(e) => handleNewRowChange("processId", e.target.value) }
                      />
                    </td>
                    {/* 공정명 */}
                    <td style={{ padding: "8px" }}>
                      <input
                        style={{width: "100%",border: "1px solid #ccc",padding: "4px"}}
                        placeholder="공정명"
                        value={process.processNm}
                        onChange={(e) => handleNewRowChange("processNm", e.target.value)
                        }
                      />
                    </td>
                    {/* 공정 설명 */}
                    <td style={{ padding: "8px" }}>
                      <input
                        style={{width: "100%",border: "1px solid #ccc",padding: "4px",}}
                        placeholder="공정 설명"
                        value={process.processInfo}
                        onChange={(e) => handleNewRowChange("processInfo", e.target.value)
                        }
                      />
                    </td>
                    {/* 공정 순서 */}
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        style={{width: "100%",
                          border: "1px solid #ccc",
                          padding: "4px",
                        }}
                        placeholder="공정 순서"
                        value={process.processSequence ?? ""}
                        onChange={(e) => handleNewRowChange(
                            "processSequence",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    {/* 표준 작업시간 */}
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          padding: "4px",
                        }}
                        placeholder="표준 작업시간"
                        value={process.standardTime ?? ""}
                        onChange={(e) =>
                          handleNewRowChange(
                            "standardTime",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    {/* 활성 여부 */}
                    <td style={{ padding: "8px" }}>
                      <select
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          padding: "4px",
                        }}
                        value={process.isActive ? "true" : "false"}
                        onChange={(e) =>
                          handleNewRowChange("isActive", e.target.value)
                        }
                      >
                        <option value="true">활성</option>
                        <option value="false">비활성</option>
                      </select>
                    </td>
                    {/* 비고 */}
                    <td style={{ padding: "8px" }}>
                      <input
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          padding: "4px",
                        }}
                        placeholder="비고"
                        value={process.remark ?? ""}
                        onChange={(e) =>
                          handleNewRowChange("remark", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={process.processId}
                    style={{
                      backgroundColor:
                        selectedRow?.processId === process.processId
                          ? "#e6f7ff"
                          : "white",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedRow(process)}
                  >
                    <td style={{ padding: "8px" }}>{process.processId}</td>
                    <td style={{ padding: "8px" }}>{process.processNm}</td>
                    <td style={{ padding: "8px" }}>{process.processInfo}</td>
                    <td style={{ padding: "8px" }}>{process.processSequence}</td>
                    <td style={{ padding: "8px" }}>{process.standardTime}</td>
                    <td style={{ padding: "8px" }}>
                      {process.isActive ? "활성" : "비활성"}
                    </td>
                    <td style={{ padding: "8px" }}>{process.remark}</td>
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