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
  const safeNum = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 0;
    return Number(value);
  };
  // 대시보드 상태
  const [summary, setSummary] = useState({
    projectCount: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    avgProgressRate: 0,
    inProgressWorkOrders: 0,
    completedWorkOrders: 0,
    workCenterProductions: [],
    equipmentStatusCounts: {},
    qualityBlock: { total: 0, passed: 0, failed: 0, passRate: 0 },
    qualityMaterial: { total: 0, passed: 0, failed: 0, passRate: 0 },
  });
  const [loading, setLoading] = useState(true);

  // API 호출 (ERP 요약 데이터 가져오기)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // 토큰 변수 먼저 선언
        const token = localStorage.getItem("erpToken") || "";

        // 프로젝트 요약
        const projectRes = await axios.get(`${API_BASE_URL}/project`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // 고객사 요약
        const customerRes = await axios.get(`${API_BASE_URL}/customers`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // 자재 요약
        const materialRes = await axios.get(`${API_BASE_URL}/materials`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // 구매 요약
        const purchaseRes = await axios.get(`${API_BASE_URL}/purchases`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        //생산계획
        const planRes = await axios.get(`${API_BASE_URL}/production_plans`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        //품질
        const qualityRes = await axios.get(`${API_BASE_URL}/quality`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        //출하 
        const shipmentRes = await axios.get(`${API_BASE_URL}/shipments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        //인사
        const employeeRes = await axios.get(`${API_BASE_URL}/employees`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setSummary(prev => ({
          ...prev,
          projectCount: projectRes.data.projectCount ?? 0,
          inProgressProjects: projectRes.data.inProgressProjects ?? 0,
          completedProjects: projectRes.data.completedProjects ?? 0,
          avgProgressRate: projectRes.data.avgProgressRate ?? 0,

          //고객사
          totalCustomers: customerRes.data.totalCustomers ?? 0,
          contractCount: customerRes.data.contractCount ?? 0,
          activeCount: customerRes.data.activeCount ?? 0,

          // 자재
          totalMaterials: materialRes.data.totalMaterials ?? 0,
          activeMaterials: materialRes.data.activeMaterials ?? 0,
          categoryStats: materialRes.data.categoryStats ?? {},

          //구매
          totalOrders: purchaseRes.data.totalOrders ?? 0,
          inProgressOrders: purchaseRes.data.inProgressOrders ?? 0,
          completedOrders: purchaseRes.data.completedOrders ?? 0,
          supplierStats: purchaseRes.data.supplierStats ?? {},

          //생산계획
          totalPlans: planRes.data.totalPlans ?? 0,
          inProgressPlans: planRes.data.inProgressPlans ?? 0,
          completedPlans: planRes.data.completedPlans ?? 0,
          avgPlanProgressRate: planRes.data.avgProgressRate ?? 0,

          //품질 
          qualityBlock: qualityRes.data.block ?? { total: 0, passed: 0, failed: 0, passRate: 0 },
          qualityMaterial: qualityRes.data.material ?? { total: 0, passed: 0, failed: 0, passRate: 0 },

          // 출하 현황
          //activeRate: parseFloat((safeNum(summary.activeRate) * easeOut).toFixed(2)),
          totalShipments: shipmentRes.data.totalShipments ?? 0,
          completedShipments: shipmentRes.data.completed ?? 0,
          inProgressShipments: shipmentRes.data.inProgress ?? 0,
          delayedShipments: shipmentRes.data.delayed ?? 0,

          // 인사 현황
          totalEmployees: employeeRes.data.totalEmployees ?? 0,
          activeEmployees: employeeRes.data.activeEmployees ?? 0,
          inactiveEmployees: employeeRes.data.inactiveEmployees ?? 0,
          activeRate: employeeRes.data.activeRate ?? 0,
          departments: employeeRes.data.departments ?? {},

        }));
        console.log("프로젝트 평균 진척률:", projectRes.data.avgProgressRate);
        console.log("인사 재직률:", employeeRes.data.activeRate);

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

  // 애니메이션용 상태
  const [animated, setAnimated] = useState({
    projectCount: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    avgProgressRate: 0,
  });

  // 숫자 & 원형 게이지 애니메이션
  useEffect(() => {
    const duration = 1200;
    const frameRate = 1000 / 60;
    const steps = Math.ceil(duration / frameRate);
    const safeNum = (value) => {
      if (value === null || value === undefined || isNaN(value)) return 0;
      return Number(value);
    };

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / steps, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);


      setAnimated({
        projectCount: Math.floor(summary.projectCount * easeOut),
        inProgressProjects: Math.floor(summary.inProgressProjects * easeOut),
        completedProjects: Math.floor(summary.completedProjects * easeOut),
        avgProgressRate: parseFloat((summary.avgProgressRate * easeOut).toFixed(2)),
        totalCustomers: Math.floor(summary.totalCustomers * easeOut),
        contractCount: Math.floor(summary.contractCount * easeOut),
        activeCount: Math.floor(summary.activeCount * easeOut),
        totalMaterials: Math.floor(summary.totalMaterials * easeOut),
        activeMaterials: Math.floor(summary.activeMaterials * easeOut),
        totalOrders: Math.floor(summary.totalOrders * easeOut),
        inProgressOrders: Math.floor(summary.inProgressOrders * easeOut),
        completedOrders: Math.floor(summary.completedOrders * easeOut),
        categoryStats: summary.categoryStats,
        supplierStats: summary.supplierStats,
        equipmentStatusCounts: summary.equipmentStatusCounts,

        totalPlans: Math.floor(safeNum(summary.totalPlans) * easeOut),
        inProgressPlans: Math.floor(safeNum(summary.inProgressPlans) * easeOut),
        completedPlans: Math.floor(safeNum(summary.completedPlans) * easeOut),
        avgPlanProgressRate: parseFloat((safeNum(summary.avgPlanProgressRate) * easeOut).toFixed(2)),

        qualityBlock: {
          ...summary.qualityBlock,
          passRate: parseFloat((safeNum(summary.qualityBlock.passRate) * easeOut).toFixed(2)),
        },
        qualityMaterial: {
          ...summary.qualityMaterial,
          passRate: parseFloat((safeNum(summary.qualityMaterial.passRate) * easeOut).toFixed(2)),
        },

        totalShipments: Math.floor(safeNum(summary.totalShipments) * easeOut),
        completedShipments: Math.floor(safeNum(summary.completedShipments) * easeOut),
        inProgressShipments: Math.floor(safeNum(summary.inProgressShipments) * easeOut),
        delayedShipments: Math.floor(safeNum(summary.delayedShipments) * easeOut),

        totalEmployees: Math.floor(safeNum(summary.totalEmployees) * easeOut),
        activeEmployees: Math.floor(safeNum(summary.activeEmployees) * easeOut),
        inactiveEmployees: Math.floor(safeNum(summary.inactiveEmployees) * easeOut),
        onLeaveEmployees: Math.floor(safeNum(summary.onLeaveEmployees) * easeOut),
        activeRate: parseFloat((safeNum(summary.activeRate) * easeOut).toFixed(2)),

      });
      if (progress === 1) clearInterval(interval);
    }, frameRate);

    return () => clearInterval(interval);
  }, [summary]);

  if (loading) return <p className="text-white">📡 데이터 불러오는 중...</p>;

  // 설비 상태 데이터 변환
  const equipmentData = Object.entries(summary.equipmentStatusCounts || {}).map(
    ([name, value]) => ({ name, value })
  );

  const COLORS = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };
  const num = (v) => (isNaN(v) ? 0 : v);
  return (
    <div className="h-screen w-screen bg-black overflow-auto p-0 m-0">
      <h1 className="text-2xl font-bold text-center text-cyan-400 mb-4 drop-shadow-[0_0_10px_#22d3ee]">
        MES 공정 운영 대시보드
      </h1>

      {/* 3x3 그리드 */}
      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-[90%]">
        {/* 총 프로젝트 */}
        <NeonCard borderColor="border-cyan-400" className="m-2">
          <div className="flex justify-center items-center w-[520px] h-[180px] px-4 py-2 rounded-lg overflow-hidden">

            {/* 왼쪽 텍스트 전체 영역 */}
            <div className="flex flex-col justify-center text-left max-w-[220px]">
              <p className="text-rigth text-base font-semibold text-cyan-300 mb-2 drop-shadow-[0_0_8px_#22d3ee] whitespace-nowrap tracking-normal">
                프로젝트
              </p>

              {/* 총 프로젝트 수 */}
              <div className="flex justify-around items-end gap-3">
                <p className="text-m text-gray-400 mb-2">총 프로젝트 수</p>
                <p className="text-[60px] font-extrabold text-cyan-300 drop-shadow-[0_0_25px_#22d3ee] leading-none">
                  {animated.projectCount.toLocaleString()}
                </p>
              </div>

              {/* 상태 4개 */}
              <div className="flex justify-start gap-6 mt-2">
                {/* 진행 중 */}
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-yellow-300 drop-shadow-[0_0_10px_#facc15]">
                    {animated.inProgressProjects}
                  </p>
                  <span className="text-xs text-gray-400 mt-1">진행 중</span>
                </div>

                {/* 완료 */}
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-green-300 drop-shadow-[0_0_10px_#22c55e]">
                    {animated.completedProjects}
                  </p>
                  <span className="text-xs text-gray-400 mt-1">완료</span>
                </div>

                {/* 보류 */}
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-red-300 drop-shadow-[0_0_10px_#f87171]">
                    {animated.holdProjects ?? 0}
                  </p>
                  <span className="text-xs text-gray-400 mt-1">보류</span>
                </div>

                {/* 계획 중 */}
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-blue-300 drop-shadow-[0_0_10px_#3b82f6]">
                    {animated.plannedProjects ?? 0}
                  </p>
                  <span className="text-xs text-gray-400 mt-1">계획 중</span>
                </div>
              </div>
            </div>

            {/* 오른쪽 원형 그래프 */}
            <div className="mr-4 relative w-[150px] h-[150px] flex justify-center items-center flex-shrink-0 ml-auto translate-x-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="75" cy="75" r="65" stroke="#1e293b" strokeWidth="9" fill="none" />
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  stroke="#22d3ee"
                  strokeWidth="9"
                  strokeDasharray="408"
                  strokeDashoffset={408 - (408 * animated.avgProgressRate) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="drop-shadow-[0_0_12px_#22d3ee] transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-semibold text-cyan-300">
                  {animated.avgProgressRate}%
                </p>
                <p className="text-[11px] text-gray-400 mt-1">평균 진척률</p>
              </div>
            </div>
          </div>
        </NeonCard>



        {/* 고객사 현황 */}
        <NeonCard borderColor="border-pink-400" className="m-2">
          <div className="flex justify-around items-center w-full h-[160px] px-2 py-1">
            <p className="text-base font-semibold text-pink-400 mb-3 drop-shadow-[0_0_8px_#22d3ee] whitespace-nowrap tracking-normal">
              고객사
            </p>
            <div className="flex flex-col items-center justify-center">
              <p className="text-5xl font-extrabold text-pink-300 drop-shadow-[0_0_20px_#f472b6] leading-none">
                {animated.totalCustomers}
              </p>
              <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">총 등록 고객사</p>
            </div>

            <div className="h-[80px] border-l border-pink-700 opacity-50" />

            <div className="flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-yellow-300 drop-shadow-[0_0_10px_#facc15] leading-none">
                {animated.contractCount}
              </p>
              <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">계약 고객</p>
            </div>

            <div className="h-[80px] border-l border-pink-700 opacity-50" />

            <div className="flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-green-300 drop-shadow-[0_0_10px_#22c55e] leading-none">
                {animated.activeCount}
              </p>
              <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">활성 고객</p>
            </div>
          </div>
        </NeonCard>

        {/*자재 현황 */}
        <NeonCard borderColor="border-emerald-400" className="m-2">
          <div className="flex justify-around items-center w-full h-[160px] px-2 py-1">
            <p className="text-base font-semibold text-emerald-400 mb-3 drop-shadow-[0_0_8px_#22d3ee] whitespace-nowrap tracking-normal">
              자재관리
            </p>
            <div className="flex flex-col items-center justify-center">
              <p className="text-5xl font-extrabold text-emerald-300 drop-shadow-[0_0_20px_#10b981] leading-none">
                {animated.totalMaterials}
              </p>
              <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">총 등록 자재</p>
            </div>

            <div className="h-[80px] border-l border-emerald-700 opacity-50" />

            <div className="flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-green-300 drop-shadow-[0_0_10px_#22c55e] leading-none">
                {animated.activeMaterials}
              </p>
              <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">활성 자재</p>
            </div>

            <div className="h-[80px] border-l border-emerald-700 opacity-50" />

            <div className="flex flex-col items-center justify-center text-center text-xs text-gray-400">
              {Object.entries(animated.categoryStats || {}).map(([cat, cnt]) => (
                <p key={cat} className="whitespace-nowrap pb-1">
                  {cat}: <span className="text-emerald-300 font-semibold">{cnt}</span>
                </p>
              ))}
            </div>
          </div>
        </NeonCard>

        {/* 구매 현황 */}
        <NeonCard borderColor="border-blue-400" className="m-2">
          <p className="text-base font-semibold text-blue-400 mb-3 drop-shadow-[0_0_8px_#22d3ee] whitespace-nowrap tracking-normal">
            구매현황
          </p>
          <div className="flex flex-col justify-between w-full h-[200px] p-2"> {/*내부 여백 최소화 */}

            {/*1행: 발주 상태 요약 */}
            <div className="flex justify-around items-center text-center">
              <div className="flex flex-col items-center">
                <p className="text-4xl font-bold text-yellow-300 drop-shadow-[0_0_10px_#facc15] leading-none">
                  {animated.totalOrders}
                </p>
                <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">총 발주</p>
              </div>

              <div className="h-[60px] border-l border-blue-700 opacity-50" />

              <div className="flex flex-col items-center">
                <p className="text-4xl font-bold text-cyan-300 drop-shadow-[0_0_10px_#22d3ee] leading-none">
                  {animated.inProgressOrders}
                </p>
                <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">진행 중</p>
              </div>

              <div className="h-[60px] border-l border-blue-700 opacity-50" />

              <div className="flex flex-col items-center">
                <p className="text-4xl font-bold text-green-300 drop-shadow-[0_0_10px_#22c55e] leading-none">
                  {animated.completedOrders}
                </p>
                <p className="text-xs text-gray-400 mt-2 whitespace-nowrap">완료</p>
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-5/6 border-t border-blue-700 opacity-50 mx-auto my-2" />

            {/* 2행: 공급업체 Top 5 그래프 */}
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={Object.entries(animated.supplierStats || {}).map(([name, value]) => ({
                    name,
                    count: value,
                  }))}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip
                    wrapperStyle={{
                      backgroundColor: "#1F2937",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </NeonCard>


        {/* 5. 생산계획 */}
        <NeonCard borderColor="border-rose-400" className="m-2">
          <div className="flex flex-col w-[520px] h-[180px] px-5 py-4 rounded-lg overflow-hidden">

            {/* 상단 타이틀 */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-base font-semibold text-rose-300 drop-shadow-[0_0_8px_#fb7185] tracking-wide">
                생산계획 현황
              </p>
              <span className="text-xs text-gray-400">
                업데이트: {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* 중간 본문 */}
            <div className="flex justify-between items-center flex-1">
              {/* 왼쪽 텍스트 영역 */}
              <div className="flex flex-col justify-center">
                <p className="text-[48px] font-extrabold text-rose-400 drop-shadow-[0_0_20px_#fb7185] leading-none">
                  {animated.totalPlans?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">총 등록된 생산계획</p>

                {/* 상태별 현황 */}
                <div className="flex gap-8 mt-3">
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold text-yellow-300 drop-shadow-[0_0_8px_#facc15]">
                      {animated.inProgressPlans ?? 0}
                    </p>
                    <span className="text-[11px] text-gray-400">진행 중</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold text-green-300 drop-shadow-[0_0_8px_#22c55e]">
                      {animated.completedPlans ?? 0}
                    </p>
                    <span className="text-[11px] text-gray-400">완료</span>
                  </div>
                </div>
              </div>

              {/* 오른쪽 진행률 바 */}
              <div className="flex flex-col w-[220px]">
                <p className="text-xs text-gray-400 mb-1">전체 평균 진척률</p>
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-4 bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-700 ease-out"
                    style={{ width: `${animated.avgPlanProgressRate ?? 0}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm font-semibold text-rose-300 mt-1">
                  {animated.avgPlanProgressRate ?? 0}%
                </p>
              </div>
            </div>

            {/* 하단 미니 막대 그래프 */}
            <div className="flex justify-between items-end mt-4">
              {[
                { label: "계획", value: animated.totalPlans ?? 0, color: "#fb7185" },
                { label: "진행", value: animated.inProgressPlans ?? 0, color: "#facc15" },
                { label: "완료", value: animated.completedPlans ?? 0, color: "#22c55e" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-6 rounded-t-lg transition-all duration-700 ease-out"
                    style={{
                      height: `${Math.min(item.value / (animated.totalPlans || 1) * 80, 80)}px`,
                      background: item.color,
                      boxShadow: `0 0 10px ${item.color}`,
                    }}
                  ></div>
                  <span className="text-[10px] text-gray-400 mt-1">{item.label}</span>
                </div>
              ))}
            </div>

          </div>
        </NeonCard>

        {/* 6. 품질*/}
        <NeonCard title="품질 현황" borderColor="border-cyan-400">
          <div className="flex justify-around items-center w-full h-[180px] px-2 py-3">
            {/* 블록 품질 */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-400 mb-2">블록 품질검사</p>
              <PieChart width={120} height={120}>
                <Pie
                  data={[
                    { name: "합격", value: animated.qualityBlock.passRate },
                    { name: "불합격", value: 100 - (animated.qualityBlock.passRate ?? 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#22d3ee" />
                  <Cell fill="334155" />
                </Pie>
              </PieChart>
              <p className="text-cyan-300 font-semibold text-lg drop-shadow-[0_0_10px_#22d3ee]">
                {animated.qualityBlock.passRate ?? 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">합격률</p>
            </div>

            <div className="h-[100px] border-l border-cyan-700 opacity-40" />

            {/* 자재 품질 */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-400 mb-2">자재 품질검사</p>
              <PieChart width={120} height={120}>
                <Pie
                  data={[
                    { name: "합격", value: animated.qualityMaterial.passRate },
                    { name: "불합격", value: 100 - (animated.qualityMaterial.passRate ?? 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#22d3ee" />
                  <Cell fill="334155" />
                </Pie>
              </PieChart>
              <p className="text-cyan-300 font-semibold text-lg drop-shadow-[0_0_10px_#22d3ee]">
                {animated.qualityMaterial.passRate ?? 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">합격률</p>
            </div>
          </div>
        </NeonCard>

        {/* 7~9 추가 지표 */}
        {/* 출하 현황 */}
        <NeonCard title="출하 현황" borderColor="border-green-400">
          <div className="relative w-full h-[180px] p-4 rounded-2xl overflow-hidden backdrop-blur-lg bg-white/5 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-green-300 text-sm font-semibold tracking-wide">출하 진행률</h3>
              <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl pointer-events-none" />
            <div className="flex justify-around items-center h-full">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-green-300 drop-shadow-[0_0_10px_#22c55e]">{animated.totalShipments ?? 0}</p>
                <p className="text-xs text-gray-400">총 출하건</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-yellow-300 drop-shadow-[0_0_10px_#facc15]">{animated.inProgressShipments ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">진행 중</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-green-400 drop-shadow-[0_0_10px_#22c55e]">{animated.completedShipments ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">완료</p>
              </div>
            </div>
          </div>
        </NeonCard>

        {/* 인사 현황 */}
        <NeonCard title="인사 현황" borderColor="border-yellow-400">
          <div className="relative w-full h-[180px] p-4 rounded-2xl overflow-hidden backdrop-blur-lg bg-white/5 border border-yellow-400/30 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            {/* 상단 제목 */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-yellow-300 text-sm font-semibold tracking-wide">인사 현황</h3>
              <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
            </div>

            {/* 반투명 배경 */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl pointer-events-none" />

            {/* 메인 내용 */}
            <div className="flex justify-around items-center h-full">

              {/* 전체 인원 */}
              <div className="flex flex-col items-center">
                <p className="text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_15px_#facc15]">
                  {animated.totalEmployees ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">총 인원</p>
              </div>

              {/* 재직률 원형 게이지 */}
              <div className="relative w-[100px] h-[100px] flex justify-center items-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="45" stroke="#1e293b" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#facc15"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * (animated.activeRate ?? 0)) / 100}
                    strokeLinecap="round"
                    fill="none"
                    className="drop-shadow-[0_0_10px_#facc15] transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-lg font-bold text-yellow-300">
                    {animated.activeRate ?? 0}%
                  </p>
                  <p className="text-[11px] text-gray-400">재직률</p>
                </div>
              </div>

              {/* 상태별 인원 */}
              <div className="flex flex-col items-start text-gray-400 text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]" />
                  <p>재직: <span className="text-green-300 font-semibold">{animated.activeEmployees ?? 0}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444]" />
                  <p>퇴직: <span className="text-red-300 font-semibold">{animated.inactiveEmployees ?? 0}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <p>휴직: <span className="text-cyan-300 font-semibold">{animated.onLeaveEmployees ?? 0}</span></p>
                </div>
              </div>
            </div>
          </div>
        </NeonCard>
        <NeonCard title="추가 지표" borderColor="border-rose-400">
          <p className="text-gray-400 text-sm">내용 준비 중...</p>
        </NeonCard>

      </div>
    </div>
  );
}
