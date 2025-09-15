import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8082/api/workOrders";

export default function WorkOrder() {
  // 작업지시 목록 저장
  const [workOrders, setWorkOrders] = useState([]);
  // 선택된 작업지시 (상세 조회용)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // 데이터 조회 함수
  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(API_URL);
      setWorkOrders(response.data);
      if (response.data.length > 0) {
        setSelectedWorkOrder(response.data[0]);
      } else {
        setSelectedWorkOrder(null);
      }
    } catch (error) {
      console.error("작업지시 데이터 조회 실패:", error);
      setWorkOrders([]);
      setSelectedWorkOrder(null);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // 행 선택 처리
  const handleSelectWorkOrder = (workOrder) => {
    setSelectedWorkOrder(workOrder);
  };

  return (
    <div style={{ padding: 20 }}>
        {/* ==================== 상단: 검색 그리드 ==================== */}
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                
            </div>

      <h2 style={{ marginBottom: 16 }}>작업지시 목록</h2>

      {/* 작업지시 목록 테이블 */}
      <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", marginBottom: 20 }}>
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              {/* 테이블 헤더 : workOrders가 비어있으면 헤더도 없으니 기본 컬럼명 적었습니다 */}
              <th style={{ padding: 8 }}>작업지시 ID</th>
              <th style={{ padding: 8 }}>공정 ID</th>
              <th style={{ padding: 8 }}>공정계획 ID</th>
              <th style={{ padding: 8 }}>우선순위</th>
              <th style={{ padding: 8 }}>담당자</th>
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
              workOrders.map((wo) => (
                <tr
                  key={wo.workOrderId}
                  onClick={() => handleSelectWorkOrder(wo)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedWorkOrder?.workOrderId === wo.workOrderId ? "#cce5ff" : "white",
                  }}
                >
                  <td style={{ padding: 8 }}>{wo.workOrderId}</td>
                  <td style={{ padding: 8 }}>{wo.processId}</td>
                  <td style={{ padding: 8 }}>{wo.blockPlanId}</td>
                  <td style={{ padding: 8 }}>{wo.priority}</td>
                  <td style={{ padding: 8 }}>{wo.employeeId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 조회 */}
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 4, maxHeight: 400, overflowX: "auto" }}>
        <h3 style={{ marginBottom: 12 }}>상세조회</h3>

        {selectedWorkOrder ? (
            <table border="1" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead style={{ backgroundColor: "#f2f2f2" }}>
                <tr>
                <th style={{ padding: 8 }}>작업지시 ID</th>
                <th style={{ padding: 8 }}>공정 ID</th>
                <th style={{ padding: 8 }}>블록 계획 ID</th>
                <th style={{ padding: 8 }}>블록 ID</th>
                <th style={{ padding: 8 }}>작업장 ID</th>
                <th style={{ padding: 8 }}>설비 ID</th>
                <th style={{ padding: 8 }}>작업자 ID</th>
                <th style={{ padding: 8 }}>지시사항</th>
                <th style={{ padding: 8 }}>생산 예정 수량</th>
                <th style={{ padding: 8 }}>생산 완료 수량</th>
                <th style={{ padding: 8 }}>계획 시작일</th>
                <th style={{ padding: 8 }}>계획 종료일</th>
                <th style={{ padding: 8 }}>실제 시작일</th>
                <th style={{ padding: 8 }}>실제 종료일</th>
                <th style={{ padding: 8 }}>현재 상태</th>
                <th style={{ padding: 8 }}>우선순위</th>
                <th style={{ padding: 8 }}>비고</th>
                <th style={{ padding: 8 }}>생성일시</th>
                <th style={{ padding: 8 }}>수정일시</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td style={{ padding: 8 }}>{selectedWorkOrder.workOrderId}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.process?.processId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.blockPlan?.blockPlanId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.block?.blockId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.workCenter?.workCenterId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.equipment?.equipmentId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.employee?.employeeId || "-"}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.instruction}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.quantityToProduce}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.quantityProduced}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.plannedStartTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.plannedEndTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.actualStartTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.actualEndTime}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.currentStatus}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.priority}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.remark}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.createdAt}</td>
                <td style={{ padding: 8 }}>{selectedWorkOrder.updatedAt}</td>
                </tr>
            </tbody>
            </table>
        ) : (
            <div>조회된 작업지시가 없습니다.</div>
        )}
        </div>

    </div>
  );
}
