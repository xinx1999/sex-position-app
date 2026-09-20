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

    // 只在进入详情页时拉回顶部。首页切换筛选/标签不干预滚动，交给浏览器自己。
    if (pathname.startsWith("/position/")) {
      window.scrollTo(0, 0);
      // 图片懒加载会把布局撑开，下一帧再压一次，避免又被顶下去
      const id = requestAnimationFrame(() => window.scrollTo(0, 0));
      return () => cancelAnimationFrame(id);
    }

    // 从详情页点标签回首页时，直接落到姿势列表，省得再手动往下翻
    if (tag) {
      const id = requestAnimationFrame(() => {
        document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return () => cancelAnimationFrame(id);
    }
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
