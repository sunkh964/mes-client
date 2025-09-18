import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/shipments";

export default function Shipment() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // 검색 조건 초기값
  const initialSearchParams = {
    salesOrderId: "",
    customerId: "",
    vesselId: "",
    plannedShipDateFrom: "",
    plannedShipDateTo: "",
    status: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  // 전체 데이터 조회
  const fetchShipments = async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      setShipments(res.data);
      setSelectedShipment(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("출하 데이터 조회 실패:", e);
      setShipments([]);
      setSelectedShipment(null);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // 검색 실행
  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_URL}/search`, { params: searchParams });
      setShipments(res.data);
      setSelectedShipment(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("출하 검색 실패:", e);
    }
  };

  // 날짜 포맷
  const formatDateTime = (dateStr, withTime = false) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (withTime) {
        // 상세 화면 → YYYY-MM-DD HH:mm:ss
        return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        });
    } else {
        // 목록 화면 → YYYY-MM-DD
        return date.toISOString().slice(0, 10);
    }};


  // 검색 아이콘 핸들러 연결
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    return () => {
      setIconHandlers({ onSearch: null });
    };
  }, [searchParams]);

  // 검색조건 변경
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // 초기화
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchShipments();
  };

  // 상태 변환 (상세에서 텍스트로 보여줄 때 사용)
  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return "계획";
      case 1:
        return "출하";
      case 2:
        return "인도완료";
      case 3:
        return "취소";
      default:
        return "-";
    }
  };

  return (
    <div className="mb-2.5 p-5">
      {/* ==================== 상단 검색 ==================== */}
      <div className="border border-gray-300 px-3 py-5 mb-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">수주번호:</label>
            <input
              type="text"
              name="salesOrderId"
              value={searchParams.salesOrderId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">고객번호:</label>
            <input
              type="text"
              name="customerId"
              value={searchParams.customerId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">배번호:</label>
            <input
              type="text"
              name="vesselId"
              value={searchParams.vesselId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">출하예정일(From):</label>
            <input
              type="date"
              name="plannedShipDateFrom"
              value={searchParams.plannedShipDateFrom}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">출하예정일(To):</label>
            <input
              type="date"
              name="plannedShipDateTo"
              value={searchParams.plannedShipDateTo}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">상태:</label>
            <select
              name="status"
              value={searchParams.status}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            >
              <option value="">전체</option>
              <option value="0">계획</option>
              <option value="1">출하</option>
              <option value="2">인도완료</option>
              <option value="3">취소</option>
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

      {/* ==================== 출하 목록 ==================== */}
      <h2 className="mb-2 text-lg font-semibold">출하 목록</h2>
      <div className="max-h-[300px] overflow-y-auto border border-gray-300 mb-5">
        <table className="w-full border-collapse text-sm">
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th className="p-2">No.</th>
              <th className="p-2">출하번호</th>
              <th className="p-2">수주번호</th>
              <th className="p-2">고객번호</th>
              <th className="p-2">선박코드</th>
              <th className="p-2">출하예정일</th>
              <th className="p-2">상태</th>
              <th className="p-2">승인여부</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  조회된 출하목록이 없습니다.
                </td>
              </tr>
            ) : (
              shipments.map((ship, idx) => (
                <tr
                  key={ship.shipmentId}
                  onClick={() => setSelectedShipment(ship)}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    selectedShipment?.shipmentId === ship.shipmentId ? "bg-blue-100" : ""
                  }`}
                >
                  <td className="p-2">{idx+1}</td>
                  <td className="p-2">{ship.shipmentId}</td>
                  <td className="p-2">{ship.salesOrderId}</td>
                  <td className="p-2">{ship.customerId}</td>
                  <td className="p-2">{ship.vesselId}</td>
                  <td className="p-2">{formatDateTime(ship.plannedShipDate, false)}</td>
                  <td className="p-2">{renderStatus(ship.status)}</td>
                  <td className="p-2">{ship.approvedDate ? "승인" : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== 출하 상세 ==================== */}
      <h3 className="text-lg font-semibold mb-2">출하 상세</h3>
      <div className="border border-gray-300 rounded overflow-hidden">
        <table className="w-full border-collapse text-sm text-center">
          <tbody>
            <tr className="">
              <td className="border p-2 py-3 w-1/4 font-semibold">출하번호</td>
              <td className="border p-2 w-1/4 ">{selectedShipment?.shipmentId || "-"}</td>
              <td className="border p-2 py-3 w-1/4 font-semibold">상태</td>
              <td className="border p-2 w-1/4">{selectedShipment ? renderStatus(selectedShipment.status) : "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 py-3 font-semibold">선박코드</td>
              <td className="border p-2">{selectedShipment?.vesselId || "-"}</td>
              <td className="border p-2 py-3 font-semibold">수주번호</td>
              <td className="border p-2">{selectedShipment?.salesOrderId || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 py-3 font-semibold">고객번호</td>
              <td className="border p-2">{selectedShipment?.customerId || "-"}</td>
              <td className="border p-2 py-3 font-semibold">승인자</td>
              <td className="border p-2">{selectedShipment?.approvedBy || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 py-3 font-semibold">승인일시</td>
              <td className="border p-2">{formatDateTime(selectedShipment?.approvedDate, true)}</td>
              <td className="border p-2 py-3 font-semibold">출하 예정일</td>
              <td className="border p-2">{formatDateTime(selectedShipment?.plannedShipDate, true)}</td>
            </tr>
            <tr>
              <td className="border p-2 py-3 font-semibold">출하일</td>
              <td className="border p-2">{formatDateTime(selectedShipment?.actualShipDate, true)}</td>
              <td className="border p-2 py-3 font-semibold">비고</td>
              <td className="border p-2">{selectedShipment?.remark || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
