import { useState } from "react";
import logo from "../images/logo.png";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("입력된 아이디:", id);
    console.log("입력된 비밀번호:", password);
    alert("아직.");
  };

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex flex-col items-center justify-center relative">
      {/* 상단 MES SERVICE 문구 */}
      <div className="absolute top-20 text-center mt-20">
        <h1 className="text-3xl font-bold text-[#2563eb] tracking-wide">
          MES SERVICE
        </h1>
      </div>

      <div className="flex max-w-5xl w-full bg-[#222] shadow-lg overflow-hidden mt-10">
        {/* 좌측 로고 */}
        <div className="hidden md:flex flex-col justify-center items-center bg-[#1a1a1a] w-1/2 p-15">
          <img src={logo} alt="Company Logo" className="w-60 h-auto" />
        </div>

        {/* 우측 로그인 폼 */}
        <div className="w-full md:w-1/2 p-20 text-white">
          <h2 className="text-3xl font-bold mb-8 text-[#2563eb] text-center">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#ccc] text-sm font-semibold mb-2">작업자 ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="you1001"
                required
                className="w-full px-4 py-2 bg-[#333] text-white placeholder-[#888] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#555]"
                style={{ borderRadius: 0 }}
              />
            </div>

            <div>
              <label className="block text-[#ccc] text-sm font-semibold mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full px-4 py-2 bg-[#333] text-white placeholder-[#888] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#555]"
                style={{ borderRadius: 0 }}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-[#1e40af] text-white font-bold py-3 transition"
              style={{ borderRadius: 0 }}
            >
              로그인
            </button>
          </form>

          <p className="mt-6 text-center text-[#aaa] text-sm">
            계정이 없으신가요?{" "}
            <a href="#" className="text-[#2563eb] hover:underline">
              회원가입
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
