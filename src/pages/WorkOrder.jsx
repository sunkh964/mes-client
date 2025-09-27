import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/workOrders";

export default function WorkOrder() {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

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
      if (response.data.length > 0) {
        setSelectedWorkOrder(response.data[0]); // 첫 번째 행 자동 선택
      }
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
      priority: "우선순위",
      remark: "",
      _isNew: true,

    };

    setWorkOrders((prev) => [...prev, newRow]);
    setSelectedWorkOrder(newRow);
    setEditingRowId(newRow.workOrderId);
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
    if (!selectedWorkOrder) {
      alert("저장할 작업지시를 선택하세요.");
      return;
    }

    try {
      if (selectedWorkOrder._isNew || !selectedWorkOrder.workOrderId) {
        // 신규 → POST
        await axios.post(API_URL, {
          processId: selectedWorkOrder.processId,
          blockPlanId: selectedWorkOrder.blockPlanId,
          blockId: selectedWorkOrder.blockId,
          workCenterId: selectedWorkOrder.workCenterId,
          equipmentId: selectedWorkOrder.equipmentId,
          employeeId: selectedWorkOrder.employeeId,
          instruction: selectedWorkOrder.instruction,
          quantityToProduce: selectedWorkOrder.quantityToProduce,
          quantityProduced: selectedWorkOrder.quantityProduced,
          plannedStartTime: selectedWorkOrder.plannedStartTime || null,
          plannedEndTime: selectedWorkOrder.plannedEndTime || null,
          actualStartTime: selectedWorkOrder.actualStartTime || null,
          actualEndTime: selectedWorkOrder.actualEndTime || null,
          currentStatus: selectedWorkOrder.currentStatus,
          priority: selectedWorkOrder.priority,
          remark: selectedWorkOrder.remark,
        });
        alert("신규 작업지시 등록 완료!");
      } else {
        // 기존 → PUT
        await axios.put(`${API_URL}/${selectedWorkOrder.workOrderId}`, selectedWorkOrder);
        alert("작업지시 수정 완료!");
      }

      await fetchWorkOrders(); // 목록 새로고침
      setEditingRowId(null); // 저장 후 수정모드 해제
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

  // ================= 컬럼 정의 =================
  const columns = [
    { header: "공정 ID", accessor: "processId", editable: true },
    { header: "블록계획 ID", accessor: "blockPlanId", editable: true },
    { header: "블록 ID", accessor: "blockId", editable: true },
    { header: "작업장", accessor: "workCenterId", editable: true },
    { header: "설비", accessor: "equipmentId", editable: true },
    { header: "담당자", accessor: "employeeId", editable: true },
    {
      header: "우선순위",
      accessor: "priority",
      editable: true,
      editor: "select",
      options: [1, 2, 3, 4, 5],
    },
    {
      header: "상태",
      accessor: "currentStatus",
      editable: true,
      editor: "select",
      options: ["waiting", "in-progress", "completed"],
    },
    { header: "비고", accessor: "remark", editable: true },
  ];

  // ================= 더블클릭 수정 =================
  const handleRowDoubleClick = (row) => {
    if (!row._isNew) {
      setEditingRowId(row.workOrderId); // 기존행 수정
      setSelectedWorkOrder(row);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* ================= 검색 영역 ================= */}
      <div className="border border-gray-300 p-3 mb-5">
        <div className="flex flex-wrap gap-6">
          {/* <div className="flex items-center gap-2">
            <label className="text-sm font-medium">공정 ID:</label>
            <input
              type="text"
              name="processId"
              value={searchParams.processId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div> */}
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
      <div className="overflow-y-auto h-[500px] border border-gray-300">
        <TableGrid
          columns={columns}
          data={workOrders}
          rowKey="workOrderId"
          selectedRow={selectedWorkOrder}
          onRowSelect={setSelectedWorkOrder}
          onCellUpdate={(rowIndex, field, value) => {
            setWorkOrders((prev) =>
              prev.map((wo, i) =>
                i === rowIndex ? { ...wo, [field]: value } : wo
              )
            );
          }}
          readOnly={false}
          editingRowId={editingRowId} // 현재 수정중인 행 ID 전달
          onRowDoubleClick={handleRowDoubleClick} // 더블클릭 
          getRowClassName={(row) => {
            if (selectedWorkOrder?.workOrderId === row.workOrderId) {
              return "bg-blue-100"; // 선택된 행
            }
            if (row.priority == 1) {
              return "bg-rose-100"; // 우선순위 1
            }
            // 작업장/설비/담당자 누락 → 노란색
            if (!row.workCenterId || !row.equipmentId || !row.employeeId) {
              return "bg-yellow-50";
            }
            return "";
          }}
        />
      </div>

      {/* ================= 상세조회 ================= */}
      {/* <h3 className="mb-2 text-lg font-semibold">상세조회</h3>
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
      </div> */}
    </div >
  );
}
