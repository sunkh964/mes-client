import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import MaterialSelectionModal from "./MaterialSelectionModal.jsx";
import TableGrid from "../layouts/TableGrid";

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
      onSearch: handleSearch, // 조회 버튼 대신 아이콘으로 검색 실행
      onDelete: null,
    });
    return () => {
      setIconHandlers({ onNew: null, onSave: null, onSearch: null, onDelete: null });
    };
  }, [setIconHandlers, searchParams]);

  // ================= 컬럼 정의 =================
  const registerColumns = [
    { header: "자재 ID", accessor: "materialId" },
    { header: "자재명", accessor: "materialNm" },
    { header: "현재고", accessor: "currentStock" },
    { header: "사용량", accessor: "usageQuantity", editable: true, editor: "number" }
  ];

  const historyColumns = [
    { header: "작업내역 ID", accessor: "resultId" },
    { header: "작업지시 ID", accessor: "workOrderId" },
    { header: "자재 ID", accessor: "materialId" },
    { header: "수량", accessor: "quantity" },
    { header: "단위", accessor: "unit" },
    { header: "사용 일시", accessor: "inputDate" },
    { header: "창고", accessor: "warehouse" },
    { header: "위치", accessor: "location" },
    { header: "작업자", accessor: "employeeId" },
    { header: "비고", accessor: "remark" },
  ];


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
        <TableGrid
          columns={registerColumns}
          data={selectedRows.map((row, index) => ({
            ...row,
            no: index + 1, // No. 컬럼 표시
          }))}
          rowKey="materialId"
          readOnly={false}
          alwaysEditable={true}
          onCellUpdate={(rowIndex, field, value) => {
            setSelectedRows((prev) =>
              prev.map((row, i) =>
                i === rowIndex ? { ...row, [field]: value } : row
              )
            );
          }}
        />
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
        <div className="flex-1 overflow-y-auto border border-gray-300 max-h-[300px]">
          <TableGrid
            columns={historyColumns}
            data={materialInputs}
            rowKey="resultId"
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}