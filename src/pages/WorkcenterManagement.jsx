import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import EquipmentManagement from "./EquipmentManagement";
import TableGrid from "../layouts/TableGrid";

const WORK_CENTER_API_URL = "http://localhost:8082/api/work-centers";

export default function WorkCenterManagement() {
  const [workCenters, setWorkCenters] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
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
        setSelectedRow(response.data[0]);
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
  setSelectedRow(newRow);          // selectedRow로 바로 연결
  setSelectedWorkCenterId(null);   
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

   // 컬럼 정의 
  const columns = [
    { header: "ID", accessor: "workCenterId", editable: (row) => row._isNew },
    { header: "작업장명", accessor: "workCenterNm", editable: true },
    { header: "공정 ID", accessor: "processId", editable: true },
    { 
      header: "활성 여부", 
      accessor: "isActive", 
      editable: true,
      editor: "select",               
      options: ["활성", "비활성"], 
    },
  ];

  // 데이터 전처리
  const processedData = workCenters.map((wc) => ({
    ...wc,
    isActive: wc.isActive ? "활성" : "비활성",
  }));

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
        <div className="flex-1 flex flex-col border border-gray-300">
          <h3 className="m-0 px-4 py-2 bg-gray-100 font-semibold text-sm">작업장</h3>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4">로딩 중...</p>
            ) : error ? (
              <p className="p-4 text-red-500">에러: {error.message}</p>
            ) : (
              <TableGrid
                columns={columns}
                data={processedData}
                rowKey="workCenterId"
                selectedRow={selectedRow}
                onRowSelect={(row) => {
                  setSelectedRow(row);
                  setSelectedWorkCenterId(row.workCenterId);   // 동기화
                }}
                onCellUpdate={(rowIndex, field, value) => {
                  setWorkCenters((prev) =>
                    prev.map((wc, i) =>
                      i === rowIndex
                        ? {
                            ...wc,
                            [field]: field === "isActive" ? value === "활성" : value,
                          }
                        : wc
                    )
                  );
                }}
                readOnly={false}
              />
            )}
          </div>
        </div>

        <EquipmentManagement workCenterId={selectedWorkCenterId} />
      </div>
    </div>
  );
}
