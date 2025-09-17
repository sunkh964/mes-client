import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/workOrders";

export default function WorkOrder() {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // 검색 조건
  const initialSearchParams = {
    workOrderId: "",
    processId: "",
    blockId: "",
    workCenterId: "",
    currentStatus: "",
    priority: "",
    plannedStartTimeFrom: "",
    plannedStartTimeTo: "",
    plannedEndTimeFrom: "",
    plannedEndTimeTo: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  /** ================= 데이터 조회 관련 함수 ================= */
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
      let params = { ...searchParams };

      const response = await axios.get(`${API_URL}/search`, { params });
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

  /** ================= 이벤트 핸들러 ================= */
  // 검색 조건 변경 핸들러
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // 행 선택
  const handleSelectWorkOrder = (wo) => {
    setSelectedWorkOrder(wo);
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // 아이콘 핸들러 등록 (조회 버튼 눌렀을 때)
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    return () => setIconHandlers({ onSearch: null });
  }, [searchParams]);

  

  return (
    <div className="p-5">
      {/* ================= 상단 검색 그리드 ================= */}
      <div className="border border-gray-300 px-3 py-5 mb-5">
        <div className="flex flex-wrap gap-6">

          {/* 작업지시 ID */}
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

          {/* 공정 ID */}
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

          {/* 블록 ID */}
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

          {/* 작업장 ID */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">작업장 ID:</label>
            <input
              type="text"
              name="workCenterId"
              value={searchParams.workCenterId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>

          {/* 현재 상태 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">현재 상태:</label>
            <select
              name="currentStatus"
              value={searchParams.currentStatus}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            >
              <option value="">전체</option>
              <option value="waiting">대기</option>
              <option value="in_progress">진행중</option>
              <option value="completed">완료</option>
            </select>
          </div>

          {/* 우선순위 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">우선순위:</label>
            <select
              name="priority"
              value={searchParams.priority}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            >
              <option value="">전체</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* 계획 시작일 (From ~ To) */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">계획 시작일:</label>
            <input
              type="datetime-local"
              name="plannedStartTimeFrom"
              value={searchParams.plannedStartTimeFrom}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
            <span>~</span>
            <input
              type="datetime-local"
              name="plannedStartTimeTo"
              value={searchParams.plannedStartTimeTo}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>

          {/* 계획 종료일 (From ~ To) */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">계획 종료일:</label>
            <input
              type="datetime-local"
              name="plannedEndTimeFrom"
              value={searchParams.plannedEndTimeFrom}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
            <span>~</span>
            <input
              type="datetime-local"
              name="plannedEndTimeTo"
              value={searchParams.plannedEndTimeTo}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>

          {/* 초기화 버튼 */}
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
      <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", marginBottom: 20 }}>
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              {/* 테이블 헤더*/}
              <th className="p-3">작업지시 ID</th>
              <th className="p-3">공정 ID</th>
              <th className="p-3">공정계획 ID</th>
              <th className="p-3">우선순위</th>
              <th className="p-3">담당자</th>
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
                  <td className="p-3">{wo.workOrderId}</td>
                  <td className="p-3">{wo.processId}</td>
                  <td className="p-3">{wo.blockPlanId}</td>
                  <td className="p-3">{wo.priority}</td>
                  <td className="p-3">{wo.employeeId}</td>
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
                <th className="p-3">작업지시 ID</th>
                <th className="p-3">공정 ID</th>
                <th className="p-3">블록 계획 ID</th>
                <th className="p-3">블록 ID</th>
                <th className="p-3">작업장 ID</th>
                <th className="p-3">설비 ID</th>
                <th className="p-3">작업자 ID</th>
                <th className="p-3">지시사항</th>
                <th className="p-3">생산 예정 수량</th>
                <th className="p-3">생산 완료 수량</th>
                <th className="p-3">계획 시작일</th>
                <th className="p-3">계획 종료일</th>
                <th className="p-3">실제 시작일</th>
                <th className="p-3">실제 종료일</th>
                <th className="p-3">현재 상태</th>
                <th className="p-3">우선순위</th>
                <th className="p-3">비고</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className="p-3">{selectedWorkOrder.workOrderId}</td>
                <td className="p-3">{selectedWorkOrder.process?.processId || "-"}</td>
                <td className="p-3">{selectedWorkOrder.blockPlan?.blockPlanId || "-"}</td>
                <td className="p-3">{selectedWorkOrder.block?.blockId || "-"}</td>
                <td className="p-3">{selectedWorkOrder.workCenter?.workCenterId || "-"}</td>
                <td className="p-3">{selectedWorkOrder.equipment?.equipmentId || "-"}</td>
                <td className="p-3">{selectedWorkOrder.employee?.employeeId || "-"}</td>
                <td className="p-3">{selectedWorkOrder.instruction}</td>
                <td className="p-3">{selectedWorkOrder.quantityToProduce}</td>
                <td className="p-3">{selectedWorkOrder.quantityProduced}</td>
                <td className="p-3">{selectedWorkOrder.plannedStartTime}</td>
                <td className="p-3">{selectedWorkOrder.plannedEndTime}</td>
                <td className="p-3">{selectedWorkOrder.actualStartTime}</td>
                <td className="p-3">{selectedWorkOrder.actualEndTime}</td>
                <td className="p-3">{selectedWorkOrder.currentStatus}</td>
                <td className="p-3">{selectedWorkOrder.priority}</td>
                <td className="p-3">{selectedWorkOrder.remark}</td>
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
