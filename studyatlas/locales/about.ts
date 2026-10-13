import type { Localized } from "@/lib/i18n";
// Copy for the About page. Each feature is marked available (usable today) or soon (Coming Soon).
export type Feature = { text: Localized; status: "available" | "soon"; href?: string };
export type Step = { key: "discover" | "compare" | "decide"; title: string; label: Localized; summary: Localized; detail: Localized; features: Feature[] };

export const about = {
  eyebrow: { en: "Discover → Compare → Decide", ja: "Discover → Compare → Decide" },
  // "|" marks preferred line breaks for large screens.
  headline: { en: "Your journey starts here.", ja: "世界中の留学情報を、|もっと身近に、|もっとシンプルに。" },
  subline: { en: "Study-abroad information from around the world, closer and simpler.", ja: "Your journey starts here." },
  mission: {
    en: "StudyAtlas aims to be the platform that supports you all the way: from finding a place to study, to comparing your options, to deciding on the one that fits you.",
    ja: "StudyAtlasは、留学先を探すところから、比較し、自分に合う選択肢を決めるまでをサポートするプラットフォームを目指しています。",
  },
  stepsTitle: { en: "Three steps to your study destination", ja: "留学先が決まるまでの3つのステップ" },
  available: { en: "Available now", ja: "利用可能" },
  soon: { en: "Coming Soon", ja: "今後実装予定" },
  legend: { en: "Features marked “Coming Soon” are planned and not available yet.", ja: "「今後実装予定」の機能は計画中で、現在はまだご利用いただけません。" },
  ctaExplore: { en: "Start exploring", ja: "留学先を探す" },
  ctaCompare: { en: "Compare cities", ja: "都市を比較する" },
  closing: { en: "Explore more. Compare smarter. Decide better.", ja: "Explore more. Compare smarter. Decide better." },
  closingSub: { en: "Everything for finding where to study, in one place: StudyAtlas.", ja: "留学先探しのすべてを、StudyAtlasで。" },
  currentTitle: { en: "About this version", ja: "現在のバージョンについて" },
} satisfies Record<string, Localized>;

export const steps: Step[] = [
  {
    key: "discover", title: "Discover", label: { en: "Discover", ja: "探す" },
    summary: { en: "Find study-abroad information on countries, cities and schools with ease.", ja: "国・都市・学校などの留学情報を、簡単に見つける。" },
    detail: {
      en: "Search by country, city, area or university name, or pick a country on the world map. In the future, StudyAtlas will also search overseas information across language barriers.",
      ja: "国名・都市名・エリア・大学名で検索したり、世界地図から国を選んだりできます。将来的には、言語の壁を越えて海外の情報を検索できるようにする予定です。",
    },
    features: [
      { text: { en: "Search countries, cities, areas and universities", ja: "国・都市・エリア・大学名で検索" }, status: "available", href: "/" },
      { text: { en: "Browse by country on the world map", ja: "世界地図から国を選んで探す" }, status: "available", href: "/" },
      { text: { en: "City pages with photos, housing, transport and climate", ja: "写真・住居・交通・気候をまとめた都市ページ" }, status: "available", href: "/city/vancouver" },
      { text: { en: "Cross-language search of overseas information", ja: "言語の壁を越えた海外情報検索" }, status: "soon" },
    ],
  },
  {
    key: "compare", title: "Compare", label: { en: "Compare", ja: "比較する" },
    summary: { en: "Compare living costs, housing, transport and schools side by side.", ja: "生活費・住居・交通・学校などの条件を、分かりやすく比較する。" },
    detail: {
      en: "Put up to three cities side by side in one table. Cost figures are currently demo samples; verified data and more detailed categories will follow.",
      ja: "最大3都市を1つの表に並べて比較できます。費用の数値は現在デモ用サンプルで、検証済みのデータや詳しい項目を今後追加します。",
    },
    features: [
      { text: { en: "Side-by-side table for up to 3 cities", ja: "最大3都市を並べて比較" }, status: "available", href: "/compare" },
      { text: { en: "School comparison (language schools / universities, up to 3)", ja: "学校比較（語学学校・大学、最大3校）" }, status: "available", href: "/schools" },
      { text: { en: "Rent, living cost, transport, climate, universities, student life", ja: "家賃・生活費・交通・気候・大学・学生生活の比較" }, status: "available", href: "/compare" },
      { text: { en: "Verified cost and rent data with sources", ja: "出典付きの検証済み生活費・家賃データ" }, status: "soon" },
      { text: { en: "Detailed safety, climate and school comparisons", ja: "治安・気候・学校の詳細比較" }, status: "soon" },
    ],
  },
  {
    key: "decide", title: "Decide", label: { en: "Decide", ja: "決める" },
    summary: { en: "Make your decision with budget simulations, favorites and a city-match quiz.", ja: "予算シミュレーションやお気に入り保存、都市診断で、留学先の決定をサポートする。" },
    detail: {
      en: "Save your study profile and estimate your total budget with your own figures. Favorites and a city-match quiz are next.",
      ja: "留学プロフィールを保存し、ご自身で調べた金額で総費用を見積もれます。お気に入り保存や都市診断は今後追加予定です。",
    },
    features: [
      { text: { en: "Study profile saved in your browser", ja: "ブラウザに保存する留学プロフィール" }, status: "available", href: "/my" },
      { text: { en: "Budget simulator (manual amounts)", ja: "費用シミュレーター（手動入力）" }, status: "available", href: "/my/budget" },
      { text: { en: "Visa check: official links and the details to prepare", ja: "ビザ確認：公式リンクと必要情報の整理" }, status: "available", href: "/my/visa" },
      { text: { en: "Save favorites", ja: "お気に入り保存" }, status: "soon" },
      { text: { en: "City-match quiz based on your priorities", ja: "条件に合った都市診断" }, status: "soon" },
    ],
  },
];
