import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";

const API_URL = "http://localhost:8082/api/blockPlans";

export default function BlockPlan() {
    //목록 저장
    const [blockPlans, setBlockPlans] = useState([]);

    const [selectedBlockPlan, setSelectedBlockPlan] = useState(null);

    // Tailwind 클래스
    const blockDetailLabel = "block mb-1 text-sm font-semibold";
    const detailTextBox = "w-full px-2 py-1 border border-gray-300";

    const isFieldEditable = () => true; // 또는 조건
    const updateBlockPlanField = (field, value) => {
    setSelectedBlockPlan(prev => ({ ...prev, [field]: value }));
    };
    

    // 데이터 조회
    const fetchBlockPlans = async () => {
        try {
            const response = await axios.get(API_URL);
            setBlockPlans(response.data);
            if (response.data.length > 0) {
                setSelectedBlockPlan(response.data[0]); // 첫 번째 항목 선택
            }
        } catch (err) {
            console.error("데이터 불러오기 실패:", err);
            setBlockPlans([]); // 실패 시 빈 배열로 초기화
            setSelectedBlockPlan(null); // 실패 시 선택도 초기화
        }
    };

    // 페이지가 처음 로드될 때 전체 목록을 조회합니다.
    useEffect(() => {
        fetchBlockPlans();
    }, []);

    // 선택함수
    const handleSelectBlockPlan = (blockPlan) => {
        setSelectedBlockPlan(blockPlan);
    };

    
    

    return(
        <div>
            {/* ==================== 상단: 검색 그리드 ==================== */}
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                    <label htmlFor="processId">공정 ID: </label>
                    <input
                    type="text"
                    id="processId"
                    name="processId"
                    value={searchParams.processId}
                    onChange={handleSearchChange}

                    style={{ border: '1px solid black' }}


                    />
                </div>
                <div>
                    <label htmlFor="processNm">공정명: </label>
                    <input
                    type="text"
                    id="processNm"
                    name="processNm"
                    value={searchParams.processNm}
                    onChange={handleSearchChange}

                    style={{ border: '1px solid black' }} 
                    />
                </div>
                <div>
                <label htmlFor="isActive">활성 여부: </label>
                <select
                    id="isActive"
                    name="isActive"
                    value={searchParams.isActive === null ? '' : searchParams.isActive} // null일 경우 빈 문자열('') 값으로 매핑
                    onChange={handleSearchChange}
                    style={{ border: '1px solid black', marginLeft: '5px' }}
                >
                    <option value="">전체</option>
                    <option value="true">활성</option>
                    <option value="false">비활성</option>
                </select>
                </div>
                </div> */}
            </div>

            {/* ==================== 하단 그리드 ==================== */}
            <div className="flex gap-6">

                {/* 하단-좌측 */}
                <div className="flex-1 overflow-auto border border-gray-300">

                    <table border="1" style={{ width: '100%', bsorderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '8px' }}>블록 생산 ID</th>
                            <th style={{ padding: '8px' }}>블록명</th>
                            <th style={{ padding: '8px' }}>공정명</th>
                            <th style={{ padding: '8px' }}>선박명</th>
                        </tr>
                        </thead>
                        <tbody>
                            {blockPlans.map((blockPlan) => (
                                <tr
                                key={blockPlan.blockPlanId}
                                onClick={() => handleSelectBlockPlan(blockPlan)} // ✅ 선택 함수 호출
                                className={`cursor-pointer hover:bg-gray-100 ${
                                    selectedBlockPlan?.blockPlanId === blockPlan.blockPlanId ? 'bg-blue-100' : ''
                                }`}
                                >
                                <td className="p-2">{blockPlan.blockPlanId}</td>
                                <td className="p-2">{blockPlan.blockId}</td>
                                <td className="p-2">{blockPlan.processId}</td>
                                <td className="p-2">{blockPlan.vesselId}</td>
                                </tr>
                            ))}
                            </tbody>
                    </table>
                </div>
                
                {/* 우측: 블록 상세 정보 */}
                <div className="w-96 border border-gray-300 rounded p-4 overflow-auto">
                <h3 className="text-lg font-semibold mb-4">블록 계획 상세</h3>

                <div className="grid grid-cols-3 gap-6">
                    {/* 블록 계획 ID */}
                    <div>
                    <label className={blockDetailLabel}>계획 ID</label>
                    <input
                        type="text"
                        value={selectedBlockPlan?.blockPlanId || ""}
                        onChange={(e) => updateBlockPlanField("blockPlanId", e.target.value)}
                        className={`${detailTextBox} ${!isFieldEditable() ? "bg-gray-100" : "bg-white"}`}
                        readOnly
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
                    </div> <br/>

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