/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",          // 루트 html 파일
    "./src/**/*.{js,jsx,ts,tsx}",  // src 폴더 내 모든 js, jsx, ts, tsx 파일
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar-hide')
    // 다른 플러그인이 있다면 여기에 추가
  ],
}

