import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { positions, categories, filterTags } from "../data/positions";
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

function matchesFilter(position, filter) {
  if (filter === "全部") return true;
  if (filter === "入门推荐") return position.category.includes("入门") || position.difficulty === 1;
  if (filter === "经典姿势") return position.category.includes("经典");
  if (filter === "侧重女方") return position.category.includes("侧重女方");
  if (filter === "轻松舒适") return position.category.includes("轻松舒适") || position.intensity === "低";
  if (filter === "高难度挑战") return position.category.includes("高难度") || position.difficulty >= 3;
  if (filter === "需要道具")
    return position.category.includes("道具辅助") || needsProps(position);
  return true;
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("全部");
  const [searchParams, setSearchParams] = useSearchParams();
  // 从姿势详情页点标签跳过来时，用标签筛选，优先级高于分类筛选
  const tag = searchParams.get("tag");

  const filtered = useMemo(() => {
    if (tag) return positions.filter((p) => p.tags.includes(tag));
    return positions.filter((p) => matchesFilter(p, activeFilter));
  }, [tag, activeFilter]);

  const pickFilter = (item) => {
    if (tag) setSearchParams({}, { replace: true });

    // 筛选后列表会变短，浏览器把滚动位置往下钳，看上去像"跳回顶部"。
    // 如果切换前已经滚进列表了，就明确拉回列表开头，位置可预期。
    const list = document.getElementById("list");
    const wasPast = list ? list.getBoundingClientRect().top < 0 : false;

    setActiveFilter(item);

    if (wasPast) {
      requestAnimationFrame(() => {
        document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
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

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterTags.map((item) => (
            <button
              key={item}
              onClick={() => pickFilter(item)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                !tag && activeFilter === item
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section id="list" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {tag ? `标签 · ${tag}` : activeFilter === "全部" ? "全部姿势" : activeFilter}
          </h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-gray-500">{filtered.length} 个</span>
            {tag && (
              <button
                onClick={() => setSearchParams({}, { replace: true })}
                className="text-sm text-rose-500 hover:text-rose-600"
              >
                清除标签
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
          <p className="text-center text-gray-500 py-12">该分类下暂无姿势</p>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">按目标选择</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const map = {
                  beginner: "入门推荐",
                  classic: "经典姿势",
                  female: "侧重女方",
                  intense: "高难度挑战",
                  relaxed: "轻松舒适",
                  props: "需要道具",
                };
                setActiveFilter(map[cat.id] || "全部");
                document.getElementById("list")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`py-4 rounded-xl text-sm font-medium ${cat.color} hover:opacity-90 transition`}
            >
              {cat.name}
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
