import type { Localized } from "@/lib/i18n";
const t = (en: string, ja: string): Localized => ({ en, ja });
/** Home page (Ver.1.3.7): Discover → Compare → Decide, and the map's city card. */
export const home = {
  steps: [
    { n: "1", href: "#discover", title: t("Discover", "探す"), text: t("Pick a city on the map", "地図から都市を選ぶ") },
    { n: "2", href: "/compare", title: t("Compare", "比べる"), text: t("Cities and schools side by side", "都市・学校を並べて比較") },
    { n: "3", href: "/planner", title: t("Decide", "決める"), text: t("Plan the costs yourself", "費用を自分で見積もる") },
  ],
  all: t("All", "すべて"), backToCountries: t("All countries", "国の一覧に戻る"),
  hint: t("Choose a country (button or map), then a city. Drag and zoom the map freely; the list works without the map.", "国（ボタンまたは地図）、次に都市を選んでください。地図はドラッグ・ズームできます。一覧だけでも操作できます。"),
  mapFailed: t("The map service could not be reached, so a simple map is shown. Choose cities from the list or by search.", "地図サービスに接続できないため、簡易地図を表示しています。一覧や検索から都市を選べます。"),
  selectedCity: t("Selected city", "選択中の都市"),
  details: t("City details", "都市の詳細"), addCompare: t("Add to compare", "比較に追加"), inCompare: t("In comparison", "比較中"), full: t("Comparison is full", "比較は満杯です"), close: t("Close", "閉じる"),
  data: { official: t("Official data available (some items unverified)", "公式データあり（一部は確認中）"), preparing: t("Data being prepared – nothing is estimated", "データ準備中（推定値は載せていません）") },
  list: t("Cities", "都市一覧"), noCities: t("No city for this country yet.", "この国の都市はまだありません。"),
  credit: t("Map: OpenFreeMap © OpenMapTiles, data © OpenStreetMap contributors", "地図：OpenFreeMap © OpenMapTiles、データ © OpenStreetMap contributors"),
};
