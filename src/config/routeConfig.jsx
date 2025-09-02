const routesConfig = [
  
  {
    title: "기준 정보 관리",
    items: [
      { name: "작업장 관리", path: "/master-data/work-centers" },
      { name: "공정 관리", path: "/master-data/processes" },
      { name: "설비 관리", path: "/master-data/equipment" },
    ],
  },
  {
    title: "생산 관리",
    items: [
      { name: "생산계획 조회", path: "/production/plans" },
      { name: "작업지시 관리", path: "/production/orders" },
    ],
  },
  {
    title: "공정 관리",
    items: [
      { name: "작업 시작/종료", path: "/shop-floor/start-stop" },
      { name: "실적 등록", path: "/shop-floor/results-log" },
    ],
  },
  {
    title: "자재 관리",
    items: [
      { name: "자재 입고 등록", path: "/materials/input" },
      { name: "자재 출고 등록", path: "/materials/output" },
      { name: "자재 현황", path: "/materials/inventory" },
    ],
  },
  {
    title: "설비 관리",
    items: [
        { name: "장비 관리", path: "/equipment" },
    ],
  },
  {
    title: "품질 관리",
    items: [
        { name: "품질 검사 등록", path: "/quality/inspection" },
        { name: "불량 보고서", path: "/quality/defects" },
    ],
  },
];

export default routesConfig;