const routesConfig = [
  
  {
    title: "기준 정보 관리",
    path: "/main/processes",
    pageTitle: "기준 정보 관리",
    items: [
      { name: "공정 라우팅 관리", path: "/main/processes" },
      { name: "작업장/설비 관리", path: "/main/work-centers" }, // 루트 수정 필요
      { name: "작업자/권한 관리", path: "/main/workers" },
      { name: "생산계획 조회", path: "/main/processes" },// 루트 수정 필요
    ],
  },
  {
    title: "생산관리",
    path: "/produce/plans", 
    pageTitle: "생산 관리",
    items: [
      { name: "블록 생산 계획", path: "/produce/plans" },
      { name: "작업지시 생성", path: "/produce/workorders" },
    ],
  },
  {
    title: "공정관리",
    path: "/process/workorders",
    pageTitle: "공정 관리",
    items: [
      { name: "작업 진행/실적 등록", path: "/process/results-log" },
      { name: "진척 현황", path: "/process/dashboard" }, // 루트 수정 필요
    ],
  },
  {
    title: "자재관리",
    path: "/materials/input", 
    pageTitle: "자재 관리",
    items: [
      { name: "자재 사용 등록", path: "/materials/input" }, 
    ],
  },
  {
    title: "품질관리",
    path: "/quality/inspection", 
    pageTitle: "품질 관리",
    items: [
        { name: "자재 품질검사", path: "/quality/inspection" }, // 루트 수정 필요
        { name: "블록 품질검사", path: "/quality/inspection" },
        { name: "불량 보고", path: "/quality/defects" },
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