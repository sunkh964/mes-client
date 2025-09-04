const routesConfig = [
  
  {
    title: "기준 정보 관리",
    path: "/main/processes",
    pageTitle: "기준 정보 관리",
    items: [
      { name: "공정 라우팅 관리", path: "/main/processes" },
      { name: "작업장 관리", path: "/main/work-centers" },
      { name: "설비 관리", path: "/main/equipment" },
      { name: "작업자 관리", path: "/main/workers" },
    ],
  },
  {
    title: "생산관리",
    path: "/produce/plans", 
    pageTitle: "생산 관리",
    items: [
      { name: "생산계획 조회", path: "/produce/plans" },
      { name: "작업지시 관리", path: "/produce/orders" },
    ],
  },
  {
    title: "공정관리",
    path: "/process/workorders",
    pageTitle: "공정 관리",
    items: [
      { name: "작업지시 조회", path: "/process/workorders" },
      { name: "실적 등록", path: "/process/results-log" },
    ],
  },
  {
    title: "자재관리",
    path: "/materials/input", 
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
    title: "출하 관리",
    path: "/shipping/shipments",
    items: [
        { name: "출하 등록 및 조회", path: "/shipping/shipments" },
    ],
  },
];

export default routesConfig;