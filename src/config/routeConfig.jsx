const routesConfig = [
  {
    title: "대시보드",
    items: [{ name: "공정 운영 현황", path: "/" }],
  },
  {
    title: "기준 정보 관리",
    path: "/main/processes",
    pageTitle: "기준 정보 관리",
    items: [
      { name: "공정 라우팅 관리", path: "/main/processes" },
      { name: "작업장 관리", path: "/main/work-centers" },
      { name: "설비 관리", path: "/main/equipments" },
    ],
  },
  {
    title: "생산관리",
    path: "/produce/plans", 
    pageTitle: "생산 관리",
    items: [
      { name: "생산계획 조회", path: "/produce/plans" },
      { name: "작업지시 관리", path: "/produce/workorder-management" },
    ],
  },
  {
    title: "공정관리",
    path: "/process/workOrders",
    pageTitle: "공정 관리",
    items: [
      { name: "작업지시 조회", path: "/process/workOrders" },
      { name: "실적 등록", path: "/process/results-log" },
    ],
  },
  {
    title: "자재관리",
    path: "/materials/material-input", 
    pageTitle: "자재 관리",
    items: [
      { name: "자재 입고 등록", path: "/materials/input" },
      { name: "자재 출고 등록", path: "/materials/output" },
      { name: "자재 현황", path: "/materials/inventory" },
    ],
  },
  {
    title: "품질관리",
    path: "/quality/inspection", 
    pageTitle: "품질 관리",
    items: [
        { name: "품질 검사", path: "/quality/inspection" },
        { name: "불량 등록", path: "/quality/defects" },
    ],
  },
  {
    title: "설비 관리",
    path: "/equipment/equipment-management", 
    pageTitle: "설비 관리",
    items: [
        { name: "설비 관리", path: "/equipment/equipment-management" },
    ],
  },
];

export default routesConfig;