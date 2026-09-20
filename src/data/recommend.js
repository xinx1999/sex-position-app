/**
 * 姿势推荐网络
 *
 * 相关姿势不再写死在数据里，而是按「分类 / 标签 / 难度 / 体力消耗 / 柔韧性」
 * 实时算相似度，并给出推荐理由。数据里写死的 related 作为人工加权种子。
 */
import { positions } from "./positions";

const BY_ID = Object.fromEntries(positions.map((p) => [p.id, p]));

/** 分类区分度：越冷门、越能说明「这是同一类姿势」的分类权重越高 */
const CAT_W = {
  侧重深度: 5,
  侧重摩擦: 5,
  侧重女方: 5,
  亲密: 4,
  后入变体: 4,
  站立: 4,
  坐姿: 4,
  侧卧: 4,
  经典: 3,
  入门: 3,
  轻松舒适: 3,
  高难度: 3,
  挑战: 3,
  道具辅助: 3,
  床沿: 3,
  反向: 3,
  抬臀: 3,
};

const DEFAULT_CAT_W = 2;
const TAG_W = 3;
const SEED_BOOST = 6; // 数据里人工维护的 related 加权

function scorePair(a, b) {
  const cat = b.category.filter((c) => a.category.includes(c));
  const tags = b.tags.filter((t) => a.tags.includes(t));
  const catW = cat.reduce((s, c) => s + (CAT_W[c] ?? DEFAULT_CAT_W), 0);
  const tagW = tags.length * TAG_W;

  const dd = b.difficulty - a.difficulty;
  const upW = dd >= 1 && dd <= 2 ? 4 : 0; // 进阶
  const downW = dd <= -1 && dd >= -2 ? 3 : 0; // 省力
  const intenW = b.intensity === a.intensity ? 2 : 0;
  const flexW = b.flexibility === a.flexibility ? 1 : 0;
  const bonus = cat.length && tags.length ? 2 : 0;
  const penalty = Math.abs(dd) * 1.5;

  return {
    total: catW + tagW + upW + downW + intenW + flexW + bonus - penalty,
    cat,
    tags,
    dd,
    catW,
    tagW,
    upW,
    downW,
  };
}

/**
 * 「经典」「高难度」这类分类太宽泛，几乎人人都有，说出来没有信息量。
 * 只有「站立」「侧卧」「侧重女方」这种具体分类才算真正的同类。
 */
const GENERIC_CAT = new Set(["经典", "入门", "轻松舒适", "高难度", "挑战", "道具辅助"]);

function topCat(cat) {
  return cat.slice().sort((x, y) => (CAT_W[y] ?? DEFAULT_CAT_W) - (CAT_W[x] ?? DEFAULT_CAT_W))[0];
}

/** 推荐理由按「信息量」排序，而不是单纯按权重，否则满屏都是「同类·高难度」 */
function reasonOf(s, b) {
  const specific = s.cat.filter((c) => !GENERIC_CAT.has(c));
  const generic = s.cat.filter((c) => GENERIC_CAT.has(c));

  if (specific.length) return { type: "同类", label: topCat(specific) };
  if (s.tags.length) return { type: "同标签", label: s.tags[0] };
  if (s.upW > 0) return { type: "进阶", label: `难度 ${b.difficulty}★` };
  if (s.downW > 0) return { type: "省力", label: `难度 ${b.difficulty}★` };
  if (generic.length) return { type: "同类", label: topCat(generic) };
  return { type: "相近", label: "综合相近" };
}

/**
 * 推荐列表
 * @param {string} id
 * @param {number} limit
 * @returns {{position: object, reason: {type:string,label:string}, score: number}[]}
 */
export function recommend(id, limit = 8) {
  const a = BY_ID[id];
  if (!a) return [];
  const seed = new Set(a.related || []);

  const ranked = positions
    .filter((b) => b.id !== id)
    .map((b) => {
      const s = scorePair(a, b);
      const extra = seed.has(b.id) ? SEED_BOOST : 0;
      return {
        position: b,
        score: s.total + extra,
        reason: reasonOf(s, b),
        dd: s.dd,
        // 真有共同点：共享分类或共享标签。写死的 related 只加权，不算「有交集」
        connected: s.cat.length > 0 || s.tags.length > 0,
      };
    })
    .sort((x, y) => y.score - x.score);

  // 只保留真正有交集的，宁可数量少也不灌水
  const picked = ranked.filter((r) => r.connected).slice(0, limit);
  const has = (t) => picked.some((r) => r.reason.type === t);

  // 保证网络里既有「更难」也有「更省力」的出口，避免全是同类
  for (const [type, ok] of [
    ["进阶", (r) => r.dd >= 1],
    ["省力", (r) => r.dd <= -1],
  ]) {
    if (has(type)) continue;
    // 难度出口允许从全集里找（这是阶梯，不是同类），不受 connected 限制
    const cand = ranked.find((r) => ok(r) && !picked.includes(r));
    if (!cand) continue;
    if (picked.length < limit) picked.push(cand);
    else picked[picked.length - 1] = cand;
  }

  return picked;
}

/**
 * 难度阶梯：给当前姿势找一个「更省力」的退路和一个「更有挑战」的下一站。
 * 优先在同分类里找，找不到就退化为全库最接近的。
 */
export function ladder(id) {
  const a = BY_ID[id];
  if (!a) return { easier: null, harder: null };

  const pick = (dir) => {
    const pool = positions.filter((b) =>
      dir < 0 ? b.difficulty < a.difficulty : b.difficulty > a.difficulty
    );
    if (!pool.length) return null;
    const inCat = pool.filter((b) => b.category.some((c) => a.category.includes(c)));
    const from = inCat.length ? inCat : pool;
    return from.slice().sort((x, y) => Math.abs(x.difficulty - a.difficulty) - Math.abs(y.difficulty - a.difficulty))[0];
  };

  return { easier: pick(-1), harder: pick(1) };
}
