import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/qualityControl";

export default function MaterialQC() {
  const [materialQC, setMaterialQC] = useState([]);
  const [selectedMaterialQC, setSelectedMaterialQC] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  // 검색 조건 초기값
  const initialSearchParams = {
    purchaseOrderId: "",
    materialId: "",
    from: "",
    to: "",
    result: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  // ================= 전체 조회 =================
  const fetchMaterialQC = async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      setMaterialQC(res.data);
      setSelectedMaterialQC(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("자재 품질 데이터 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchMaterialQC();
  }, []);

  // ================= 검색 =================
  const handleSearch = async () => {
    try {
      const params = {
        purchaseOrderId: searchParams.purchaseOrderId || undefined,
        materialId: searchParams.materialId
          ? Number(searchParams.materialId)
          : undefined,
        inspectionDateFrom: searchParams.from
          ? `${searchParams.from}T00:00:00`
          : undefined,
        inspectionDateTo: searchParams.to
          ? `${searchParams.to}T23:59:59`
          : undefined,
        result: searchParams.result || undefined,
      };

      const res = await axios.get(`${API_URL}/search`, { params });
      setMaterialQC(res.data);
      setSelectedMaterialQC(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("검색 실패:", e);
      setMaterialQC([]);
    }
  };

  // ================= 신규 =================
  const handleNew = () => {
    if (materialQC.some((qc) => qc._isNew)) return; // 이미 신규행 있으면 추가 안 함

    const newRow = {
      qcId: null,
      purchaseOrderId: "",
      orderDetailId: "",
      workOrderId: "",
      materialId: "",
      inspectorId: "",
      inspectionDate: "",
      result: "PENDING",
      passQuantity: 0,
      failQuantity: 0,
      defectType: "",
      remark: "",
      _isNew: true,
    };

    setMaterialQC((prev) => [...prev, newRow]);
    setSelectedMaterialQC(newRow);
    setEditingRowId(newRow.qcId); // 신규행 수정모드 바로 진입
  };

  // ================= 저장 =================
  const handleSave = async () => {
    if (!selectedMaterialQC) {
      alert("저장할 품질검사를 선택하세요.");
      return;
    }
    console.log("데이터:", selectedMaterialQC)
    try {
      if (selectedMaterialQC._isNew) {
        // 신규 → POST
        await axios.post(API_URL, selectedMaterialQC);
        alert("신규 품질검사 등록 완료!");
      } else {
        // 기존 → PUT
        await axios.put(`${API_URL}/${selectedMaterialQC.qcId}`, selectedMaterialQC);
        alert("품질검사 수정 완료!");
      }
      await fetchMaterialQC();
      setEditingRowId(null); // 저장 후 수정 모드 해제
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= 삭제 =================
  const handleDelete = async () => {
    if (!selectedMaterialQC) {
      alert("삭제할 행을 선택하세요.");
      return;
    }
    if (selectedMaterialQC._isNew) {
      // 신규행은 단순 화면 제거
      setMaterialQC((prev) => prev.filter((qc) => qc !== selectedMaterialQC));
      setSelectedMaterialQC(null);
      return;
    }

    if (!window.confirm(`정말 삭제하시겠습니까? (QC ID: ${selectedMaterialQC.qcId})`)) return;

    try {
      await axios.delete(`${API_URL}/${selectedMaterialQC.qcId}`);
      await fetchMaterialQC();
      alert("삭제 완료!");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= 초기화 =================
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchMaterialQC();
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // ================= 아이콘 핸들러 등록 =================
  useEffect(() => {
    setIconHandlers({
      onSearch: handleSearch,
      onNew: handleNew,
      onSave: handleSave,
      onDelete: handleDelete,
    });
    return () =>
      setIconHandlers({
        onSearch: null,
        onNew: null,
        onSave: null,
        onDelete: null,
      });
  }, [searchParams, materialQC, selectedMaterialQC]);

  // ================= 컬럼 정의 =================
  const columns = [
    { header: "검사 ID", accessor: "qcId" }, // 읽기 전용
    { header: "발주 ID", accessor: "purchaseOrderId", editable: true, editor: "text" },
    { header: "발주 상세 ID", accessor: "orderDetailId", editable: true, editor: "text" },
    { header: "작업지시 ID", accessor: "workOrderId", editable: true, editor: "text" },
    { header: "자재 ID", accessor: "materialId", editable: true, editor: "text" },
    { header: "검사자 ID", accessor: "inspectorId", editable: true, editor: "text" },
    { header: "검사 일시", accessor: "inspectionDate", editable: true, editor: "datetime" },
    {
      header: "검사 결과",
      accessor: "result",
      editable: true,
      editor: "select",
      options: ["PASS", "FAIL", "PARTIAL","PENDING"],
    },
    { header: "합격 수량", accessor: "passQuantity", editable: true, editor: "number" },
    { header: "불합격 수량", accessor: "failQuantity", editable: true, editor: "number" },
    { header: "불량 유형", accessor: "defectType", editable: true, editor: "text" },
    { header: "비고", accessor: "remark", editable: true, editor: "text" },
  ];

  // ================= 더블클릭 수정 =================
  const handleRowDoubleClick = (row) => {
    setEditingRowId(row.qcId);   // 수정 모드 진입
    setSelectedMaterialQC(row);  // 기존 값 그대로 가져옴
  };

  // ================= UI =================
  return (
    <div className="mb-2.5 p-5">
      {/* 검색 영역 */}
      <div className="border border-gray-300 p-3 mb-5">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">발주 ID:</label>
            <input
              type="text"
              name="purchaseOrderId"
              value={searchParams.purchaseOrderId}
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
            <label className="text-sm font-medium">검사 결과:</label>
            <select
              name="result"
              value={searchParams.result}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            >
              <option value="">전체</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto px-3 py-1 border bg-slate-500 text-white text-sm hover:bg-slate-600"
          >
            초기화
          </button>
        </div>
      </div>

      <h2 className="mb-2 text-lg font-semibold">자재 품질검사 목록</h2>

      {/* 테이블 */}
      <div className="max-h-[600px] overflow-y-auto border border-gray-300 mb-2.5">
        <TableGrid
          columns={columns}
          data={materialQC}
          rowKey="qcId"
          selectedRow={selectedMaterialQC}
          onRowSelect={setSelectedMaterialQC}
          onCellUpdate={(rowIndex, field, value) => {
            setMaterialQC((prev) =>
              prev.map((qc, i) =>
                i === rowIndex ? { ...qc, [field]: value } : qc
              )
            );
            setSelectedMaterialQC((prev) =>
              prev ? { ...prev, [field]: value } : prev
            );
          }}
          readOnly={false}
          editingRowId={editingRowId}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>
    </div>
  );
}