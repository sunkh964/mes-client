const routesConfig = [
  
  {
    title: "기준 정보 관리",
    path: "/main/processes",
    pageTitle: "기준 정보 관리",
    items: [
      { name: "공정 라우팅 관리", path: "/main/processes" },
      { name: "작업장/설비 관리", path: "/main/work-centers" }, 
      { name: "작업자/권한 관리", path: "/main/workers" },
    ],
  },
  {
    title: "생산관리",
    path: "/produce/project-plans", 
    pageTitle: "생산 관리",
    items: [
      { name: "생산계획 조회", path: "/produce/project-plans" },
      { name: "블록 생산 계획", path: "/produce/blockPlans" },
    ],
  },
  {
    title: "작업지시관리",
    path: "/progress/workOrders",
    pageTitle: "작업지시관리",
    items: [
      { name: "작업지시 생성", path: "/progress/workOrders" },
      { name: "작업 진행/실적 등록", path: "/progress/workinprogress" },
    ],
  },
  {
    title: "자재관리",
    path: "/materials/usage", 
    pageTitle: "자재 관리",
    items: [
      { name: "자재 사용 등록", path: "/materials/usage" }, 
    ],
  },
  {
    title: "품질관리",
    path: "/quality/materialQC", 
    pageTitle: "품질 관리",
    items: [
        { name: "자재 품질검사", path: "/quality/materialQC" },
        { name: "블록 품질검사", path: "/quality/blockQC" },
        { name: "불량 보고", path: "/quality/defects" },
    ],
  },
  {
    title: "출하 관리",
    path: "/shipment",
    pageTitle: "출하 관리",
    items: [
        { name: "출하 등록 및 조회", path: "/shipment" },
    ],
  },
];

export default routesConfig;