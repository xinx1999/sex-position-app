import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import PositionDetail from "./pages/PositionDetail";
import SafetyGuide from "./pages/SafetyGuide";

/**
 * 路由切换后把页面拉回顶部。
 * SPA 不会重置滚动位置，从列表往下翻一段再点进详情，会停在半中间。
 * 带 ?tag= 时改为滚到姿势列表，否则点了标签还要自己往下找结果。
 */
function ScrollManager() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const tag = new URLSearchParams(search).get("tag");
    if (tag) {
      // 等列表渲染出来再滚
      const id = requestAnimationFrame(() => {
        document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return () => cancelAnimationFrame(id);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter basename="/sex-position-app/">
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/position/:id" element={<PositionDetail />} />
        <Route path="/safety" element={<SafetyGuide />} />
      </Routes>
    </BrowserRouter>
  );
}
