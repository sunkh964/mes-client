import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import EquipmentManagement from "./EquipmentManagement";

const WORK_CENTER_API_URL = "http://localhost:8082/api/work-centers";

export default function WorkCenterManagement() {
  const [workCenters, setWorkCenters] = useState([]);
  const [selectedWorkCenterId, setSelectedWorkCenterId] = useState(null);
  const [searchParams, setSearchParams] = useState({
    workCenterId: "",
    workCenterNm: "",
    isActive: null,
    processId: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { setIconHandlers } = useIconContext();

  // 데이터 조회
  const fetchWorkCenters = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== "" && value !== null)
      ).toString();
      const fullUrl = `${WORK_CENTER_API_URL}${queryParams ? `?${queryParams}` : ""}`;
      const response = await axios.get(fullUrl);
      setWorkCenters(response.data);
      if (response.data.length > 0) {
        setSelectedWorkCenterId(response.data[0].workCenterId);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkCenters();
  }, [fetchWorkCenters]);

  // 검색 조건 변경
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkCenterSelect = (id) => {
    setSelectedWorkCenterId((prevId) => (prevId === id ? null : id));
  };

  const handleSearch = useCallback(() => {
    setSelectedWorkCenterId(null);
    fetchWorkCenters(searchParams);
  }, [searchParams, fetchWorkCenters]);

  // 신규 행 추가
  const handleNew = () => {
    if (workCenters.some((wc) => wc._isNew)) return;
    const newRow = {
      workCenterId: "",
      workCenterNm: "",
      processId: "",
      isActive: true,
      remark: "",
      _isNew: true,
    };
    setWorkCenters((prev) => [newRow, ...prev]);
    setSelectedWorkCenterId(newRow.workCenterId);
  };

  // 신규 행 값 변경
  const handleNewRowChange = (field, value) => {
    setWorkCenters((prev) =>
      prev.map((wc) =>
        wc._isNew ? { ...wc, [field]: field === "isActive" ? value === "true" : value } : wc
      )
    );
  };

  // 저장
  const handleSave = async () => {
    const newRow = workCenters.find((wc) => wc._isNew);
    if (!newRow) return;

    if (!newRow.workCenterId || !newRow.workCenterNm) {
      alert("작업장 ID와 이름은 필수입니다.");
      return;
    }

    try {
      await axios.post(WORK_CENTER_API_URL, {
        workCenterId: newRow.workCenterId,
        workCenterNm: newRow.workCenterNm,
        processId: newRow.processId,
        isActive: newRow.isActive,
        remark: newRow.remark,
      });
      await fetchWorkCenters(searchParams);
      alert("저장 완료!");
    } catch (e) {
      alert(`저장 실패: ${e?.response?.data?.message || e.message}`);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!selectedWorkCenterId) {
      alert("삭제할 작업장을 선택하세요.");
      return;
    }
    if (!window.confirm(`정말 삭제하시겠습니까? (${selectedWorkCenterId})`)) return;

    try {
      await axios.delete(`${WORK_CENTER_API_URL}/${selectedWorkCenterId}`);
      await fetchWorkCenters(searchParams);
      alert("삭제 완료!");
    } catch (e) {
      alert(`삭제 실패: ${e?.response?.data?.message || e.message}`);
    }
  };

  // 아이콘 핸들러 바인딩
  useEffect(() => {
    setIconHandlers({
      onSearch: handleSearch,
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
  }, [handleSearch, searchParams, workCenters, selectedWorkCenterId]);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", height: "90vh" }}>
      {/* 검색영역 */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div>
            <label htmlFor="workCenterId">작업장 ID: </label>
            <input id="workCenterId" name="workCenterId" value={searchParams.workCenterId} onChange={handleSearchChange} style={{ border: "1px solid black" }}/>
          </div>
          <div>
            <label htmlFor="workCenterNm">작업장명: </label>
            <input id="workCenterNm" name="workCenterNm" value={searchParams.workCenterNm} onChange={handleSearchChange} style={{ border: "1px solid black" }}/>
          </div>
          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input id="processId" name="processId" value={searchParams.processId} onChange={handleSearchChange} style={{ border: "1px solid black" }}/>
          </div>
          <div>
            <label htmlFor="isActive">활성 여부: </label>
            <select id="isActive" name="isActive" value={searchParams.isActive === null ? "" : searchParams.isActive} onChange={handleSearchChange} style={{ border: "1px solid black" }}>
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 하단 그리드 */}
      <div style={{ flex: 1, display: "flex", gap: "20px", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "1px solid #ccc" }}>
          <h3 style={{ margin: 0, padding: "10px", backgroundColor: "#f2f2f2" }}>작업장</h3>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <p>로딩 중...</p>
            ) : (
              <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#eee" }}>
                    <th>No.</th>
                    <th>ID</th>
                    <th>작업장명</th>
                    <th>공정ID</th>
                    <th>활성 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {workCenters.map((wc, idx) =>
                    wc._isNew ? (
                      <tr key={`new-${idx}`} style={{ backgroundColor: "#fffbe6" }}>
                        <td>
                          <input value={wc.workCenterId} placeholder="작업장 ID" onChange={(e) => handleNewRowChange("workCenterId", e.target.value)} />
                        </td>
                        <td>
                          <input value={wc.workCenterNm} placeholder="작업장명" onChange={(e) => handleNewRowChange("workCenterNm", e.target.value)} />
                        </td>
                        <td>
                          <input value={wc.processId} placeholder="공정 ID" onChange={(e) => handleNewRowChange("processId", e.target.value)} />
                        </td>
                        <td>
                          <select value={wc.isActive ? "true" : "false"} onChange={(e) => handleNewRowChange("isActive", e.target.value)}>
                            <option value="true">활성</option>
                            <option value="false">비활성</option>
                          </select>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={wc.workCenterId}
                        onClick={() => handleWorkCenterSelect(wc.workCenterId)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: selectedWorkCenterId === wc.workCenterId ? "#e3f2fd" : "transparent",
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>{wc.workCenterId}</td>
                        <td>{wc.workCenterNm}</td>
                        <td>{wc.processId}</td>
                        <td>{wc.isActive ? "활성" : "비활성"}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <EquipmentManagement workCenterId={selectedWorkCenterId} />
      </div>
    </div>
  );
}
