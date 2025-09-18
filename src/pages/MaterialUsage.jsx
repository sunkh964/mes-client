import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import MaterialSelectionModal from "./MaterialSelectionModal.jsx";

// API URL
const MATERIALS_API_URL = "http://localhost:8082/api/materials";
const MATERIAL_INPUTS_API_URL = "http://localhost:8082/api/materials-usage";

export default function MaterialUsage() {
  // --- 상태 관리 ---
  const [allMaterials, setAllMaterials] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [materialInputs, setMaterialInputs] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 검색 조건 초기값
  const initialSearchParams = {
    resultId: "",
    workOrderId: "",
    materialId: "",
    warehouse: "",
    start: "",
    end: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  // --- IconContext 연동 ---
  const { setIconHandlers } = useIconContext();

  // --- 데이터 조회 (자재 목록) ---
  const fetchAllMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(MATERIALS_API_URL);
      setAllMaterials(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 데이터 조회 (자재 사용 내역) ---
  const fetchMaterialInputs = useCallback(async () => {
    try {
      const response = await axios.get(MATERIAL_INPUTS_API_URL);
      setMaterialInputs(response.data);
    } catch (err) {
      setError(err);
    }
  }, []);

  // --- 검색 실행 ---
  const handleSearch = async () => {
    try {
      const response = await axios.get(MATERIAL_INPUTS_API_URL, {
        params: searchParams,
      });
      setMaterialInputs(response.data);
    } catch (err) {
      console.error("자재 사용 내역 검색 실패:", err);
      setMaterialInputs([]);
    }
  };

  // --- 검색 초기화 ---
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchMaterialInputs();
  };

  // 검색 조건 변경 핸들러
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchAllMaterials();
    fetchMaterialInputs();
  }, [fetchAllMaterials, fetchMaterialInputs]);

  // --- 이벤트 핸들러 ---
  const handleConfirmSelection = (selectedFromModal) => {
    const newRows = selectedFromModal.map((mat) => ({
      ...mat,
      usageQuantity: "", // 사용량 입력 필드를 위해 빈 값으로 초기화
    }));

    setSelectedRows((prevRows) => {
      const existingIds = new Set(prevRows.map((row) => row.materialId));
      const uniqueNewRows = newRows.filter(
        (row) => !existingIds.has(row.materialId)
      );
      return [...prevRows, ...uniqueNewRows];
    });
    setIsModalOpen(false);
  };

  const handleQuantityChange = (materialId, value) => {
    setSelectedRows((prevRows) =>
      prevRows.map((row) =>
        row.materialId === materialId
          ? { ...row, usageQuantity: parseInt(value) || 0 }
          : row
      )
    );
  };

  // '신규' 아이콘 클릭 시 실행될 함수
  const handleNew = () => setIsModalOpen(true);

  // '저장' 아이콘 클릭 시 실행될 함수 (아직 구현 안 함)
  const handleSave = () => {
    alert("저장 기능은 구현되지 않았습니다.");
  };

  // --- IconContext 핸들러 등록 ---
  useEffect(() => {
    setIconHandlers({
      onNew: handleNew,
      onSave: handleSave,
      onSearch: handleSearch, // ✅ 조회 버튼 대신 아이콘으로 검색 실행
      onDelete: null,
    });
    return () => {
      setIconHandlers({ onNew: null, onSave: null, onSearch: null, onDelete: null });
    };
  }, [setIconHandlers, searchParams]);

  // --- 렌더링 ---
  if (loading) return <p>전체 자재 목록을 불러오는 중입니다...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <div style={{ padding: "20px", height: "100%" }}>
      {/* ================= 상단 검색 그리드 ================= */}
      <div className="border border-gray-300 px-3 py-5 mb-5">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">작업내역 ID:</label>
            <input
              type="text"
              name="resultId"
              value={searchParams.resultId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">작업지시 ID:</label>
            <input
              type="text"
              name="workOrderId"
              value={searchParams.workOrderId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">자재 ID:</label>
            <input
              type="text"
              name="materialId"
              value={searchParams.materialId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">창고:</label>
            <input
              type="text"
              name="warehouse"
              value={searchParams.warehouse}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          {/* 사용일 From */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">사용일:</label>
            <input
              type="date"
              name="start"
              value={searchParams.start}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-40"
            />
          </div>
          {/* 사용일 To */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium"> ~ </label>
            <input
              type="date"
              name="end"
              value={searchParams.end}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-40"
            />
          </div>

          {/* 초기화 버튼만 유지 */}
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto px-3 py-1 border bg-slate-500 text-white text-sm hover:bg-slate-600"
          >
            초기화
          </button>
        </div>
      </div>

      {/* ================= 중간: 자재 선택/사용량 입력 ================= */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          border: "1px solid #ddd",
          minHeight: "250px",
        }}
      >
        <h2 className="mb-3 font-semibold">자재 사용 등록</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#eef1f5" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>자재 ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>자재명</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>현재고</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>사용량</th>
            </tr>
          </thead>
          <tbody>
            {selectedRows.map((row) => (
              <tr key={row.materialId}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {row.materialId}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {row.materialNm}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {row.currentStock}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <input
                    type="number"
                    value={row.usageQuantity}
                    onChange={(e) =>
                      handleQuantityChange(row.materialId, e.target.value)
                    }
                    placeholder="사용량 입력"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                      textAlign: "right",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <MaterialSelectionModal
          materials={allMaterials}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSelection}
        />
      )}

      {/* ================= 하단: 자재 사용 내역 ================= */}
      <div
        style={{
          marginTop: "20px",
          backgroundColor: "white",
          padding: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h2 className="mb-3 font-semibold">자재 사용 내역</h2>
        <div style={{ maxHeight: 250, overflowY: "auto" }}>
          <table className="w-full border border-gray-200">
            <thead>
              <tr style={{ backgroundColor: "#eef1f5" }}>
                <th className="p-2 px-4 border border-gray-200">작업내역 ID</th>
                <th className="p-2 px-4 border border-gray-200">작업지시 ID</th>
                <th className="p-2 px-4 border border-gray-200">자재 ID</th>
                <th className="p-2 px-6 border border-gray-200">수량</th>
                <th className="p-2 px-6 border border-gray-200">단위</th>
                <th className="p-2 px-6 border border-gray-200">사용 일시</th>
                <th className="p-2 px-6 border border-gray-200">창고</th>
                <th className="p-2 px-6 border border-gray-200">위치</th>
                <th className="p-2 px-6 border border-gray-200">작업자</th>
                <th className="p-2 px-4 border border-gray-200">비고</th>
              </tr>
            </thead>
            <tbody>
              {materialInputs.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 12 }}>
                    등록된 사용 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                materialInputs.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 px-4 border border-gray-200">{row.resultId}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.workOrderId}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.materialId}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.quantity}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.unit}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.inputDate}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.warehouse}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.location}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.employeeId}</td>
                    <td className="p-2 px-4 border border-gray-200">{row.remark}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}