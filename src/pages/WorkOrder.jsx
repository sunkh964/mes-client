import { useEffect, useState} from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/workOrders";

export default function WorkOrder() {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  // 콤보박스 데이터 상태
  const [blockPlanList, setBlockPlanList] = useState([]);
  const [processList, setProcessList] = useState([]);
  const [blockList, setBlockList] = useState([]);
  const [workCenterList, setWorkCenterList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  const [isComboLoading, setIsComboLoading] = useState(true);

  // 정렬 상태
  const [selectedBlockPlanId, setSelectedBlockPlanId] = useState("");
  const [selectedProcessId, setSelectedProcessId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");

  // 블록생산계획 / 공정 / 블록 기준 필터링
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchBlockPlan =
      !selectedBlockPlanId ||
      String(wo.blockPlanId) === String(selectedBlockPlanId);
    const matchProcess =
      !selectedProcessId ||
      String(wo.processId) === String(selectedProcessId);
    const matchBlock =
      !selectedBlockId || String(wo.blockId) === String(selectedBlockId);

    return matchBlockPlan && matchProcess && matchBlock;
  });

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
    setIsComboLoading(true);
    try {
      const token = localStorage.getItem("token");

      const headers = { Authorization: `Bearer ${token}` };
      const [
        blockPlanRes,procRes, blockRes, wcRes, eqRes, empRes
        ] = await Promise.all([
        axios.get("http://localhost:8082/api/workOrders/blockPlans", { headers }),
        axios.get("http://localhost:8082/api/workOrders/processes", { headers }),
        axios.get("http://localhost:8082/api/workOrders/blocks", { headers }),
        axios.get("http://localhost:8082/api/workOrders/workCenters", { headers }),
        axios.get("http://localhost:8082/api/workOrders/equipments", { headers }),
        axios.get("http://localhost:8082/api/workOrders/employees", { headers }),
      ]);
      console.log("✅ blockPlanList 응답:", blockPlanRes.data);

      setBlockPlanList(blockPlanRes.data);
      setProcessList(procRes.data);
      setBlockList(blockRes.data);
      setWorkCenterList(wcRes.data);
      setEquipmentList(eqRes.data);
      setEmployeeList(empRes.data);

    } catch (err) {
      console.error("콤보박스 데이터 불러오기 실패:", err);
    } finally {
    
      setIsComboLoading(false);
    
    }
  };

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

    // 블록생산계획 목록 중 첫 번째 항목을 기본값으로 설정
    const defaultBlockPlan = blockPlanList.length > 0 ? blockPlanList[0] : null;
    const defaultProcessId = defaultBlockPlan?.processId || "";
    const defaultBlockId = defaultBlockPlan?.blockId || "";

    const defaultWorkCenter = workCenterList.find(
      (wc) => wc.processId === defaultProcessId
    ) || null;

    const defaultEquipment = equipmentList.find(
      (eq) => eq.workCenterId === defaultWorkCenter?.workCenterId
    ) || null;

    // 신규행 생성
    const newRow = {
      workOrderId: `TEMP-${Date.now()}`,
      blockPlanId: defaultBlockPlan ? defaultBlockPlan.blockPlanId : "",
      blockId: defaultBlockId,
      processId: defaultProcessId,
      workCenterId: defaultWorkCenter ? defaultWorkCenter.workCenterId : null,
      equipmentId: defaultEquipment ? defaultEquipment.equipmentId : null,
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

    setWorkOrders((prev) => {
      const updated = [...prev, newRow];
      // 테이블 업데이트 직후 자동 세팅 로직 반영
      setTimeout(() => {
        const newIndex = updated.length - 1;
        handleCellUpdate(newIndex, "blockPlanId", newRow.blockPlanId);
      }, 0);
      return updated;
    });
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

    // "" → null 변환
    const payload = {
      ...selectedWorkOrder,
      processId: selectedWorkOrder.processId || null,
      blockPlanId: selectedWorkOrder.blockPlanId || null,
      blockId: selectedWorkOrder.blockId || null,
      workCenterId: selectedWorkOrder.workCenterId || null,
      equipmentId: selectedWorkOrder.equipmentId || null,
      employeeId: selectedWorkOrder.employeeId || null,
    };

    // 필수값 검증
    if (!payload.processId || !payload.blockId || !payload.workCenterId) {
      alert("공정, 블록, 작업장은 필수 선택 항목입니다.");
      return;
    }

  try {
      const token = localStorage.getItem("token");
      if (selectedWorkOrder._isNew) {
        const { workOrderId, _isNew, ...payloadForServer } = payload;
        await axios.post(API_URL, payloadForServer, { headers: { Authorization: `Bearer ${token}` } });
      alert("신규 작업지시 등록 완료!");
      } else {
        await axios.put(`${API_URL}/${selectedWorkOrder.workOrderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
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
    
    setSelectedBlockPlanId("");
    setSelectedProcessId("");
    setSelectedBlockId("");
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
    const fetchAllData = async () => {
        // 콤보 데이터를 먼저 불러오고, 로딩이 끝나면 작업지시 목록을 불러옵니다.
        await fetchComboData();
        await fetchWorkOrders();
    };
    fetchAllData();
  }, []);


  // ================= 컬럼 정의 =================
  const columns = [
    {
      header: "블록생산계획 ID",
      accessor: "blockPlanId",
      editable: true,
      editor: "select",
      options: blockPlanList.map((bp) => ({
        value: bp.blockPlanId,
        label: `${bp.blockPlanId} (${bp.blockNm})`,
      })),
    },
    {
      header: "블록 ID",
      accessor: "blockId",
      editable: false, // 읽기 전용
    },
    {
      header: "공정 ID",
      accessor: "processId",
      editable: false, // 읽기 전용
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
      options: employeeList.map((emp) => ({ value: emp.employeeId, label: `${emp.employeeNm} (${emp.employeeId})`})),
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

    // ================= onCellUpdate =================
  const handleCellUpdate = (rowIndex, field, value) => {
    console.log("🧩 handleCellUpdate 호출됨:", { rowIndex, field, value, type: typeof field });
    setWorkOrders((prev) =>
      prev.map((wo, i) => {
        if (i !== rowIndex) return wo;

        const updated = { ...wo, [field]: value };

        // 1 블록생산계획 선택 시 자동 세팅
        if (field === "blockPlanId") {
          const selected = blockPlanList.find(
            (bp) => String(bp.blockPlanId) === String(value)
          );

          if (selected) {
            updated.blockId = selected.blockId;
            updated.processId = selected.processId;

            // 공정 관련 작업장, 설비도 다시 세팅
            const availableWCs = workCenterList.filter(
              (w) => w.processId === selected.processId
            );
            updated.workCenterId =
              availableWCs.length > 0 ? availableWCs[0].workCenterId : null;

            const availableEqs = equipmentList.filter(
              (e) => e.workCenterId === updated.workCenterId
            );
            updated.equipmentId =
              availableEqs.length > 0 ? availableEqs[0].equipmentId : null;

            console.log(" 블록생산계획 변경 → 공정/작업장/설비 자동 세팅:", updated);
          } else {
            console.warn("⚠️ blockPlanList에서 매칭되는 항목을 찾지 못했습니다. value:", value);
          }
        }

        // 2 공정 선택 시 자동 작업장 세팅
        if (field === "processId") {
          const availableWCs = workCenterList.filter((w) => w.processId === value);
          updated.workCenterId =
            availableWCs.length > 0 ? availableWCs[0].workCenterId : null;

          const availableEqs = equipmentList.filter(
            (e) => e.workCenterId === updated.workCenterId
          );
          updated.equipmentId =
            availableEqs.length > 0 ? availableEqs[0].equipmentId : null;
        }

        // 3 작업장 변경 시 설비 초기화
        if (field === "workCenterId") {
          const availableEqs = equipmentList.filter(
            (e) => e.workCenterId === value
          );
          updated.equipmentId =
            availableEqs.length > 0 ? availableEqs[0].equipmentId : null;
        }

        return updated;
      })
    );
  };

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

      {/* 블록생산계획 / 공정 / 블록 필터 */}
      <div className="flex items-center gap-4 mb-3">
        {/* 블록생산계획 */}
        <div className="flex items-center gap-2">
          <label htmlFor="blockPlanFilter" className="text-sm font-medium">
            블록생산계획:
          </label>
          <select
            id="blockPlanFilter"
            value={selectedBlockPlanId}
            onChange={(e) => setSelectedBlockPlanId(e.target.value)}
            className="border border-gray-400 px-2 py-1 text-sm rounded"
          >
            <option value="">전체</option>
            {blockPlanList
              .slice() // 원본 배열 훼손 방지용
              .sort((a, b) => Number(a.blockPlanId) - Number(b.blockPlanId))
              .map((bp) => (
                <option key={bp.blockPlanId} value={bp.blockPlanId}>
                  {bp.blockPlanId}
                </option>
              ))}
          </select>
        </div>

        {/* 공정 필터 */}
        <div className="flex items-center gap-2">
          <label htmlFor="processFilter" className="text-sm font-medium">
            공정:
          </label>
          <select
            id="processFilter"
            value={selectedProcessId}
            onChange={(e) => setSelectedProcessId(e.target.value)}
            className="border border-gray-400 px-2 py-1 text-sm rounded"
          >
            <option value="">전체</option>
            {processList.map((proc) => (
              <option key={proc.processId} value={proc.processId}>
                {proc.processId} ({proc.processNm})
              </option>
            ))}
          </select>
        </div>

        {/* 블록 필터 */}
        <div className="flex items-center gap-2">
          <label htmlFor="blockFilter" className="text-sm font-medium">
            블록:
          </label>
          <select
            id="blockFilter"
            value={selectedBlockId}
            onChange={(e) => setSelectedBlockId(e.target.value)}
            className="border border-gray-400 px-2 py-1 text-sm rounded"
          >
            <option value="">전체</option>
            {blockList.map((blk) => (
              <option key={blk.blockId} value={blk.blockId}>
                {blk.blockId} ({blk.blockNm})
              </option>
            ))}
          </select>
        </div>

        
      </div>

      <div className="overflow-y-auto h-[500px] border border-gray-300">
        <TableGrid
          columns={columns}
          data={filteredWorkOrders} 
          rowKey="workOrderId"
          selectedRow={selectedWorkOrder}
          onRowSelect={setSelectedWorkOrder}
          onCellUpdate={(rowIndex, field, value) => {
            console.log("* onCellUpdate 실행됨:", { rowIndex, field, value });
            handleCellUpdate(rowIndex, field, value);
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
