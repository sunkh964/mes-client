import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/blockQC";

export default function BlockQC() {
  const [blockQC, setBlockQC] = useState([]);
  const [selectedBlockQC, setSelectedBlockQC] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  // 검색 조건 초기값
  const initialSearchParams = {
    blockId: "",
    result: "",
    from: "",
    to: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  // ================= 전체 조회 =================
  const fetchBlockQC = async () => {
    try {
      const res = await axios.get(`${API_URL}/getAll`);
      setBlockQC(res.data);
      setSelectedBlockQC(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("블록품질 데이터 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchBlockQC();
  }, []);

  // ================= 검색 =================
  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_URL}/search`, { params: searchParams });
      setBlockQC(res.data);
      setSelectedBlockQC(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("검색 실패:", e);
    }
  };

  // ================= 신규 =================
  const handleNew = () => {
    if (blockQC.some((qc) => qc._isNew)) return; // 이미 신규행 있으면 추가 안 함

    const newRow = {
      blockQCId: null,
      workOrderId: "1",
      blockId: "7",
      employeeId: "250812501001",
      inspectionDate: "",
      result: "PENDING",
      passQuantity: 0,
      failQuantity: 0,
      defectType: "",
      remark: "",
      _isNew: true,
    };

    setBlockQC((prev) => [...prev, newRow]);
    setSelectedBlockQC(newRow);
    setEditingRowId(newRow.blockQCId);
  };

  // ================= 저장 =================
  const handleSave = async () => {
    if (!selectedBlockQC) {
      alert("저장할 품질검사를 선택하세요.");
      return;
    }

    try {
      if (selectedBlockQC._isNew || !selectedBlockQC.blockQCId) {
        // 신규 → POST
        await axios.post(API_URL, selectedBlockQC);
        alert("신규 블록 품질검사 등록 완료!");
      } else {
        // 기존 → PUT
        await axios.put(`${API_URL}/${selectedBlockQC.blockQCId}`, selectedBlockQC);
        alert("블록 품질검사 수정 완료!");
      }

      await fetchBlockQC();
      setEditingRowId(null); // 수정 모드 해제
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= 삭제 =================
  const handleDelete = async () => {
    if (!selectedBlockQC) {
      alert("삭제할 행을 선택하세요.");
      return;
    }
    if (selectedBlockQC._isNew) {
      setBlockQC((prev) => prev.filter((qc) => qc !== selectedBlockQC));
      setSelectedBlockQC(null);
      return;
    }
    if (!window.confirm(`정말 삭제하시겠습니까? (QC ID: ${selectedBlockQC.blockQCId})`)) return;

    try {
      await axios.delete(`${API_URL}/${selectedBlockQC.blockQCId}`);
      await fetchBlockQC();
      alert("삭제 완료!");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= 초기화 =================
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchBlockQC();
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
  }, [searchParams, blockQC, selectedBlockQC]);

  // ================= 컬럼 정의 =================
  const columns = [
    { header: "블록품질 ID", accessor: "blockQCId" },
    { header: "작업지시 ID", accessor: "workOrderId", editable: true},
    { header: "블록 ID", accessor: "blockId", editable: true },
    { header: "작업자 ID", accessor: "employeeId", editable: true },
    { header: "검사 일시", accessor: "inspectionDate", editable: true, editor: "datetime" },
    {
      header: "검사 결과",
      accessor: "result",
      editable: true,
      editor: "select",
      options: ["PASS", "FAIL", "PARTIAL", "PENDING"],
    },
    { header: "합격 수량", accessor: "passQuantity", editable: true, editor: "number" },
    { header: "불합격 수량", accessor: "failQuantity", editable: true, editor: "number" },
    { header: "불량 유형", accessor: "defectType", editable: true },
    { header: "비고", accessor: "remark", editable: true },
  ];

  // ================= 더블클릭 수정 =================
  const handleRowDoubleClick = (row) => {
    if (!row._isNew) {
      setEditingRowId(row.blockQCId);
      setSelectedBlockQC(row);
    }
  };

  return (
    <div className="mb-2.5 p-5">
      {/* ================= 검색 영역 ================= */}
      <div className="border border-gray-300 px-3 py-5 mb-5">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">블록 ID:</label>
            <input
              type="text"
              name="blockId"
              value={searchParams.blockId}
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">검사일시(From):</label>
            <input
              type="date"
              name="from"
              value={searchParams.from}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">검사일시(To):</label>
            <input
              type="date"
              name="to"
              value={searchParams.to}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
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

      <h2 className="mb-2 text-lg font-semibold">블록 품질검사 목록</h2>

      {/* ================= 테이블 ================= */}
      <div className="max-h-[600px] overflow-y-auto border border-gray-300 mb-2.5">
        <TableGrid
          columns={columns}
          data={blockQC}
          rowKey="blockQCId"
          selectedRow={selectedBlockQC}
          onRowSelect={setSelectedBlockQC}
          onCellUpdate={(rowIndex, field, value) => {
            setBlockQC((prev) =>
              prev.map((qc, i) =>
                i === rowIndex ? { ...qc, [field]: value } : qc
              )
            );
            setSelectedBlockQC((prev) =>
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
