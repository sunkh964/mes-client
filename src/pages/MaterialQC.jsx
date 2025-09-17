import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

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
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th className="p-3">검사 ID</th>
              <th className="p-3">발주 ID</th>
              <th className="p-3">발주 상세 ID</th>
              <th className="p-3">작업지시 ID</th>
              <th className="p-3">자재 ID</th>
              <th className="p-3">검사자 ID</th>
              <th className="p-3">검사일시</th>
              <th className="p-3">검사 결과</th>
              <th className="p-3">합격 수량</th>
              <th className="p-3">불합격 수량</th>
              <th className="p-3">불량 유형</th>
              <th className="p-3">비고</th>
              <th className="p-3">생성일</th>
              <th className="p-3">수정일</th>
            </tr>
          </thead>
          <tbody>
            {materialQC.length === 0 ? (
              <tr>
                <td colSpan={14} style={{ textAlign: "center", padding: 16 }}>
                  조회된 품질검사 목록이 없습니다.
                </td>
              </tr>
            ) : (
              materialQC.map((qc) => (
                <tr key={qc.qcId}>
                  <td className="p-3">{qc.qcId}</td>
                  <td className="p-3">{qc.purchaseOrderId}</td>
                  <td className="p-3">{qc.orderDetailId}</td>
                  <td className="p-3">{qc.workOrderId}</td>
                  <td className="p-3">{qc.materialId}</td>
                  <td className="p-3">{qc.inspectorId}</td>
                  <td className="p-3">{qc.inspectionDate}</td>
                  <td className="p-3">{qc.result}</td>
                  <td className="p-3">{qc.passQuantity}</td>
                  <td className="p-3">{qc.failQuantity}</td>
                  <td className="p-3">{qc.defectType}</td>
                  <td className="p-3">{qc.remark}</td>
                  <td className="p-3">{qc.createdAt}</td>
                  <td className="p-3">{qc.updatedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
