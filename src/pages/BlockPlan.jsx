import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";
import ProjectPlanInquiry from "../inquiry/ProjectPlanInquiry";

const API_URL = "http://localhost:8082/api/blockPlans";
const ProjectPlan_API_URL = "http://localhost:8083/api/proxy/project_plans";

export default function BlockPlan() {
    // Tailwind 클래스
    const blockDetailLabel = "block mb-1 text-sm font-semibold";
    const detailTextBox = "w-full px-2 py-1 border border-gray-300";

     // --- 블록계획 상태 ---
    const [blockPlans, setBlockPlans] = useState([]);
    const [selectedBlockPlan, setSelectedBlockPlan] = useState(null);

    // --- 생산계획 상태 ---
    const [projectPlans, setProjectPlans] = useState([]);
    const [selectedProjectPlan, setSelectedProjectPlan] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [errorProjects, setErrorProjects] = useState(null);

    // --- 콤보박스 상태 ---
    const [processList, setProcessList] = useState([]);
    const [blockList, setBlockList] = useState([]);

    // 검색 조건 초기값
    const initialSearchParams = {
        blockId: "",
        processId: "",
        vesselId: "",
        startDate: "",
        endDate: "",
        status: "",
    };

    const [searchParams, setSearchParams] = useState(initialSearchParams);

    const { setIconHandlers } = useIconContext();

    
  // TableGrid 컬럼
  const columns = [
    { header: "블록 계획 ID", accessor: "blockPlanId" },
    { header: "블록명", accessor: "blockNm" },
    { header: "공정명", accessor: "processNm" },
    { 
        header: "상태", 
        accessor: "status", 
        cell: (row) => {
        let style = "px-2 py-1 rounded text-xs font-medium ";
        if (row.status === 0) {
            style += "bg-gray-100 text-gray-600 text-center";   // 대기 → 연한 회색
            return <span className={style}>대기</span>;
        }
        if (row.status === 1) {
            style += "bg-slate-200 text-blue-700";   // 진행 → 연한 파랑
            return <span className={style}>진행</span>;
        }
        if (row.status === 2) {
            style += "bg-green-100 text-green-700"; // 완료 → 연한 초록
            return <span className={style}>완료</span>;
        }
        return "";
        }
    }
  ];

  // --- 생산계획 조회 ---
  const fetchProjectPlans = async () => {
    setLoadingProjects(true);
    setErrorProjects(null);

    try {
      const response = await axios.get(ProjectPlan_API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 필요 시 getToken()
        },
      });
      const data = response.data || [];
        setProjectPlans(data);

        // 첫 번째 생산계획 자동 선택
        if (data.length > 0) {setSelectedProjectPlan(data[0]);}
    } catch (err) {
      setErrorProjects(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // --- 블록계획 조회 ---
  const fetchBlockPlans = async (planId = null) => {
    console.log("👉 fetchBlockPlans 호출됨, planId =", planId);
    if (!planId) return;
    try {
      const response = await axios.get(`${API_URL}/search`,{params: { planId },});

      setBlockPlans(response.data);
      setSelectedBlockPlan(response.data.length > 0 ? response.data[0] : null);
    } catch (err) {
      console.error("데이터 불러오기 실패:", err);
      setBlockPlans([]);
      setSelectedBlockPlan(null);
    }
  };

    // --- 공정/블록 콤보박스 조회 ---
    const fetchComboData = async () => {
    try {
        const token = localStorage.getItem("token");
        const [procRes, blockRes] = await Promise.all([
        axios.get(`${API_URL}/processes`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/blocks`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        ]);
        setProcessList(procRes.data);
        setBlockList(blockRes.data);
    } catch (err) {
        console.error("콤보박스 데이터 불러오기 실패:", err);
    }
    };


  // --- 최초 로드 시 생산계획 불러오기 ---
  useEffect(() => {
    fetchProjectPlans();
     fetchComboData();
  }, []);

  // --- 생산계획 선택 시 블록계획 조회 ---
  useEffect(() => {
    if (selectedProjectPlan) {
      fetchBlockPlans(selectedProjectPlan.planId);
    }
  }, [selectedProjectPlan]);


    // 아이콘 핸들러 등록
    useEffect(() => {
        setIconHandlers({
            onSearch: handleSearch,
            onNew: handleAddRow,
            onSave: handleSave,
            onDelete: handleDelete
        });
        return () => {
            setIconHandlers({ 
                onSearch: null,
                onNew: null,
                onSave: null,
                onDelete: null 
            });
        };
    }, [searchParams, blockPlans, selectedBlockPlan]); // 검색 조건 바뀔 때마다 최신 핸들러 등록 

    // 신규
    const handleAddRow = () => {
        const today = new Date().toISOString().split("T")[0];
        const newRow = {
            blockPlanId: null,
            planId: selectedProjectPlan?.planId || "",
            processId: "",
            blockId: "",
            planQty: 0,
            status: 0,
            startDate: today,
            endDate: today,
            remark: "",
        }
        setBlockPlans((prev) => [...prev, newRow]);
        setSelectedBlockPlan(newRow);
    }

    // 검색 실행
    const handleSearch = async () => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: { ...searchParams, planId: selectedProjectPlan?.planId },
            });
            setBlockPlans(response.data);
            setSelectedBlockPlan(response.data.length > 0 ? response.data[0] : null);
        } catch (err) {
            console.error("검색 실패:", err);
        }
    };

    // 검색 조건 초기화
    const handleReset = () => {
        setSearchParams(initialSearchParams);
        if (selectedProjectPlan) {
            fetchBlockPlans(selectedProjectPlan.planId); //  현재 선택된 계획 기준
        } else {
            setBlockPlans([]);
            setSelectedBlockPlan(null);
        }
    };

    // 검색 조건 변경 핸들러
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [name]: value }));
    };

    // 선택된 블록 변경
    const handleSelectBlockPlan = (blockPlan) => {
        setSelectedBlockPlan(blockPlan);
    };

    // =저장 
    const handleSave = async () => {
        if (!selectedBlockPlan) {
            alert("저장할 블록 계획이 없습니다.");
            return;
        }

        // 필수값 체크 (startDate, endDate는 DB에서 NOT NULL)
        if (!selectedBlockPlan.startDate || !selectedBlockPlan.endDate) {
            alert("시작일과 종료일을 입력하세요.");
            return;
        }
        try {
            // if (!selectedBlockPlan.blockPlanId) {
            // // 신규 등록
            // await axios.post(API_URL, selectedBlockPlan, {
            //     headers: { "Content-Type": "application/json" }
            // });
            // alert("등록 완료");
            // } else {
            // // 수정
            // await axios.put(`${API_URL}/${selectedBlockPlan.blockPlanId}`, selectedBlockPlan);
            // alert("수정 완료");
            // }
            if (!selectedBlockPlan.blockPlanId) {
            // 신규 등록
            console.log("신규 등록 요청:", selectedBlockPlan);
            await axios.post(API_URL, selectedBlockPlan);
            alert("등록 완료");
        } else {
            // 수정
            await axios.put(`${API_URL}/${selectedBlockPlan.blockPlanId}`, selectedBlockPlan);
            alert("수정 완료");
        }
            await fetchBlockPlans(selectedProjectPlan?.planId);  // 목록 새로고침
        } catch (err) {
            console.error("저장 실패:", err);
            alert("저장 실패: " + (err.response?.data?.message || err.message));
        }
    };

    // 삭제 
    const handleDelete = async () => {
        if (!selectedBlockPlan || !selectedBlockPlan.blockPlanId) {
            alert("삭제할 블록 계획을 선택하세요.");
            return;
        }
        if (!window.confirm(`정말 삭제하시겠습니까? (ID: ${selectedBlockPlan.blockPlanId})`)
            ) return;

        try {
            await axios.delete(`${API_URL}/${selectedBlockPlan.blockPlanId}`);
            alert("삭제 완료!");
            await fetchBlockPlans();
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제 실패: " + (err.response?.data?.message || err.message));
        }
    };


    // 필드 수정
    const isFieldEditable = () => true;
    const updateBlockPlanField = (field, value) => {
        // 선택된 블록만 업데이트
        setSelectedBlockPlan((prev) => {
            if (!prev) return prev;

            const updated = { ...prev, [field]: value };

            // 왼쪽 그리드(blockPlans)도 함께 업데이트
            setBlockPlans((prevPlans) =>
                prevPlans.map((plan) =>
                    plan.blockPlanId === prev.blockPlanId ? updated : plan
                )
            );

            return updated;
        });
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
            {/* ==================== 상단: 검색 그리드 ==================== */}
            <div className="border border-gray-300 px-3 py-5 mb-5">
                <div className="flex flex-wrap gap-7">
                    {/* 1행 */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="blockId" className="text-sm font-medium">블록명:</label>
                        <input
                            type="text"
                            id="blockId"
                            name="blockId"
                            value={searchParams.blockId}
                            onChange={handleSearchChange}
                            className="border border-gray-400 px-2 py-1 text-sm w-32"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="processId" className="text-sm font-medium">공정명:</label>
                        <input
                            type="text"
                            id="processId"
                            name="processId"
                            value={searchParams.processId}
                            onChange={handleSearchChange}
                            className="border border-gray-400 px-2 py-1 text-sm w-32"
                        />
                    </div>

                    {/* <div className="flex items-center gap-2">
                        <label htmlFor="vesselId" className="text-sm font-medium">선박명:</label>
                        <input
                            type="text"
                            id="vesselId"
                            name="vesselId"
                            value={searchParams.vesselId}
                            onChange={handleSearchChange}
                            className="border border-gray-400 px-2 py-1 text-sm w-32"
                        />
                    </div> */}

                    {/* 2행 + 초기화 버튼 */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium">시작일:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={searchParams.startDate}
                            onChange={handleSearchChange}
                            className="border border-gray-400 px-2 py-1 text-sm w-32"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium">종료일:</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={searchParams.endDate}
                            onChange={handleSearchChange}
                            className="border border-gray-400 px-2 py-1 text-sm w-32"
                        />
                    </div>

                    {/* 상태  */}
                    <div className="flex items-end justify-between md:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="status" className="text-sm font-medium">상태:</label>
                            <select
                                id="status"
                                name="status"
                                value={searchParams.status}
                                onChange={handleSearchChange}
                                className="border border-gray-400 px-2 py-1 text-sm bg-white w-24"
                            >
                                <option value="">전체</option>
                                <option value="0">대기</option>
                                <option value="1">진행중</option>
                                <option value="2">완료</option>
                            </select>
                        </div>
                    </div>

                    {/* 우측 끝: 초기화 버튼 */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="ml-auto mr-3 px-3 py-1 border border-gray-400 bg-slate-500 hover:bg-slate-600 text-sm text-white"
                    >
                        초기화
                    </button>
                </div>
            </div>

            {/* ==================== 중간: 생산계획 ==================== */}
            <h2 className="text-base font-semibold mb-2">생산계획 조회</h2>
            <div className="mb-5 p-1 overflow-auto min-h-[200px]">
                
                {loadingProjects && <div className="p-4">프로젝트 계획 불러오는 중...</div>}
                {errorProjects && (
                <div className="p-4 text-red-500">에러: {errorProjects.message}</div>
                )}
                <TableGrid
                columns={[
                    { header: "계획 ID", accessor: "planId" },
                    { header: "프로젝트 ID", accessor: "projectId" },
                    { header: "선박 ID", accessor: "vesselId" },
                    { header: "계획 범위", accessor: "planScope" },
                    { header: "시작일", accessor: "startDate" },
                    { header: "종료일", accessor: "endDate" },
                    {
                    header: "진행률",
                    accessor: "progressRate",
                    cell: (row) => `${row.progressRate}%`,
                    },
                    {
                    header: "상태",
                    accessor: "status",
                    cell: (row) =>
                        row.status === 0
                        ? "계획"
                        : row.status === 1
                        ? "진행"
                        : "완료",
                    },
                ]}
                data={projectPlans}
                rowKey="planId"
                selectedRow={selectedProjectPlan}
                onRowSelect={setSelectedProjectPlan}
                readOnly={true}
                />
            </div>

            {/* ==================== 하단 그리드 ==================== */}
            <h2 className="text-base font-semibold mb-2">블록 생산계획 목록</h2>
            <div className="flex gap-6 flex-[2]">
                {/* 하단-좌측 */}
                <div className="flex-[5] overflow-auto border border-gray-300">
                
                <TableGrid
                    columns={columns}
                    data={blockPlans}
                    rowKey="blockPlanId"  
                    selectedRow={selectedBlockPlan}
                    onRowSelect={setSelectedBlockPlan}
                    readOnly={true} 
                />
                </div>

                {/* 우측: 블록 상세 정보 */}
                <div className="flex-[4] border border-gray-300 p-4">
                    <h3 className="text-base font-semibold mb-4">블록 계획 상세</h3>

                    <div className="grid grid-cols-3 gap-6">
                        {/* 생산계획 ID */}
                        <div>
                            <label className={blockDetailLabel}>프로젝트 계획 ID</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.planId || ""}
                                className={`${detailTextBox} bg-gray-200`}
                                readOnly={true}
                            />
                        </div>
                        
                        {/* 블록 계획 ID */}
                        <div>
                            <label className={blockDetailLabel}>블록 계획 ID</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.blockPlanId || ""}
                                onChange={(e) => updateBlockPlanField("blockPlanId", e.target.value)}
                                /*className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}*/
                                className={`${detailTextBox} bg-gray-200`}
                                readOnly={true}
                            />
                        </div>

                        {/* 공정 ID */}
                        <div>
                        <label className={blockDetailLabel}>공정</label>
                        <select
                            value={selectedBlockPlan?.processId || ""}
                            onChange={(e) => updateBlockPlanField("processId", e.target.value)}
                            className={detailTextBox}
                        >
                            <option value="">선택</option>
                            {processList.map((p) => (
                            <option key={p.processId} value={p.processId}>
                                {p.processId} ({p.processNm})
                            </option>
                            ))}
                        </select>
                        </div>

                        {/* 블록 ID */}
                        <div className="col-span-2">
                        <label className={blockDetailLabel}>블록 ID</label>
                        <select
                            value={selectedBlockPlan?.blockId || ""}
                            onChange={(e) => updateBlockPlanField("blockId", e.target.value)}
                            className={detailTextBox}
                        >
                            <option value="">선택</option>
                            {blockList.map((b) => (
                            <option key={b.blockId} value={b.blockId}>
                                {b.blockId} ({b.blockNm})
                            </option>
                            ))}
                        </select>
                        </div>

                        {/* 계획 수량 */}
                        <div>
                            <label className={blockDetailLabel}>계획 수량</label>
                            <input
                                type="number"
                                value={selectedBlockPlan?.planQty || ""}
                                onChange={(e) => updateBlockPlanField("planQty", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div>

                        {/* 상태 */}
                        <select
                            value={selectedBlockPlan?.status ?? ""}
                            onChange={(e) => updateBlockPlanField("status", Number(e.target.value))}
                            className={detailTextBox}
                        >
                            <option value="">선택</option>
                            <option value={0}>대기</option>
                            <option value={1}>진행</option>
                            <option value={2}>완료</option>
                        </select> <br />

                        {/* 시작일 */}
                        <div className="col-span-2">
                            <label className={blockDetailLabel}>시작일</label>
                            <input
                                type="date"
                                value={selectedBlockPlan?.startDate || ""}
                                onChange={(e) => updateBlockPlanField("startDate", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div>

                        {/* 종료일 */}
                        <div className="col-span-2">
                            <label className={blockDetailLabel}>종료일</label>
                            <input
                                type="date"
                                value={selectedBlockPlan?.endDate || ""}
                                onChange={(e) => updateBlockPlanField("endDate", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div>

                        {/* 비고 */}
                        <div className="col-span-3">
                            <label className={blockDetailLabel}>비고</label>
                            <textarea
                                type="text"
                                value={selectedBlockPlan?.remark || ""}
                                onChange={(e) => updateBlockPlanField("remark", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
}