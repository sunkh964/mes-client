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

  // ================= 전체 조회 =================
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

  // ================= 검색 =================
  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/search`, { params: searchParams });
      setWorkOrders(response.data);
      setSelectedWorkOrder(response.data.length > 0 ? response.data[0] : null);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  // ================= 신규 =================
  const handleNew = () => {
    if (workOrders.some((wo) => wo._isNew)) return; // 이미 신규행 있으면 추가 안 함

    const newRow = {
      workOrderId: null,
      processId: "",
      blockPlanId: "",
      blockId: "",
      workCenterId: "",
      equipmentId: "",
      employeeId: "",
      instruction: "",
      quantityToProduce: 0,
      quantityProduced: 0,
      plannedStartTime: "",
      plannedEndTime: "",
      actualStartTime: "",
      actualEndTime: "",
      currentStatus: "waiting",
      priority: "",
      remark: "",
      _isNew: true,
    };

    setWorkOrders((prev) => [...prev, newRow]);
    setSelectedWorkOrder(newRow);
  };

  // ================= 신규행 값 변경 =================
  const handleNewRowChange = (field, value) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo._isNew ? { ...wo, [field]: value } : wo))
    );
    setSelectedWorkOrder((prev) =>
      prev && prev._isNew ? { ...prev, [field]: value } : prev
    );
  };

  // ================= 저장 =================
  const handleSave = async () => {
    const newRow = workOrders.find((wo) => wo._isNew);
    if (!newRow) {
      alert("신규 행이 없습니다.");
      return;
    }

    try {
      await axios.post(API_URL, {
        processId: newRow.processId,
        blockPlanId: newRow.blockPlanId,
        blockId: newRow.blockId,
        workCenterId: newRow.workCenterId,
        equipmentId: newRow.equipmentId,
        employeeId: newRow.employeeId,
        instruction: newRow.instruction,
        quantityToProduce: newRow.quantityToProduce,
        quantityProduced: newRow.quantityProduced,
        plannedStartTime: newRow.plannedStartTime || null,
        plannedEndTime: newRow.plannedEndTime || null,
        actualStartTime: newRow.actualStartTime || null,
        actualEndTime: newRow.actualEndTime || null,
        currentStatus: newRow.currentStatus,
        priority: newRow.priority,
        remark: newRow.remark,
      });
      await fetchWorkOrders();
      alert("저장 완료!");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= 삭제 =================
  const handleDelete = async () => {
    if (!selectedWorkOrder) {
      alert("삭제할 행을 선택하세요.");
      return;
    }
    if (!selectedWorkOrder.workOrderId) {
      alert("신규 행은 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm(`정말 삭제하시겠습니까? (ID: ${selectedWorkOrder.workOrderId})`)) return;

    try {
      await axios.delete(`${API_URL}/${selectedWorkOrder.workOrderId}`);
      await fetchWorkOrders();
      alert("삭제 완료!");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= 초기화 =================
  const handleReset = () => {
    setSearchParams(initialSearchParams);
    fetchWorkOrders();
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
  }, [searchParams, workOrders, selectedWorkOrder]);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // ================= 행 선택 =================
  const handleSelectWorkOrder = (wo) => {
    setSelectedWorkOrder(wo);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* ================= 검색 영역 ================= */}
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

      {/* ================= 목록 ================= */}
      <h2 className="mb-2 text-lg font-semibold">작업지시 목록</h2>
      <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", marginBottom: 20 }}>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th style={{ padding: 8 }}>No.</th>
              <th style={{ padding: 8 }}>작업지시 ID</th>
              <th style={{ padding: 8 }}>공정 ID</th>
              <th style={{ padding: 8 }}>블록 계획 ID</th>
              <th style={{ padding: 8 }}>블록 ID</th>
              <th style={{ padding: 8 }}>작업장 ID</th>
              <th style={{ padding: 8 }}>우선순위</th>
              <th style={{ padding: 8 }}>상태</th>
              <th style={{ padding: 8 }}>작업자</th>
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
              workOrders.map((wo, idx) =>
                wo._isNew ? (
                  <tr key={`new-${idx}`} style={{ backgroundColor: "#fffbe6" }}>
                    <td style={{ padding: 8 }}>신규</td>
                    <td style={{ padding: 8 }}>
                      <input
                        value={wo.processId}
                        onChange={(e) => handleNewRowChange("processId", e.target.value)}
                        className="border px-1 text-sm w-24"
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        value={wo.blockPlanId}
                        onChange={(e) => handleNewRowChange("blockPlanId", e.target.value)}
                        className="border px-1 text-sm w-24"
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        value={wo.blockId}
                        onChange={(e) => handleNewRowChange("blockId", e.target.value)}
                        className="border px-1 text-sm w-24"
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        value={wo.workCenterId}
                        onChange={(e) => handleNewRowChange("workCenterId", e.target.value)}
                        className="border px-1 text-sm w-24"
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        value={wo.priority}
                        onChange={(e) => handleNewRowChange("priority", e.target.value)}
                        className="border px-1 text-sm w-16"
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <select
                        value={wo.currentStatus}
                        onChange={(e) => handleNewRowChange("currentStatus", e.target.value)}
                        className="border px-1 text-sm"
                      >
                        <option value="waiting">대기</option>
                        <option value="in-progress">진행중</option>
                        <option value="completed">완료</option>
                      </select>
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        value={wo.employeeId}
                        onChange={(e) => handleNewRowChange("employeeId", e.target.value)}
                        className="border px-1 text-sm w-24"
                      />
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={wo.workOrderId}
                    onClick={() => handleSelectWorkOrder(wo)}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedWorkOrder?.workOrderId === wo.workOrderId ? "#cce5ff" : "white",
                    }}
                  >
                    <td style={{ padding: 8 }}>{idx+1}</td>
                    <td style={{ padding: 8 }}>{wo.workOrderId}</td>
                    <td style={{ padding: 8 }}>{wo.processId}</td>
                    <td style={{ padding: 8 }}>{wo.blockPlanId}</td>
                    <td style={{ padding: 8 }}>{wo.blockId}</td>
                    <td style={{ padding: 8 }}>{wo.workCenterId}</td>
                    <td style={{ padding: 8 }}>{wo.priority}</td>
                    <td style={{ padding: 8 }}>{wo.currentStatus}</td>
                    <td style={{ padding: 8 }}>{wo.employeeId}</td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ================= 상세조회 ================= */}
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
          <div style={{ padding: 10 }}>조회된 작업지시가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
