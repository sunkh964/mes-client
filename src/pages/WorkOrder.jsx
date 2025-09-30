import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/workOrders";

export default function WorkOrder() {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  // 콤보박스 데이터 상태
  const [processList, setProcessList] = useState([]);
  const [blockList, setBlockList] = useState([]);
  const [workCenterList, setWorkCenterList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

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
      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkOrders(response.data);
      if (response.data.length > 0) {
        setSelectedWorkOrder(response.data[0]); // ✅ 첫 번째 행 자동 선택
      }
    } catch (error) {
      console.error("작업지시 데이터 조회 실패:", error);
      setWorkOrders([]);
      setSelectedWorkOrder(null);
    }
  };

  // ================= 콤보 데이터 =================
  const fetchComboData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [procRes, blockRes, wcRes, eqRes, empRes] = await Promise.all([
        axios.get("http://localhost:8082/api/workOrders/processes", { headers }),
        axios.get("http://localhost:8082/api/workOrders/blocks", { headers }),
        axios.get("http://localhost:8082/api/workOrders/workCenters", { headers }),
        axios.get("http://localhost:8082/api/workOrders/equipments", { headers }),
        axios.get("http://localhost:8082/api/workOrders/employees", { headers }),
      ]);

      setProcessList(procRes.data);
      setBlockList(blockRes.data);
      setWorkCenterList(wcRes.data);
      setEquipmentList(eqRes.data);
      setEmployeeList(empRes.data);

      console.log("equipmentList 응답:", eqRes.data);
    } catch (err) {
      console.error("콤보박스 데이터 불러오기 실패:", err);
    }
  };
  useEffect(() => {
  console.log("workCenterList:", workCenterList);
}, [workCenterList]);

  // ================= 검색 =================
  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: searchParams,
      });
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
      workOrderId: `temp-${Date.now()}-${Math.random()}`, // ✅ 고유 ID
      processId: "",
      blockPlanId: "",
      blockId: "",
      workCenterId: null, // "" 대신 null
      equipmentId: null,
      employeeId: "",
      instruction: "",
      quantityToProduce: 0,
      quantityProduced: 0,
      plannedStartTime: null,
      plannedEndTime: null,
      actualStartTime: null,
      actualEndTime: null,
      currentStatus: "waiting",
      priority: 1, // 기본값
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

    // ✅ "" → null 변환
    const payload = {
      ...selectedWorkOrder,
      processId: selectedWorkOrder.processId || null,
      blockPlanId: selectedWorkOrder.blockPlanId || null,
      blockId: selectedWorkOrder.blockId || null,
      workCenterId: selectedWorkOrder.workCenterId || null,
      equipmentId: selectedWorkOrder.equipmentId || null,
      employeeId: selectedWorkOrder.employeeId || null,
    };

    // ✅ 필수값 검증
    if (!payload.processId || !payload.blockId || !payload.workCenterId) {
      alert("공정, 블록, 작업장은 필수 선택 항목입니다.");
      return;
    }

    try {
      if (selectedWorkOrder._isNew || selectedWorkOrder.workOrderId.startsWith("temp-")) {
        // 신규 → POST
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("신규 작업지시 등록 완료!");
      } else {
        // 기존 → PUT
        await axios.put(`${API_URL}/${selectedWorkOrder.workOrderId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("작업지시 수정 완료!");
      }

      await fetchWorkOrders();
      setEditingRowId(null);
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
    if (!selectedWorkOrder.workOrderId || selectedWorkOrder._isNew) {
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

  // 최초 로딩 시 불러오기
  useEffect(() => {
    fetchWorkOrders();
    fetchComboData();
  }, []);

  useEffect(() => {
  console.log("현재 workOrders:", workOrders);
  if (workOrders.length > 0) {
    console.log("첫 번째 행:", workOrders[0]);
  }
}, [workOrders]);


  // ================= 컬럼 정의 =================
  const columns = [
    { header: "블록 생산계획 ID", accessor: "blockPlanId", editable: true },
    {
      header: "블록 ID",
      accessor: "blockId",
      editable: true,
      editor: "select",
      options: blockList.map((b) => ({ value: b.blockId, label: `${b.blockId} (${b.blockNm})` })),
    },
    {
      header: "공정 ID",
      accessor: "processId",
      editable: true,
      editor: "select",
      options: processList.map((p) => ({ value: p.processId, label: `${p.processId} (${p.processNm})` })),
    },
    {
      header: "작업장",
      accessor: "workCenterId",
      editable: true,
      editor: "select",
      // 선택된 공정(processId)에 따라 필터링
      getOptions: (row) =>
        workCenterList
          .filter((w) => w.processId === row.processId)
          .map((w) => ({ value: w.workCenterId, label: w.workCenterId })),
    },
    {
      header: "설비",
      accessor: "equipmentId",
      editable: true,
      editor: "select",
      getOptions: (row) => {
        console.log("equipment getOptions 실행 - row:", row);
        return equipmentList
          .filter((e) => e.workCenterId === row.workCenterId)
          .map((e) => ({
            value: e.equipmentId,
            label: `${e.equipmentId} (${e.equipmentNm})`,
          }));
      },
    },
    {
      header: "담당자",
      accessor: "employeeId",
      editable: true,
      editor: "select",
      options: employeeList.map((emp) => ({ value: emp.employeeId, label: emp.employeeNm })),
    },
    {
      header: "우선순위",
      accessor: "priority",
      editable: true,
      editor: "select",
      options: [1, 2, 3, 4, 5].map((n) => ({ value: n, label: n.toString() })), // ✅ object 통일
    },
    {
      header: "상태",
      accessor: "currentStatus",
      editable: true,
      editor: "select",
      options: [
        { value: "waiting", label: "waiting" },
        { value: "in-progress", label: "progress" },
        { value: "completed", label: "completed" },
      ],
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
            console.log("셀 업데이트:", field, value);
            setWorkOrders((prev) =>
              prev.map((wo, i) => {
                if (i !== rowIndex) return wo;

                const updated = { ...wo, [field]: value };

                // ✅ 공정 선택 시 → 해당 공정의 첫 작업장 자동 세팅
                if (field === "processId") {
                  const availableWCs = workCenterList.filter((w) => w.processId === value);
                  updated.workCenterId = availableWCs.length > 0 ? availableWCs[0].workCenterId : null;
                  updated.equipmentId = ""; // 설비 초기화
                }

                // ✅ 작업장 선택 변경 시 → 설비 초기화
                if (field === "workCenterId") {
                  updated.equipmentId = "";
                }

                return updated;
              })
            );
          }}
          readOnly={false}
          editingRowId={editingRowId}
          onRowDoubleClick={handleRowDoubleClick}
          getRowClassName={(row) => {
            if (selectedWorkOrder?.workOrderId === row.workOrderId) {
              return "bg-blue-100"; // 선택된 행
            }
            if (row.priority == 1) {
              return "bg-rose-100"; // 우선순위 1
            }
            if (!row.workCenterId || !row.equipmentId || !row.employeeId) {
              return "bg-yellow-50"; // 누락 표시
            }
            return "";
          }}
        />
      </div>
    </div>
  );
}
