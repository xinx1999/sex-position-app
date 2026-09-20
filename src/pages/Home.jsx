import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  positions,
  filterCards,
  filterTags,
  intensityOptions,
  flexibilityOptions,
} from "../data/positions";
import PositionCard from "../components/PositionCard";
import Header from "../components/Header";

// 只有明确写明需要支撑物/必需道具的才算「需要道具」；
// 「可选枕头」「无必需要求」这类只是可选项，不算。
const PROP_REQUIRED = /必需|需要|必备|稳固|坚固|承重|防滑/;
const PROP_NONE = /^无(必需|需)|无需/;

function needsProps(position) {
  const text = (position.props || "").trim();
  if (!text || PROP_NONE.test(text)) return false;
  return PROP_REQUIRED.test(text);
}

function matchesGoal(position, goal) {
  if (goal === "全部") return true;
  if (goal === "入门推荐") return position.category.includes("入门") || position.difficulty === 1;
  if (goal === "经典姿势") return position.category.includes("经典");
  if (goal === "侧重女方") return position.category.includes("侧重女方");
  if (goal === "轻松舒适") return position.category.includes("轻松舒适") || position.intensity === "低";
  if (goal === "高难度挑战") return position.category.includes("高难度") || position.difficulty >= 3;
  if (goal === "需要道具") return position.category.includes("道具辅助") || needsProps(position);
  return true;
}

/** 一排筛选胶囊 */
function ChipRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
      <span className="flex-shrink-0 w-9 text-xs text-gray-400">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            value === o
              ? "bg-rose-500 border-rose-500 text-white"
              : "bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [goal, setGoal] = useState("全部");
  const [intensity, setIntensity] = useState("全部");
  const [flexibility, setFlexibility] = useState("全部");
  const [searchParams, setSearchParams] = useSearchParams();
  // 从详情页点标签跳过来时带上的标签，和其它维度是「且」的关系
  const tag = searchParams.get("tag");

  const filtered = useMemo(
    () =>
      positions.filter(
        (p) =>
          matchesGoal(p, goal) &&
          (intensity === "全部" || p.intensity === intensity) &&
          (flexibility === "全部" || p.flexibility === flexibility) &&
          (!tag || p.tags.includes(tag))
      ),
    [goal, intensity, flexibility, tag]
  );

  /**
   * 筛选后列表会变短，浏览器把滚动位置往下钳，看上去像"跳回顶部"。
   * 如果切换前已经滚进列表了，就明确拉回列表开头，位置可预期。
   */
  const keepAtList = () => {
    const list = document.getElementById("list");
    if (!list || list.getBoundingClientRect().top >= 0) return;
    requestAnimationFrame(() => {
      document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const clearAll = () => {
    setGoal("全部");
    setIntensity("全部");
    setFlexibility("全部");
    if (tag) setSearchParams({}, { replace: true });
  };

  const conditions = [
    goal !== "全部" ? goal : null,
    intensity !== "全部" ? `${intensity}体力` : null,
    flexibility !== "全部" ? `柔韧${flexibility}` : null,
    tag ? `#${tag}` : null,
  ].filter(Boolean);
  const hasFilter = conditions.length > 0;

  const CARD_TO_GOAL = {
    beginner: "入门推荐",
    classic: "经典姿势",
    female: "侧重女方",
    intense: "高难度挑战",
    relaxed: "轻松舒适",
    props: "需要道具",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            探索更舒适的亲密连接
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl">
            科学、安全、循序渐进的姿势教学。像健身一样，从基础开始，注重沟通与身体感受。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#list"
              className="px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition"
            >
              开始探索
            </a>
            <Link
              to="/safety"
              className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              安全与沟通指南
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl border border-gray-100 px-3 py-2 divide-y divide-gray-100">
          <ChipRow label="目标" options={filterTags} value={goal} onChange={(v) => { setGoal(v); keepAtList(); }} />
          <ChipRow label="体力" options={intensityOptions} value={intensity} onChange={(v) => { setIntensity(v); keepAtList(); }} />
          <ChipRow label="柔韧" options={flexibilityOptions} value={flexibility} onChange={(v) => { setFlexibility(v); keepAtList(); }} />
        </div>
      </section>

      <section id="list" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {hasFilter ? conditions.join(" · ") : "全部姿势"}
          </h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-gray-500">{filtered.length} 个</span>
            {hasFilter && (
              <button onClick={clearAll} className="text-sm text-rose-500 hover:text-rose-600">
                清除筛选
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <PositionCard key={p.id} position={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">没有同时满足这些条件的姿势</p>
            <button onClick={clearAll} className="mt-2 text-sm text-rose-500 hover:text-rose-600">
              清除筛选
            </button>
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">按目标选择</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {filterCards.map((card) => (
            <button
              key={card.id}
              onClick={() => {
                setGoal(CARD_TO_GOAL[card.id] || "全部");
                document.getElementById("list")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`py-4 rounded-xl text-sm font-medium ${card.color} hover:opacity-90 transition`}
            >
              {card.name}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">开始前必读</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-900 mb-1">沟通与安全词</p>
              <p>提前约定暂停信号，随时可以停止。</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">身体准备</p>
              <p>简单拉伸与放松，让身体更适应。</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">安全第一</p>
              <p>注意关节保护、润滑与保护措施。</p>
            </div>
          </div>
          <Link to="/safety" className="inline-block mt-4 text-sm text-rose-600 hover:text-rose-700">
            查看完整安全指南 →
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>本内容仅供成人参考 · 强调双方同意与安全第一</p>
        </div>
      </footer>
    </div>
  );
}
