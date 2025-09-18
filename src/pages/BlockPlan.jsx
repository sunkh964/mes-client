import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/blockPlans";

export default function BlockPlan() {
    // Tailwind 클래스
    const blockDetailLabel = "block mb-1 text-sm font-semibold";
    const detailTextBox = "w-full px-2 py-1 border border-gray-300";
    const searchInput = "border border-gray-400 px-2 py-1 text-sm";

    //목록 저장
    const [blockPlans, setBlockPlans] = useState([]);

    const [selectedBlockPlan, setSelectedBlockPlan] = useState(null);

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

    // 페이지가 처음 로드될 때 전체 목록을 조회합니다.
    useEffect(() => {
        fetchBlockPlans();
    }, []);

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
    }, [searchParams, blockPlans, selectedBlockPlan]); // 검색 조건 바뀔 때마다 최신 핸들러 등록 예림
    //yelim

    const handleAddRow = () => {
        const today = new Date().toISOString().split("T")[0];
        const newRow = {
            blockPlanId: null,
            blockId: "",
            processId: "",
            vesselId: "",
            planQty: 0,
            status: 0, // 대기
            startDate: today,
            endDate: today,
            remark: "",
        }
        setBlockPlans((prev) => [...prev, newRow]);
        setSelectedBlockPlan(newRow);
    }


    // 전체 데이터 조회
    const fetchBlockPlans = async () => {
        try {
            const response = await axios.get(`${API_URL}/getAll`);
            setBlockPlans(response.data);
            if (response.data.length > 0) {
                setSelectedBlockPlan(response.data[0]); // 첫 번째 항목 선택
            }
        } catch (err) {
            console.error("데이터 불러오기 실패:", err);
            setBlockPlans([]);
            setSelectedBlockPlan(null);
        }
    };

    // 검색 실행
    const handleSearch = async () => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: searchParams,
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
        fetchBlockPlans();
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
            console.log("보낼 데이터:", selectedBlockPlan);
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
            await fetchBlockPlans(); // 목록 새로고침
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
        if (!window.confirm(`정말 삭제하시겠습니까? (ID: ${selectedBlockPlan.blockPlanId})`)) return;

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

                    <div className="flex items-center gap-2">
                        <label htmlFor="vesselId" className="text-sm font-medium">선박명:</label>
                        <input
                            type="text"
                            id="vesselId"
                            name="vesselId"
                            value={searchParams.vesselId}
                            onChange={handleSearchChange}
                            className="border border-gray-400 px-2 py-1 text-sm w-32"
                        />
                    </div>

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



            {/* ==================== 하단 그리드 ==================== */}
            <div className="flex gap-6">

                {/* 하단-좌측 */}
                <div className="flex-[6] overflow-auto border border-gray-300">

                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '8px', width: '20%' }}>No.</th>
                                <th style={{ padding: '8px', width: '20%' }}>블록 생산 ID</th>
                                <th style={{ padding: '8px', width: '20%' }}>블록명</th>
                                <th style={{ padding: '8px', width: '20%' }}>공정명</th>
                                <th style={{ padding: '8px', width: '20%' }}>선박명</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blockPlans.map((blockPlan, index) => (
                                <tr
                                    key={blockPlan.blockPlanId ?? `new-${index}`}
                                    onClick={() => handleSelectBlockPlan(blockPlan)} // 선택 함수 호출
                                    className={`cursor-pointer hover:bg-gray-100 ${selectedBlockPlan?.blockPlanId === blockPlan.blockPlanId ? 'bg-blue-100' : ''
                                        }`}
                                >
                                    <td className="p-2 h-[40px]">{index + 1}</td>
                                    <td className="p-2 h-[40px]">{blockPlan.blockPlanId}</td>
                                    <td className="p-2 h-[40px]">{blockPlan.blockId}</td>
                                    <td className="p-2 h-[40px]">{blockPlan.processId}</td>
                                    <td className="p-2 h-[40px]">{blockPlan.vesselId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 우측: 블록 상세 정보 */}
                <div className="flex-[4] border border-gray-300 rounded p-4 overflow-auto">
                    <h3 className="text-lg font-semibold mb-4">블록 계획 상세</h3>

                    <div className="grid grid-cols-3 gap-6">
                        {/* 블록 계획 ID */}
                        <div>
                            <label className={blockDetailLabel}>계획 ID</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.blockPlanId || ""}
                                onChange={(e) => updateBlockPlanField("blockPlanId", e.target.value)}
                                /*className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}*/
                                className={`${detailTextBox} bg-gray-200`}
                                readOnly={true}
                            />
                        </div>

                        {/* 선박 ID */}
                        <div>
                            <label className={blockDetailLabel}>선박 ID</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.vesselId || ""}
                                onChange={(e) => updateBlockPlanField("vesselId", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div>

                        {/* 공정 ID */}
                        <div>
                            <label className={blockDetailLabel}>공정 ID</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.processId || ""}
                                onChange={(e) => updateBlockPlanField("processId", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div>

                        {/* 블록 ID */}
                        <div className="col-span-2">
                            <label className={blockDetailLabel}>블록 ID</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.blockId || ""}
                                onChange={(e) => updateBlockPlanField("blockId", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
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
                        <div className="col-span-1">
                            <label className={blockDetailLabel}>상태</label>
                            <input
                                type="text"
                                value={selectedBlockPlan?.status || ""}
                                onChange={(e) => updateBlockPlanField("status", e.target.value)}
                                className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                                readOnly={!isFieldEditable()}
                            />
                        </div> <br />

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