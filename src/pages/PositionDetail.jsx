import { useParams, Link } from "react-router-dom";
import { positions } from "../data/positions";
import { recommend, ladder } from "../data/recommend";
import Header from "../components/Header";
import StepList from "../components/StepList";
import PositionCard from "../components/PositionCard";
import PositionIllustration from "../components/PositionIllustration";

/** 难度阶梯里的一格 */
function LadderBox({ p, hint, current }) {
  const box = current
    ? "border-rose-300 bg-rose-50"
    : "border-gray-100 bg-white hover:shadow-md hover:border-rose-200";
  const inner = (
    <>
      <div className="aspect-[16/10] flex items-center justify-center overflow-hidden">
        <PositionIllustration id={p.id} name={p.name} />
      </div>
      <div className="px-2 py-1.5 text-center">
        <p className="text-[11px] text-gray-400">{hint}</p>
        <p className={`text-xs font-medium truncate ${current ? "text-rose-600" : "text-gray-800"}`}>
          {p.name}
        </p>
        <p className="text-[10px] text-amber-500">{"★".repeat(p.difficulty)}</p>
      </div>
    </>
  );
  if (current) return <div className={`rounded-xl border ${box} overflow-hidden`}>{inner}</div>;
  return (
    <Link to={`/position/${p.id}`} className={`block rounded-xl border ${box} overflow-hidden transition`}>
      {inner}
    </Link>
  );
}

export default function PositionDetail() {
  const { id } = useParams();
  const position = positions.find((p) => p.id === id);

  if (!position) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-600">姿势不存在</p>
        <Link to="/" className="text-rose-500 hover:text-rose-600">
          返回首页
        </Link>
      </div>
    );
  }

  const recs = recommend(position.id, 8);
  const lad = ladder(position.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          ← 返回
        </Link>

        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{position.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < position.difficulty ? "text-amber-400" : "text-gray-200"}
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {position.intensity}体力
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  灵活性 {position.flexibility}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-gray-600">{position.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {position.tags.map((t) => (
              <Link
                key={t}
                to={`/?tag=${encodeURIComponent(t)}`}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-600 transition"
              >
                #{t}
              </Link>
            ))}
          </div>
        </div>

        {/* 姿势示意图 */}
        <div className="mb-8">
          <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center border border-rose-100 overflow-hidden">
            <PositionIllustration id={position.id} name={position.name} />
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">示意图</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-sm">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 mb-1">适合</p>
            <p className="text-gray-900">{position.suitable}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 mb-1">不适合</p>
            <p className="text-gray-900">{position.notSuitable}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 sm:col-span-2">
            <p className="text-gray-500 mb-1">道具</p>
            <p className="text-gray-900">{position.props}</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">动作步骤</h2>
          <StepList steps={position.steps} />
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">要点与技巧</h2>
          <ul className="space-y-2">
            {position.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-rose-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
          {position.variations?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">常见变式</p>
              <div className="flex flex-wrap gap-2">
                {position.variations.map((v) => (
                  <span
                    key={v}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">注意事项</h2>
          <p className="text-sm text-amber-700 leading-relaxed">
            出现任何不适请立即停止。注意关节保护，使用必要的支撑与润滑。双方随时可以用安全词叫停。本内容仅供参考，请根据自身情况调整。
          </p>
        </section>

        {(lad.easier || lad.harder) && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">难度阶梯</h2>
            <p className="text-xs text-gray-400 mb-3">
              撑不住就往左退一步，觉得轻松就往右上一级
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {lad.easier ? (
                <LadderBox p={lad.easier} hint="← 更省力" />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-300">
                  已是最简单的同类
                </div>
              )}
              <LadderBox p={position} hint="当前" current />
              {lad.harder ? (
                <LadderBox p={lad.harder} hint="更有挑战 →" />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-300">
                  已是最高难度
                </div>
              )}
            </div>
          </section>
        )}

        {recs.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">相关姿势</h2>
            <p className="text-xs text-gray-400 mb-4">按分类、标签与难度自动匹配</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recs.map((r) => (
                <PositionCard key={r.position.id} position={r.position} badge={r.reason} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
