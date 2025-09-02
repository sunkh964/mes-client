import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// 통계 카드를 위한 간단한 컴포넌트
const StatCard = ({ title, value, color }) => (
  <div className={`p-6 bg-white rounded-lg shadow-md border-l-4 ${color}`}>
    <h3 className="text-gray-500 text-sm font-semibold uppercase">{title}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
     const fetchData = async () => {

      try {
        const response = await axios.get('http://localhost:8080/api/dashboard/summary');
        setSummary(response.data);
      } catch (err) {
        setError(err);
        console.error("데이터 로드 실패:", err.response ? err.response.data : err.message);
      } finally {
       setLoading(false);
      }
      };
      fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">대시보드 데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">데이터 로드 실패: {error.message}</div>;
  if (!summary) return null;

  const equipmentData = Object.entries(summary.equipmentStatusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = { running: '#10B981', idle: '#F59E0B', maintenance: '#EF4444' };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">공정 운영 현황 대시보드</h1>
      
      {/* 1. 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="총 작업지시" value={summary.totalWorkOrders} color="border-blue-500" />
        <StatCard title="진행 중" value={summary.inProgressWorkOrders} color="border-yellow-500" />
        <StatCard title="완료" value={summary.completedWorkOrders} color="border-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. 작업장별 생산 현황 (막대그래프) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">작업장별 생산 현황</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.workCenterProductions}>
              <XAxis dataKey="workCenterName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalPlanned" fill="#8884d8" name="계획량" />
              <Bar dataKey="totalProduced" fill="#82ca9d" name="생산량" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. 설비 상태 (파이차트) */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">설비 상태</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={equipmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {equipmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}