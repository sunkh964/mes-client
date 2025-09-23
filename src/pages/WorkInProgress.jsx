import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useIconContext } from "../utils/IconContext";
import { useNavigate } from 'react-router-dom';
import WorkResult from './WorkResult'; // 관리자용 뷰 import
import TableGrid from "../layouts/TableGrid";

const WORK_ORDER_API_URL = "http://localhost:8082/api/workOrders";
const WORK_RESULT_API_URL = "http://localhost:8082/api/work-results";

// 날짜 포맷팅 함수
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

export default function WorkInProgress() {
  // --- 2. 상태(State) 정의 ---
  const [viewMode, setViewMode] = useState('WORKER'); // 화면 모드 (WORKER/ADMIN)
  const [workOrders, setWorkOrders] = useState([]); // 왼쪽 작업지시 목록
  const [selectedOrder, setSelectedOrder] = useState(null); // 선택된 작업지시
  const [currentResult, setCurrentResult] = useState(null); // 현재 작업 실적 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [isStartHovered, setIsStartHovered] = useState(false); // '시작' 버튼 호버 상태
  const [isEndHovered, setIsEndHovered] = useState(false); // '종료' 버튼 호버 상태
  
  const { setIconHandlers } = useIconContext(); // 상단 아이콘 연동
  const navigate = useNavigate(); // 페이지 이동

  // --- 3. 데이터 조회 로직 ---
  // 작업지시 목록 조회 함수
  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(WORK_ORDER_API_URL);
      setWorkOrders(response.data);
      if (response.data.length > 0) {
        // 목록 조회 후 첫 번째 항목을 자동으로 선택
        handleSelectOrder(response.data[0]);
      } else {
        setSelectedOrder(null);
        setCurrentResult(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 작업지시의 실적을 조회하거나, 없으면 새로 생성하는 함수
  const fetchOrCreateWorkResult = useCallback(async (order) => {
    if (!order) {
      setCurrentResult(null);
      return;
    }
    try {
      const response = await axios.get(`${WORK_RESULT_API_URL}?workOrderId=${order.workOrderId}&status=in_progress`);
      if (response.data.length > 0) {
        setCurrentResult(response.data[0]); // 진행 중인 실적이 있으면 가져옴
      } else {
        // 없으면 새로 입력받을 기본 폼 생성
        setCurrentResult({
          workOrderId: order.workOrderId,
          employeeId: localStorage.getItem('employeeId') || 'UNKNOWN',
          workCenterId: order.workCenterId,
          equipmentId: order.equipmentId,
          completedQuantity: 0, defectiveQuantity: 0,
          startTime: null, endTime: null, status: 'in_progress',
        });
      }
    } catch (err) {
      console.error("작업 실적 조회 실패:", err);
    }
  }, []);

  // --- 4. 이벤트 핸들러 ---
  // 사용자의 액션(클릭, 입력 등)을 처리하는 함수들

  // 왼쪽 작업지시 목록에서 항목을 선택했을 때
  const handleSelectOrder = useCallback((order) => {
    setSelectedOrder(order);
    fetchOrCreateWorkResult(order);
  }, [fetchOrCreateWorkResult]);

  // 실적 입력 폼(합격품, 불량품)의 값이 변경될 때
  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setCurrentResult(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  // 시작 또는 종료 시간을 등록/수정할 때
  const handleTimeUpdate = async (timeField) => {
    if (!currentResult) return;
    const now = new Date().toISOString();
    const updatedResult = { ...currentResult, [timeField]: now };
    try {
      const response = await axios.post(WORK_RESULT_API_URL, updatedResult);
      setCurrentResult(response.data);
      alert(`${timeField === 'startTime' ? '작업 시작' : '작업 종료'} 시간이 등록되었습니다.`);
    } catch (err) {
      alert("시간 등록 중 오류 발생");
    }
  };

  // '상세 내역' 버튼 클릭 시
  const goToDetailPage = () => {
    if (selectedOrder) {
      navigate(`/main/work-results-detail/${selectedOrder.workOrderId}`);
    } else {
      alert("작업을 먼저 선택하세요.");
    }
  };

  // 토글 스위치 클릭 시
  const handleViewChange = (mode) => {
    if (mode === 'ADMIN') {
      const userRole = localStorage.getItem('role');
      if (userRole === 'WORKER') {
        alert('권한이 없습니다.');
        return;
      }
    }
    setViewMode(mode);
  };

  // --- 5. 사이드 이펙트 (Side Effects) ---
  // 렌더링 후 부가적인 작업을 수행 (데이터 fetching, 아이콘 버튼 연동 등)
  
  useEffect(() => {
    if (viewMode === 'WORKER') {
      fetchWorkOrders();
    }
  }, [viewMode, fetchWorkOrders]);
  
  useEffect(() => {
    setIconHandlers({ onSearch: fetchWorkOrders });
    return () => setIconHandlers({ onSearch: null });
  }, [fetchWorkOrders, setIconHandlers]);

  // ================= 컬럼 정의 =================
  const columns = [
    { header: "No.", accessor: "no", render: (_, idx) => idx + 1 },
    { header: "지시 ID", accessor: "workOrderId" },
    { header: "지시 내용", accessor: "instruction" },
    { header: "상태", accessor: "currentStatus" },
    { header: "작업장", accessor: "workCenterId" },
  ];

  // --- 6. 렌더링 ---
  // 계산된 상태값들을 바탕으로 실제 화면(UI)을 그립니다.

  if (loading && viewMode === 'WORKER') return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p>에러가 발생했습니다: {error.message}</p>;

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', display: 'flex', width: '300px', height: '40px', backgroundColor: '#e9ecef', borderRadius: '20px', padding: '4px', userSelect: 'none', marginBottom: '15px' }}>
        <div style={{ position: 'absolute', top: '4px', left: '4px', width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', backgroundColor: '#007bff', borderRadius: '16px', transition: 'transform 0.3s ease-in-out', transform: viewMode === 'ADMIN' ? 'translateX(100%)' : 'translateX(0%)' }}></div>
        <div onClick={() => handleViewChange('WORKER')} style={{ flex: 1, zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: viewMode === 'WORKER' ? 'white' : 'black', fontWeight: 'bold' }}>
          실적 등록(작업자)
        </div>
        <div onClick={() => handleViewChange('ADMIN')} style={{ flex: 1, zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: viewMode === 'ADMIN' ? 'white' : 'black', fontWeight: 'bold' }}>
          지시 관리(관리자)
        </div>
      </div>

      {viewMode === 'WORKER' ? (
        <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
          {loading ? <p>로딩 중...</p> : error ? <p>에러 발생</p> : (
            <>
              <div style={{ flex: 2, border: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0, padding: '10px', backgroundColor: '#f2f2f2' }}>작업 리스트</h3>
                <div style={{ overflow: 'auto', flex: 1 }}>
                  {/* TableGrid */}
                  <TableGrid
                    columns={columns}
                    data={workOrders}
                    rowKey="workOrderId"
                    selectedRow={selectedOrder}
                    onRowSelect={handleSelectOrder}
                    readOnly={true} // 편집 불필요
                    getRowClassName={(row) =>
                      selectedOrder?.workOrderId === row.workOrderId ? "bg-blue-100" : ""
                    }
                  />
                </div>
              </div>
              <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>{selectedOrder ? `${selectedOrder.instruction}` : "작업 선택"}</h3>
                  <button onClick={goToDetailPage}>상세 내역</button>
                </div>
                {currentResult ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => handleTimeUpdate('startTime')} disabled={currentResult.startTime} onMouseEnter={() => setIsStartHovered(true)} onMouseLeave={() => setIsStartHovered(false)} style={{ height: '50px', backgroundColor: isStartHovered ? 'blue' : '#f0f0f0', color: isStartHovered ? 'white' : 'black', border: '1px solid #ccc', cursor: 'pointer' }}>시작</button>
                    <button onClick={() => handleTimeUpdate('endTime')} disabled={!currentResult.startTime || currentResult.endTime} onMouseEnter={() => setIsEndHovered(true)} onMouseLeave={() => setIsEndHovered(false)} style={{ height: '50px', backgroundColor: isEndHovered ? 'red' : '#f0f0f0', color: isEndHovered ? 'white' : 'black', border: '1px solid #ccc', cursor: 'pointer' }}>종료</button>
                    <span><b>시작시간:</b> {formatDateTime(currentResult.startTime)}</span>
                    <span><b>종료시간:</b> {formatDateTime(currentResult.endTime)}</span>
                    <label>합격품:<input type="number" name="completedQuantity" value={currentResult.completedQuantity} onChange={handleResultChange} style={{ padding: '8px', width: '100%' }} /></label>
                    <label>불량품:<input type="number" name="defectiveQuantity" value={currentResult.defectiveQuantity} onChange={handleResultChange} style={{ padding: '8px', width: '100%' }} /></label>
                    <textarea 
                        name="remark"
                        value={currentResult.remark || ''}
                        onChange={(e) => setCurrentResult(prev => ({...prev, remark: e.target.value}))}
                        placeholder="상세 내용 및 비고" 
                        rows="4" 
                        style={{ 
                            gridColumn: '1 / -1', 
                            padding: '8px', 
                            width: '100%',
                            border: '1px solid black'
                        }}
                    ></textarea>
                  </div>
                ) : selectedOrder && <p>실적 정보를 불러오는 중...</p>}
              </div>
            </>
          )}
        </div>
      ) : (
        <WorkResult />
      )}
    </div>
  );
}