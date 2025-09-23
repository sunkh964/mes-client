import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/qualityControl";

export default function MaterialQC() {
  const [materialQC, setMaterialQC] = useState([]);

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

  // 전체 데이터 조회
  const fetchMaterialQC = async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      setMaterialQC(res.data);
    } catch (e) {
      console.error("자재 품질 데이터 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchMaterialQC();
  }, []);

  // 검색 실행
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
    } catch (e) {
      console.error("검색 실패:", e);
      setMaterialQC([]);
    }
  };


  // 아이콘 핸들러 등록 (상단 아이콘바 검색 버튼과 연결)
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    return () => {
      setIconHandlers({ onSearch: null });
    };
  }, [searchParams]);

  // 검색 조건 초기화
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchMaterialQC();
  };

  // 검색 조건 변경
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // ================= 컬럼 정의 =================
  const columns = [
    { header: "검사 ID", accessor: "qcId" },
    { header: "발주 ID", accessor: "purchaseOrderId" },
    { header: "발주 상세 ID", accessor: "orderDetailId" },
    { header: "작업지시 ID", accessor: "workOrderId" },
    { header: "자재 ID", accessor: "materialId" },
    { header: "검사자 ID", accessor: "inspectorId" },
    { header: "검사일시", accessor: "inspectionDate" },
    { header: "검사 결과", accessor: "result" },
    { header: "합격 수량", accessor: "passQuantity" },
    { header: "불합격 수량", accessor: "failQuantity" },
    { header: "불량 유형", accessor: "defectType" },
    { header: "비고", accessor: "remark" },
    { header: "생성일", accessor: "createdAt" },
    { header: "수정일", accessor: "updatedAt" },
  ];

  return (
    <div className="mb-2.5 p-5">
      {/* ================= 상단 검색 ================= */}
      <div className="border border-gray-300 px-3 py-5 mb-5">
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

      {/* ================= 테이블 ================= */}
      <div className="max-h-[600px] overflow-y-auto border border-gray-300 mb-2.5">
        <TableGrid
          columns={columns}
          data={materialQC}
          rowKey="qcId"
          readOnly={true}
        />
      </div>
    </div>
  );
}
