// 전체 메뉴 및 라우트 정보 정의
const routesConfig = [
  {
    title: "기준 정보 관리",
    path: "/main",
    pageTitle: "기준 정보 관리",
    items: [
      { name: "공정 정보관리", path: "/main" },
      { name: "작업자 관리", path: "/main/workorder-management" },
      { name: "작업장 관리", path: "/main/workcenter-management" },
      { name: "자재 조회", path: "/" },
      { name: "BOM 조회", path: "/" },
    ],
  },
  {
    title: "생산관리",
    path: "/produce",
    pageTitle: "생산 관리",
    items: [
      { name: "생산계획 조회", path: "/produce" },
      { name: "작업지시 조회", path: "/produce/standard2" },
      { name: "생산진행 현황", path: "/" },
    ],
  },
  {
    title: "공정관리",
    path: "/main",
    pageTitle: "공정 관리",
    items: [
      { name: "공정 계획 관리", path: "/" },
      { name: "작업지시 선택/변경", path: "/" },
      { name: "작업 시작/종료", path: "/" },
      { name: "실적 등록", path: "/" },
    ],
  },
  {
    title: "자재관리",
    path: "/main",
    pageTitle: "자재 관리",
    items: [
      { name: "자재 투입 등록", path: "/" },
      { name: "자재 산출 등록", path: "/" },
      { name: "자재 재고 현황", path: "/" },
    ],
  },
  {
    title: "설비관리",
    path: "/equipment",
    pageTitle: "설비 관리",
    items: [
      { name: "설비어쩌구", path: "/" },
      { name: "섧비저쩌구", path: "/" },
    ],
  },
];

export default routesConfig;
