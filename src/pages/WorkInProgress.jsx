import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import { useNavigate } from "react-router-dom";
import WorkResult from "./WorkResult"; 
import TableGrid from "../layouts/TableGrid";

const WORK_ORDER_API_URL = "http://localhost:8082/api/workOrders";
const WORK_RESULT_API_URL = "http://localhost:8082/api/work-results";

// 날짜 포맷 (화면 표시용)
const formatDateTime = (dateTime) =>
  dateTime ? dateTime.replace("T", " ").substring(0, 16) : "";

// 총 작업시간 계산 함수 (분 단위)
const calculateTotalTime = (start, end) => {
  if (!start) return null;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  return Math.floor((endDate - startDate) / 60000);
};

export default function WorkInProgress() {
  const [viewMode, setViewMode] = useState("WORKER");
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStartHovered, setIsStartHovered] = useState(false);
  const [isEndHovered, setIsEndHovered] = useState(false);

  const { setIconHandlers } = useIconContext();
  const navigate = useNavigate();

  // --- 데이터 조회 ---
  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(WORK_ORDER_API_URL);
      const filtered = response.data.filter((order) => {
        if (order.currentStatus === "completed") return false;
        if (order.standardTime && order.startTime) {
          const totalMinutes = calculateTotalTime(order.startTime, order.endTime);
          if (totalMinutes && totalMinutes >= order.standardTime) return false;
        }
        if (order.createdAt) {
          const created = new Date(order.createdAt);
          const diffHours = (new Date() - created) / (1000 * 60 * 60);
          if (diffHours >= 24) return false;
        }
        return true;
      });

      setWorkOrders(filtered);
      filtered.length > 0 ? handleSelectOrder(filtered[0]) : setSelectedOrder(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrCreateWorkResult = useCallback(async (order) => {
    if (!order) {
      setCurrentResult(null);
      return;
    }
    try {
      const response = await axios.get(
        `${WORK_RESULT_API_URL}?workOrderId=${order.workOrderId}&status=in_progress`
      );
      if (response.data.length > 0) {
        setCurrentResult(response.data[0]);
      } else {
        setCurrentResult({
          workOrderId: order.workOrderId,
          employeeId: localStorage.getItem("employeeId") || "UNKNOWN",
          workCenterId: order.workCenterId,
          equipmentId: order.equipmentId,
          completedQuantity: 0,
          defectiveQuantity: 0,
          startTime: null,
          endTime: null,
          status: "in_progress",
          remark: "",
        });
      }
    } catch (err) {
      console.error("작업 실적 조회 실패:", err);
    }
  }, []);

  // --- 이벤트 ---
  const handleSelectOrder = useCallback(
    (order) => {
      setSelectedOrder(order);
      fetchOrCreateWorkResult(order);
    },
    [fetchOrCreateWorkResult]
  );

  const handleResultChange = (e) => {
    const { name, value } = e.target;
    const parsed = parseInt(value, 10);
    setCurrentResult((prev) => ({
      ...prev,
      [name]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  };

  const handleTimeUpdate = async (timeField) => {
    if (!currentResult) return;
    const now = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
    const updatedResult = { ...currentResult, [timeField]: now };

    try {
      const response = updatedResult.resultId
        ? await axios.put(`${WORK_RESULT_API_URL}/${updatedResult.resultId}`, updatedResult)
        : await axios.post(WORK_RESULT_API_URL, updatedResult);
      setCurrentResult(response.data);
      alert(`${timeField === "startTime" ? "작업 시작" : "작업 종료"} 시간이 등록되었습니다.`);
    } catch {
      alert("시간 등록 중 오류 발생");
    }
  };

  const handleSaveResult = async () => {
    if (!currentResult) return;
    if ((currentResult.completedQuantity ?? 0) <= 0 && (currentResult.defectiveQuantity ?? 0) <= 0) {
      alert("합격품 또는 불량품 수량 중 하나 이상은 입력해야 합니다.");
      return;
    }
    try {
      const response = currentResult.resultId
        ? await axios.put(`${WORK_RESULT_API_URL}/${currentResult.resultId}`, currentResult)
        : await axios.post(WORK_RESULT_API_URL, currentResult);
      setCurrentResult(response.data);
      alert("실적이 저장되었습니다.");
    } catch {
      alert("실적 저장 중 오류 발생");
    }
  };

  const goToDetailPage = () => {
    selectedOrder
      ? navigate(`/main/work-results-detail/${selectedOrder.workOrderId}`)
      : alert("작업을 먼저 선택하세요.");
  };

  const handleViewChange = (mode) => {
    if (mode === "ADMIN" && localStorage.getItem("role") === "WORKER") {
      alert("권한이 없습니다.");
      return;
    }
    setViewMode(mode);
  };

  // --- 사이드 이펙트 ---
  useEffect(() => {
    if (viewMode === "WORKER") fetchWorkOrders();
  }, [viewMode, fetchWorkOrders]);

  useEffect(() => {
    setIconHandlers({ onSearch: fetchWorkOrders });
    return () => setIconHandlers({ onSearch: null });
  }, [fetchWorkOrders, setIconHandlers]);

  // --- 컬럼 정의 ---
  const columns = [
    { header: "지시 ID", accessor: "workOrderId" },
    { header: "지시 내용", accessor: "instruction" },
    { header: "상태", accessor: "currentStatus" },
    { header: "작업장", accessor: "workCenterId" },
    { header: "설비", accessor: "equipmentId" },
    { header: "표준시간(분)", accessor: "standardTime" },
  ];

  // --- 렌더링 ---
  if (loading && viewMode === "WORKER") return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p>에러가 발생했습니다: {error.message}</p>;

  return (
    <div style={{ padding: "20px", height: "90vh", display: "flex", flexDirection: "column" }}>
      {/* 토글 스위치 */}
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "300px",
          height: "40px",
          backgroundColor: "#e9ecef",
          borderRadius: "20px",
          padding: "4px",
          userSelect: "none",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            width: "calc(50% - 4px)",
            height: "calc(100% - 8px)",
            backgroundColor: "#007bff",
            borderRadius: "16px",
            transition: "transform 0.3s ease-in-out",
            transform: viewMode === "ADMIN" ? "translateX(100%)" : "translateX(0%)",
          }}
        />
        <div
          onClick={() => handleViewChange("WORKER")}
          style={{
            flex: 1,
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: viewMode === "WORKER" ? "white" : "black",
            fontWeight: "bold",
          }}
        >
          실적 등록(작업자)
        </div>
        <div
          onClick={() => handleViewChange("ADMIN")}
          style={{
            flex: 1,
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: viewMode === "ADMIN" ? "white" : "black",
            fontWeight: "bold",
          }}
        >
          지시 관리(관리자)
        </div>
      </div>

      {viewMode === "WORKER" ? (
        <div style={{ display: "flex", gap: "20px", flex: 1, overflow: "hidden" }}>
          {/* 작업 리스트 */}
          <div style={{ flex: 2, border: "1px solid #ccc", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: 0, padding: "10px", backgroundColor: "#f2f2f2" }}>작업 리스트</h3>
            <div style={{ overflow: "auto", flex: 1 }}>
              <TableGrid
                columns={columns}
                data={workOrders}
                rowKey="workOrderId"
                selectedRow={selectedOrder}
                onRowSelect={handleSelectOrder}
                readOnly={true}
                getRowClassName={(row) =>
                  row.currentStatus === "completed"
                    ? "bg-red-200"
                    : row.currentStatus === "in_progress"
                    ? "bg-blue-100"
                    : ""
                }
              />
            </div>
          </div>

          {/* 실적 등록 */}
          <div style={{ flex: 1, border: "1px solid #ccc", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3>{selectedOrder ? `${selectedOrder.instruction}` : "작업 선택"}</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={goToDetailPage}>상세 내역</button>
                <button onClick={handleSaveResult}>실적등록</button>
              </div>
            </div>

            {currentResult ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <button
                  onClick={() => handleTimeUpdate("startTime")}
                  disabled={currentResult.startTime}
                  onMouseEnter={() => setIsStartHovered(true)}
                  onMouseLeave={() => setIsStartHovered(false)}
                  style={{
                    height: "50px",
                    backgroundColor: isStartHovered ? "blue" : "#f0f0f0",
                    color: isStartHovered ? "white" : "black",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  시작
                </button>
                <button
                  onClick={() => handleTimeUpdate("endTime")}
                  disabled={!currentResult.startTime || currentResult.endTime}
                  onMouseEnter={() => setIsEndHovered(true)}
                  onMouseLeave={() => setIsEndHovered(false)}
                  style={{
                    height: "50px",
                    backgroundColor: isEndHovered ? "red" : "#f0f0f0",
                    color: isEndHovered ? "white" : "black",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  종료
                </button>
                <span>
                  <b>시작시간:</b> {formatDateTime(currentResult.startTime)}
                </span>
                <span>
                  <b>종료시간:</b> {formatDateTime(currentResult.endTime)}
                </span>
                <span style={{ gridColumn: "1 / -1" }}>
                  <b>총 작업시간:</b>{" "}
                  {calculateTotalTime(currentResult.startTime, currentResult.endTime)
                    ? calculateTotalTime(currentResult.startTime, currentResult.endTime) + "분"
                    : "-"}
                </span>
                <label>
                  합격품:
                  <input
                    type="number"
                    name="completedQuantity"
                    value={currentResult.completedQuantity}
                    onChange={handleResultChange}
                    style={{ padding: "8px", width: "100%" }}
                  />
                </label>
                <label>
                  불량품:
                  <input
                    type="number"
                    name="defectiveQuantity"
                    value={currentResult.defectiveQuantity}
                    onChange={handleResultChange}
                    style={{ padding: "8px", width: "100%" }}
                  />
                </label>
                <textarea
                  name="remark"
                  value={currentResult.remark || ""}
                  onChange={(e) =>
                    setCurrentResult((prev) => ({ ...prev, remark: e.target.value }))
                  }
                  placeholder="상세 내용 및 비고"
                  rows="4"
                  style={{ gridColumn: "1 / -1", padding: "8px", width: "100%", border: "1px solid black" }}
                ></textarea>
              </div>
            ) : (
              selectedOrder && <p>실적 정보를 불러오는 중...</p>
            )}
          </div>
        </div>
      ) : (
        <WorkResult />
      )}
    </div>
  );
}
