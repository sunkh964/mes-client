import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/blockQC";

export default function BlockQC() {
  const [blockQC, setBlockQC] = useState([]);
  const [selectedBlockQC, setSelectedBlockQC] = useState(null);

  // 검색 조건 초기값
  const initialSearchParams = {
    blockId: "",
    result: "",
    from: "",
    to: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  // 전체 데이터 조회
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

  // 검색 실행
  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_URL}/search`, { params: searchParams });
      setBlockQC(res.data);
      setSelectedBlockQC(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("검색 실패:", e);
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
    fetchBlockQC();
  };

  // 검색 조건 변경
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // 행 선택
  const handleSelectBlock = (row) => setSelectedBlockQC(row);

  return (
    <div className="mb-2.5 p-5">
      {/* ================= 상단 검색 그리드 ================= */}
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
            <label className="text-sm font-medium">검사일시 (To) :</label>
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
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th className="p-3">No.</th>
              <th className="p-3">블록품질 ID</th>
              <th className="p-3">작업지시 ID</th>
              <th className="p-3">블록 ID</th>
              <th className="p-3">작업자 ID</th>
              <th className="p-3">검사 일시</th>
              <th className="p-3">검사 결과</th>
              <th className="p-3">합격 수량</th>
              <th className="p-3">불합격 수량</th>
              <th className="p-3">불량 유형</th>
              <th className="p-3">비고</th>
            </tr>
          </thead>
          <tbody>
            {blockQC.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: 16 }}>
                  조회된 품질검사 목록이 없습니다.
                </td>
              </tr>
            ) : (
              blockQC.map((block, idx) => (
                <tr
                  key={block.blockQCId}
                  onClick={() => handleSelectBlock(block)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedBlockQC?.blockQCId === block.blockQCId ? "#cce5ff" : "white",
                  }}
                >
                  <td className="p-3">{idx+1}</td>
                  <td className="p-3">{block.blockQCId}</td>
                  <td className="p-3">{block.workOrderId}</td>
                  <td className="p-3">{block.blockId}</td>
                  <td className="p-3">{block.employeeId}</td>
                  <td className="p-3">{block.inspectionDate}</td>
                  <td className="p-3">{block.result}</td>
                  <td className="p-3">{block.passQuantity}</td>
                  <td className="p-3">{block.failQuantity}</td>
                  <td className="p-3">{block.defectType}</td>
                  <td className="p-3">{block.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
