import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const API_BASE_URL = "http://localhost:8082/api/dashboard";

// 네온 카드 컴포넌트
const NeonCard = ({ title, children, borderColor }) => (
  <div
    className={`bg-gray-900 rounded-xl p-4 flex flex-col items-center justify-center border-2 ${borderColor}
    shadow-[0_0_15px_rgba(34,211,238,0.8)] h-full w-full`}
  >
    <h3 className="text-sm font-semibold text-cyan-300 mb-2 tracking-wider uppercase">{title}</h3>
    <div className="flex-1 w-full flex items-center justify-center">{children}</div>
  </div>
);

export default function Dashboard() {
  // ✅ 대시보드 상태
  const [summary, setSummary] = useState({
    projectCount: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    avgProgressRate: 0,
    inProgressWorkOrders: 0,
    completedWorkOrders: 0,
    workCenterProductions: [],
    equipmentStatusCounts: {},
  });
  const [loading, setLoading] = useState(true);

  // ✅ API 호출 (ERP 요약 데이터 가져오기)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // ✅ 토큰 변수 먼저 선언
        const token = localStorage.getItem("erpToken") || "";

        // ✅ 백엔드 호출
        const res = await axios.get(`${API_BASE_URL}/project`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSummary(prev => ({
          ...prev,
          projectCount: res.data.projectCount ?? 0,
          inProgressProjects: res.data.inProgressProjects ?? 0,
          completedProjects: res.data.completedProjects ?? 0,
          avgProgressRate: res.data.avgProgressRate ?? 0,
        }));
        console.log(summary);
        console.log(summary.inProgressProjects);
        console.log(summary.completedProjects);
      } catch (err) {
        console.error("프로젝트 요약 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p className="text-white">📡 데이터 불러오는 중...</p>;

  // ✅ 설비 상태 데이터 변환
  const equipmentData = Object.entries(summary.equipmentStatusCounts || {}).map(
    ([name, value]) => ({ name, value })
  );

  const COLORS = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };

  return (
    <div className="h-screen w-screen bg-black">
      <h1 className="text-2xl font-bold text-center text-cyan-400 mb-4 drop-shadow-[0_0_10px_#22d3ee]">
        MES 공정 운영 대시보드
      </h1>

      {/* 3x3 그리드 */}
      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-[90%]">

        {/* 1. 총 프로젝트 수 */}
        <NeonCard title="총 프로젝트" borderColor="border-cyan-400">
          <div className="flex flex-col items-center">
            <p className="text-4xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_#22d3ee]">
              {summary.projectCount}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              진행 중 {summary.inProgressProjects} / 완료 {summary.completedProjects}
            </p>
            <p className="text-xs text-gray-500">
              평균 진척률 {summary.avgProgressRate}%
            </p>
          </div>
        </NeonCard>

        {/* 2. 진행 중 작업지시 */}
        <NeonCard title="진행 중" borderColor="border-yellow-400">
          <p className="text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_10px_#facc15]">
            {summary.inProgressWorkOrders}
          </p>
        </NeonCard>

        {/* 3. 완료 작업지시 */}
        <NeonCard title="완료" borderColor="border-green-400">
          <p className="text-4xl font-extrabold text-green-300 drop-shadow-[0_0_10px_#22c55e]">
            {summary.completedWorkOrders}
          </p>
        </NeonCard>

        {/* 4. 작업장별 생산 현황 */}
        <NeonCard title="작업장별 생산 현황" borderColor="border-cyan-400">
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={summary.workCenterProductions}>
              <XAxis dataKey="workCenterName" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip wrapperStyle={{ backgroundColor: "#1F2937", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="totalPlanned" fill={COLORS.yellow} name="계획량" />
              <Bar dataKey="totalProduced" fill={COLORS.green} name="생산량" />
            </BarChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* 5. 설비 상태 */}
        <NeonCard title="설비 상태" borderColor="border-rose-400">
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={equipmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {equipmentData.map((entry, index) => {
                  const color =
                    entry.name === "정상" ? COLORS.green :
                      entry.name === "대기" ? COLORS.yellow :
                        COLORS.red;
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip wrapperStyle={{ backgroundColor: "#1F2937", borderRadius: "8px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* 6. AI 예측 (더미 값) */}
        <NeonCard title="AI 예측" borderColor="border-cyan-400">
          <p className="text-center text-sm text-gray-200">
            🚨 용접 공정 <span className="text-red-400 font-bold">지연 32%</span><br />
            📦 자재 <span className="text-yellow-400 font-bold">부족 예상</span>
          </p>
        </NeonCard>

        {/* 7~9 추가 지표 */}
        <NeonCard title="추가 지표" borderColor="border-green-400">
          <p className="text-gray-400 text-sm">내용 준비 중...</p>
        </NeonCard>
        <NeonCard title="추가 지표" borderColor="border-yellow-400">
          <p className="text-gray-400 text-sm">내용 준비 중...</p>
        </NeonCard>
        <NeonCard title="추가 지표" borderColor="border-rose-400">
          <p className="text-gray-400 text-sm">내용 준비 중...</p>
        </NeonCard>

      </div>
    </div>
  );
}
