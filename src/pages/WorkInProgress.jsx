import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useIconContext } from "../utils/IconContext";
import { useNavigate } from 'react-router-dom';
import WorkResult from './WorkResult'; // 관리자용 뷰 import

const WORK_ORDER_API_URL = "http://localhost:8082/api/workOrders";
const WORK_RESULT_API_URL = "http://localhost:8082/api/work-results";

const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

export default function WorkInProgress() {
  const [viewMode, setViewMode] = useState('WORKER');
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStartHovered, setIsStartHovered] = useState(false);
  const [isEndHovered, setIsEndHovered] = useState(false);
  
  const { setIconHandlers } = useIconContext();
  const navigate = useNavigate();

  // --- 함수 정의 (useCallback으로 안정화) ---
  const fetchOrCreateWorkResult = useCallback(async (order) => {
    if (!order) {
      setCurrentResult(null);
      return;
    }
    try {
      const response = await axios.get(`${WORK_RESULT_API_URL}?workOrderId=${order.workOrderId}&status=in_progress`);
      if (response.data.length > 0) {
        setCurrentResult(response.data[0]);
      } else {
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

  const handleSelectOrder = useCallback((order) => {
    setSelectedOrder(order);
    fetchOrCreateWorkResult(order);
  }, [fetchOrCreateWorkResult]);

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(WORK_ORDER_API_URL);
      setWorkOrders(response.data);
      if (response.data.length > 0) {
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
  }, [handleSelectOrder]);

  // --- useEffect Hooks ---
  useEffect(() => {
    if (viewMode === 'WORKER') {
      fetchWorkOrders();
    }
  }, [viewMode, fetchWorkOrders]);
  
  useEffect(() => {
    setIconHandlers({ onSearch: fetchWorkOrders });
    return () => setIconHandlers({ onSearch: null });
  }, [fetchWorkOrders, setIconHandlers]);

  // --- 이벤트 핸들러 ---
  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setCurrentResult(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

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

  const goToDetailPage = () => {
    if (selectedOrder) {
      navigate(`/main/work-results-detail/${selectedOrder.workOrderId}`);
    } else {
      alert("작업을 먼저 선택하세요.");
    }
  };

  const handleViewChange = (mode) => {
    if (mode === 'ADMIN') {
      const userRole = localStorage.getItem('role');
      if (userRole === 'WORKER') { // 권한 이름은 실제 사용하는 값으로 맞춰주세요
        alert('권한이 없습니다.');
        return;
      }
    }
    setViewMode(mode);
  };

  // --- 렌더링 ---
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
                  <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f2f2f2' }}>
                      <tr><th>지시 ID</th><th>지시 내용</th><th>상태</th><th>작업장</th></tr>
                    </thead>
                    <tbody>
                      {workOrders.map(order => (
                        <tr key={order.workOrderId} onClick={() => handleSelectOrder(order)} style={{ cursor: 'pointer', backgroundColor: selectedOrder?.workOrderId === order.workOrderId ? '#e3f2fd' : 'transparent' }}>
                          <td>{order.workOrderId}</td><td>{order.instruction}</td><td>{order.currentStatus}</td><td>{order.workCenterId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    <textarea name="remark" value={currentResult.remark || ''} onChange={(e) => setCurrentResult(prev => ({...prev, remark: e.target.value}))} placeholder="상세 내용 및 비고" rows="4" style={{ gridColumn: '1 / -1', padding: '8px', width: '100%' }}></textarea>
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