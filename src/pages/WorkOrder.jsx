import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/workOrders";

export default function WorkOrder() {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // 검색 조건
  const initialSearchParams = {
    processId: "",
    blockId: "",
    workCenterId: "",
    currentStatus: "",
    priority: "",
    plannedStartTime: "",
    plannedEndTime: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  // 전체 조회
  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(API_URL);
      setWorkOrders(response.data);
      setSelectedWorkOrder(response.data.length > 0 ? response.data[0] : null);
    } catch (error) {
      console.error("작업지시 데이터 조회 실패:", error);
      setWorkOrders([]);
      setSelectedWorkOrder(null);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    try {
      let endpoint = "/search";
      let params = { ...searchParams };

      // 상세조건이 포함된 경우 searchDetail 호출
      if (params.priority || params.plannedStartTime || params.plannedEndTime) {
        endpoint = "/searchDetail";
      }

      const response = await axios.get(`${API_URL}${endpoint}`, { params });
      setWorkOrders(response.data);
      setSelectedWorkOrder(response.data.length > 0 ? response.data[0] : null);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchWorkOrders();
  };

  // 검색 조건 변경 핸들러
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // 아이콘 핸들러 등록 (조회 버튼 눌렀을 때)
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    return () => setIconHandlers({ onSearch: null });
  }, [searchParams]);

  // 행 선택
  const handleSelectWorkOrder = (wo) => {
    setSelectedWorkOrder(wo);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* ================= 상단 검색 그리드 ================= */}
      <div className="border border-gray-300 p-3 mb-5">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">공정 ID:</label>
            <input
              type="text"
              name="processId"
              value={searchParams.processId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
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
            <label className="text-sm font-medium">작업장:</label>
            <input
              type="text"
              name="workCenterId"
              value={searchParams.workCenterId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">상태:</label>
            <select
              name="currentStatus"
              value={searchParams.currentStatus}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            >
              <option value="">전체</option>
              <option value="waiting">대기</option>
              <option value="in-progress">진행중</option>
              <option value="completed">완료</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">우선순위:</label>
            <input
              type="number"
              name="priority"
              value={searchParams.priority}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">계획 시작:</label>
            <input
              type="datetime-local"
              name="plannedStartTime"
              value={searchParams.plannedStartTime}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">계획 종료:</label>
            <input
              type="datetime-local"
              name="plannedEndTime"
              value={searchParams.plannedEndTime}
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

      <h2 className="mb-2 text-lg font-semibold">작업지시 목록</h2>

      {/* 작업지시 목록 테이블 */}
      <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", marginBottom: 20 }}>
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              {/* 테이블 헤더 : workOrders가 비어있으면 헤더도 없으니 기본 컬럼명 적었습니다 */}
              <th style={{ padding: 8 }}>작업지시 ID</th>
              <th style={{ padding: 8 }}>공정 ID</th>
              <th style={{ padding: 8 }}>블록 생산 계획 ID</th>
              <th style={{ padding: 8 }}>블록 ID</th>
              <th style={{ padding: 8 }}>작업장 ID</th>
              <th style={{ padding: 8 }}>우선순위</th>
              <th style={{ padding: 8 }}>현재상태</th>
              <th style={{ padding: 8 }}>담당자</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: 16 }}>
                  조회된 작업지시가 없습니다.
                </td>
              </tr>
            ) : (
              workOrders.map((wo) => (
                <tr
                  key={wo.workOrderId}
                  onClick={() => handleSelectWorkOrder(wo)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedWorkOrder?.workOrderId === wo.workOrderId ? "#cce5ff" : "white",
                  }}
                >
                  <td style={{ padding: 8 }}>{wo.workOrderId}</td>
                  <td style={{ padding: 8 }}>{wo.processId}</td>
                  <td style={{ padding: 8 }}>{wo.blockPlanId}</td>
                  <td style={{ padding: 8 }}>{wo.blockId}</td>
                  <td style={{ padding: 8 }}>{wo.workCenterId}</td>
                  <td style={{ padding: 8 }}>{wo.priority}</td>
                  <td style={{ padding: 8 }}>{wo.currentStatus}</td>
                  <td style={{ padding: 8 }}>{wo.employeeId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 조회 */}
        <h3 className="mb-2 text-lg font-semibold">상세조회</h3>
        <div style={{ border: "1px solid #ccc", maxHeight: 400, overflowX: "auto" }}>

        {selectedWorkOrder ? (
            <table border="1" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead style={{ backgroundColor: "#f2f2f2" }}>
                <tr>
                <th style={{ padding: 8 }}>설비 ID</th>
                <th style={{ padding: 8 }}>지시사항</th>
                <th style={{ padding: 8 }}>생산 예정 수량</th>
                <th style={{ padding: 8 }}>생산 완료 수량</th>
                <th style={{ padding: 8 }}>계획 시작일</th>
                <th style={{ padding: 8 }}>계획 종료일</th>
                <th style={{ padding: 8 }}>실제 시작일</th>
                <th style={{ padding: 8 }}>실제 종료일</th>
                <th style={{ padding: 8 }}>비고</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td style={{ padding: 8 }}>{selectedWorkOrder.equipmentId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.instruction}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.quantityToProduce}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.quantityProduced}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.plannedStartTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.plannedEndTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.actualStartTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.actualEndTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.remark}</td>
                </tr>
            </tbody>
            </table>
        ) : (
            <div>조회된 작업지시가 없습니다.</div>
        )}
        </div>

    </div>
  );
}
