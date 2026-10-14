import type { Rights } from "./rights";
/*
 * Rights records (Ver.1.2). Read on 2026-10-14 from the publishers' own pages via the GitHub Actions terms probe
 * (collector/terms-probe.ts); the wording quoted in reviewNotes is theirs. This is a practical reading of published terms,
 * not legal advice: where a clause could be read either way the entry says so and `expertReview` is true.
 * To change how a source is treated, edit its record here (reuseStatus / display / automation) – the pages, the planner,
 * the compare view and the collector all follow it.
 */
const D = "2026-10-14";
const page = (url: string, scope: string) => ({ url, reviewedAt: D, scope });
export const RIGHTS: Record<string, Rights> = {
  "tfgm-fares": {
    sourceName: "Transport for Greater Manchester (Bee Network)", sourceUrl: "https://tfgm.com/tickets-and-passes/bus-tickets", licenseUrl: null,
    reuseStatus: "needs-review", accessMethod: "page-check", automation: "page-check-only", lastReviewedAt: D, expertReview: true, restrictions: [],
    reviewNotes: {
      en: "No licence and no terms of use were found. The site footer says “Copyright © 2026 Transport for Greater Manchester. All rights reserved”; the Disclaimer page only disclaims warranty for accuracy. Nothing prohibits quoting a plain fare, but nothing grants a reuse licence either. StudyAtlas shows only the figure, its conditions and a link; no page text or table is republished. robots.txt does not disallow the ticket pages. The Open Data Portal lists real-time Metrolink data only (new keys are no longer issued); no fares dataset was found.",
      ja: "利用許可（ライセンス）も利用規約も見つかりませんでした。サイト下部は「Copyright © 2026 Transport for Greater Manchester. All rights reserved」、免責ページは情報の正確性に関する免責のみです。運賃の数値を示すこと自体を禁じる記載はありませんが、再利用を許可する記載もありません。StudyAtlasは数値・適用条件・公式ページへのリンクのみを表示し、ページの文章や表は転載しません。robots.txtは乗車券ページを禁止していません。オープンデータポータルはMetrolinkのリアルタイムデータのみで、運賃のデータセットは見つかりませんでした。",
    },
    reviewed: [page("https://tfgm.com/disclaimer", "Disclaimer page, copyright line in the footer"), page("https://tfgm.com/robots.txt", "crawl rules"), page("https://tfgm.com/data-analytics-and-insight/open-data-portal", "open data portal (redirect target of developer.tfgm.com)")],
  },
  "translink-fares": {
    sourceName: "TransLink", sourceUrl: "https://www.translink.ca/transit-fares/pricing-and-fare-zones", licenseUrl: "https://www.translink.ca/terms-and-conditions",
    reuseStatus: "restricted", accessMethod: "manual-link", automation: "blocked", lastReviewedAt: D, expertReview: true, restrictions: ["no-reproduction-without-consent", "personal-noncommercial-extracts-only"],
    reviewNotes: {
      en: "The website terms name “information in all forms” as the exclusive property of TransLink: the website and its content “may not be copied, imitated, reproduced, republished, uploaded, posted, transmitted, modified or distributed in any way, in whole or in part, without the express prior written consent of TransLink”, and information may be copied “for personal, non-commercial use” only. Whether a single fare figure falls under this is a legal question. Until TransLink consents or a professional confirms that bare fares may be shown, StudyAtlas keeps the recorded figures in its data but does not display or collect them: the Vancouver transport card links to TransLink's official pages. (TransLink's separate Open API / GTFS terms licence only data obtained through an approved API key; fares are not part of it.)",
      ja: "ウェブサイト利用規約は「あらゆる形式の情報」をTransLinkの排他的財産とし、サイトとその内容を「TransLinkの事前の書面による明示的な同意なく、全部または一部を複製・転載・再公表・送信・改変・配布してはならない」と定め、情報の複製は「個人的・非商業目的」に限っています。運賃の数値1件がこれに当たるかは法的な判断です。TransLinkの同意、または専門家による確認が得られるまで、記録済みの数値はデータとして保持しますが、表示も自動収集もせず、バンクーバーの交通カードでは公式ページへのリンクを案内します。（TransLinkのOpen API／GTFS規約は承認されたAPIキーで得たデータが対象で、運賃は含まれません。）",
    },
    reviewed: [page("https://www.translink.ca/terms-and-conditions", "Copyright clause"), page("https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/terms-of-use", "Open API terms of use"), page("https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/gtfs/gtfs-data", "GTFS static data terms"), page("https://www.translink.ca/robots.txt", "crawl rules")],
  },
  "uom-cost-of-living": {
    sourceName: "The University of Manchester", sourceUrl: "https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/", licenseUrl: "https://www.manchester.ac.uk/copyright/",
    reuseStatus: "needs-review", accessMethod: "page-check", automation: "page-check-only", lastReviewedAt: D, expertReview: true, restrictions: ["no-reproduction-without-consent"],
    reviewNotes: {
      en: "Copyright notice: “Material published by The University of Manchester on these web pages is copyright The University of Manchester and may not be reproduced without permission.” This covers the published material (text, tables); it does not say whether a plain cost figure may be quoted. StudyAtlas shows only the figure, its conditions and a link, never the page text or tables. The Disclaimer page concerns delivery of programmes, not data reuse. robots.txt does not disallow these pages. Permission could be requested from the University.",
      ja: "著作権表示：「大学がこれらのウェブページで公開する素材は著作権で保護され、許可なく複製してはならない」。これは公開された素材（文章・表）についての記載で、単純な費用の数値を引用してよいかは述べていません。StudyAtlasは数値・適用条件・リンクのみを表示し、ページの文章や表は表示しません。免責ページは課程の提供に関する内容で、データの再利用とは無関係です。robots.txtはこれらのページを禁止していません。大学に許可を求めることも可能です。",
    },
    reviewed: [page("https://www.manchester.ac.uk/copyright/", "Copyright notice (full text)"), page("https://www.manchester.ac.uk/disclaimer/", "Disclaimer (full text)"), page("https://www.manchester.ac.uk/robots.txt", "crawl rules")],
  },
  "uom-accommodation": {
    sourceName: "The University of Manchester (accommodation)", sourceUrl: "https://www.manchester.ac.uk/study/international/accommodation/", licenseUrl: "https://www.manchester.ac.uk/copyright/",
    reuseStatus: "needs-review", accessMethod: "page-check", automation: "page-check-only", lastReviewedAt: D, expertReview: true, restrictions: ["no-reproduction-without-consent"],
    reviewNotes: {
      en: "Same terms as the University's cost-of-living pages (copyright notice; no licence; no statement about plain prices). Only the rent figures, their contract and conditions and a link are shown.",
      ja: "大学の生活費ページと同じ条件です（著作権表示のみで、ライセンスや単純な料金の扱いについての記載はありません）。家賃の数値・契約条件・リンクのみを表示します。",
    },
    reviewed: [page("https://www.manchester.ac.uk/copyright/", "Copyright notice (full text)")],
  },
  "statcan-cmhc-rents": {
    sourceName: "Statistics Canada / CMHC – average rents (table 34-10-0133-01)", sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301", licenseUrl: "https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions",
    licence: "CMHC Licence Agreement for the Use of Data; Statistics Canada Open Licence",
    reuseStatus: "permitted", accessMethod: "open-api", automation: "allowed", lastReviewedAt: D, expertReview: false, restrictions: ["attribution-required", "crawl-delay"],
    attribution: "Source: Canada Mortgage and Housing Corporation (CMHC), average rents (Statistics Canada table 34-10-0133-01). This information is reproduced and distributed on an “as is” basis with the permission of CMHC.",
    reviewNotes: {
      en: "CMHC's licence grants a worldwide, royalty-free, non-exclusive licence to “use, reproduce, publish, freely distribute, or sell the Information”, with the attribution notice above and no use of CMHC's names or logos. The Statistics Canada Open Licence (which hosts this table) is similar. The table page itself states neither licence; both are permissive. Statistics Canada's robots.txt asks for a 2-second Crawl-delay, which the collector observes.",
      ja: "CMHCのライセンスは「情報の使用・複製・公表・自由な配布・販売」を世界的・無償・非独占で認め、上記の出典表示を求め、CMHCの名称・ロゴの使用を禁じています。この表を公開するStatistics Canadaのオープンライセンスも同様の内容です。表のページ自体はどちらのライセンスも明記していませんが、どちらも許諾的です。Statistics Canadaのrobots.txtは2秒のCrawl-delayを求めており、コレクターはこれを守ります。",
    },
    reviewed: [page("https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions", "CMHC licence agreement (full)"), page("https://www.statcan.gc.ca/en/reference/agreement_CMHC", "same agreement hosted by Statistics Canada"), page("https://www.statcan.gc.ca/en/terms-conditions/open-licence", "Statistics Canada Open Licence"), page("https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301", "table page (no licence statement)"), page("https://www150.statcan.gc.ca/robots.txt", "Crawl-delay: 2")],
  },
  "eccc-climate-normals": {
    sourceName: "Environment and Climate Change Canada – climate normals (MSC GeoMet API)", sourceUrl: "https://api.weather.gc.ca/collections/climate-normals", licenseUrl: "https://eccc-msc.github.io/open-data/licence/readme_en/",
    licence: "Environment and Climate Change Canada Data Services End-use Licence v2.1",
    reuseStatus: "permitted", accessMethod: "open-api", automation: "allowed", lastReviewedAt: D, expertReview: false, restrictions: ["attribution-required", "robots-disallows-api-path"],
    attribution: "Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada.",
    robotsException: { urlPrefix: "https://api.weather.gc.ca/collections/climate-normals/", policyUrl: "https://eccc-msc.github.io/open-data/usage-policy/readme_en", reason: "The MSC Open Data Services Usage Policy documents programmatic use of the GeoMet API (limit: about 1 request per second); robots.txt disallows /collections/*/items for crawlers and points to that policy." },
    reviewNotes: {
      en: "The End-use Licence grants “a worldwide, royalty-free, perpetual, non-exclusive licence to use the Information, including for commercial purposes”, with the attribution statement above. robots.txt of api.weather.gc.ca disallows /collections/*/items, yet the Service Usage Policy it points to documents programmatic API use (usage limit 86,400 requests/day; meaningful User-Agent; request only data you need). StudyAtlas makes 4 filtered requests every 180 days, identifies itself in the User-Agent and is therefore treated as within the policy; this is a judgement and can be switched off by setting automation to “blocked”. The data recorded is the 1981–2010 climate normals.",
      ja: "エンドユースライセンスは「商用を含め、世界的・無償・恒久的・非独占で情報を利用する」ことを認めており、上記の出典表示が必要です。api.weather.gc.caのrobots.txtは /collections/*/items を禁止していますが、そこで案内されているサービス利用方針はAPIのプログラム利用を想定しています（1日86,400リクエスト未満、意味のあるUser-Agent、必要なデータだけを取得）。StudyAtlasは絞り込んだ4件のリクエストを180日に1回送るだけでUser-Agentも明示しているため、方針の範囲内と判断していますが、これは判断であり、automationを「blocked」にすればいつでも停止できます。記録しているのは1981–2010年の気候平年値です。",
    },
    reviewed: [page("https://eccc-msc.github.io/open-data/licence/readme_en/", "End-use Licence v2.1 (full)"), page("https://eccc-msc.github.io/open-data/usage-policy/readme_en", "Service usage policy (full)"), page("https://api.weather.gc.ca/robots.txt", "Disallow: /collections/*/items"), page("https://api.weather.gc.ca/", "GeoMet-OGC-API home (links the licence)")],
  },
  "metoffice-station-data": {
    sourceName: "Met Office – historical monthly station data (Ringway)", sourceUrl: "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt", licenseUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    licence: "UK Open Government Licence v3.0",
    reuseStatus: "permitted", accessMethod: "open-data-file", automation: "blocked", lastReviewedAt: D, expertReview: false, restrictions: ["attribution-required", "automated-access-restricted"],
    attribution: "Contains public sector information licensed under the Open Government Licence v3.0.",
    reviewNotes: {
      en: "data.gov.uk lists this dataset (publisher: Met Office) under the UK Open Government Licence, and the Met Office website terms license site content under OGL v3.0 with the attribution above. The same terms say that, “save for any APIs that we provide or expressly authorise”, no robot, spider, deep-link or page-scrape may be used to monitor or copy site content. The Ringway file is a static historical file (the station closed in 2004), so the scheduled automatic re-download is switched off: the recorded values are shown with attribution, nothing is requested again. A person can re-read the file when needed.",
      ja: "data.gov.ukはこのデータセット（公開元：Met Office）を英国オープン・ガバメント・ライセンス（OGL）として掲載しており、Met Officeのサイト利用規約も、上記の出典表示を条件にサイトの内容をOGL v3.0で許諾しています。同じ規約は「提供・明示的に許可したAPIを除き」、ロボット・スパイダー・ディープリンク・ページスクレイピングでサイトの内容を監視・複製してはならないと定めています。リングウェイのファイルは静的な過去データ（観測所は2004年に閉鎖）のため、定期的な自動再取得は停止しました。記録済みの数値は出典表示付きで表示し、再取得は行いません。必要なときは人が確認します。",
    },
    reviewed: [page("https://www.metoffice.gov.uk/policies/tandc", "Website terms of use (licence, prohibited use)"), page("https://www.metoffice.gov.uk/policies/legal", "legal overview"), page("https://www.data.gov.uk/api/action/package_show?id=17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5", "dataset metadata: licence OGL"), page("https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/", "OGL v3.0 (full)"), page("https://www.metoffice.gov.uk/robots.txt", "crawl rules")],
  },
  "ubc-housing-fees": {
    sourceName: "UBC Student Housing and Community Services", sourceUrl: "https://vancouver.housing.ubc.ca/applications/fees-payments/", licenseUrl: "https://www.ubc.ca/site/legal.html",
    reuseStatus: "restricted", accessMethod: "manual-link", automation: "blocked", lastReviewedAt: D, expertReview: true, restrictions: ["personal-noncommercial-extracts-only", "no-reproduction-without-consent"],
    reviewNotes: {
      en: "UBC's terms of use grant “a limited license to use (display or print) short extracts of the information for your own personal, non-commercial use only… Any other use of the information is prohibited. None of the information may be otherwise reproduced, republished or re-disseminated in any manner or form without the prior written consent of the University of British Columbia.” Residence fees are therefore not shown or collected (no UBC figure is in StudyAtlas); the Vancouver pages link to UBC's fee pages. Until Ver.1.2 the PR probe still requested six UBC housing pages as a reviewer aid; that was stopped.",
      ja: "UBCの利用規約は「個人的・非商業目的で短い抜粋を表示・印刷する限定的なライセンス」のみを認め、「それ以外の利用は禁止。UBCの事前の書面による同意なく、情報を複製・再公表・再配布してはならない」と定めています。そのため寮料金は表示も収集もしていません（StudyAtlasにUBCの数値はありません）。バンクーバーのページではUBCの料金ページへのリンクを案内します。Ver.1.2まではPRの調査補助がUBCの寮ページ6件を取得していましたが、これを停止しました。",
    },
    reviewed: [page("https://www.ubc.ca/site/legal.html", "Terms of use: reserved rights, limited licence, robots clause"), page("https://www.ubc.ca/robots.txt", "crawl rules"), page("https://vancouver.housing.ubc.ca/robots.txt", "crawl rules (housing site)")],
  },
  "govuk-content": {
    sourceName: "GOV.UK (Content API)", sourceUrl: "https://www.gov.uk/", licenseUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    licence: "Open Government Licence v3.0 (except where otherwise stated on a page)",
    reuseStatus: "permitted", accessMethod: "open-api", automation: "allowed", lastReviewedAt: D, expertReview: false, restrictions: ["attribution-required"],
    attribution: "Contains public sector information licensed under the Open Government Licence v3.0.",
    reviewNotes: {
      en: "“To reuse content published on GOV.UK you must meet the conditions of the Open Government Licence.” The page lists the Content API among the APIs for reusing GOV.UK content and says “You can scrape GOV.UK as long as you respect our robots.txt policy. If you make too many requests, your access will be limited until your request rate drops.” The footer states “All content is available under the Open Government Licence v3.0, except where otherwise stated”; the terms page adds that “Most content on GOV.UK is subject to Crown copyright protection and is published under the OGL, which also sets out which content is exempt”, and that content not under the OGL is usually credited to its owner. robots.txt (read 2026-10-14) disallows only /*/print$ and /search/all* for all agents, so /api/content/ is allowed; no Crawl-delay applies to our agent. No numeric request limit is published, so the collector stays at two pages per run and honours robots.txt. The OGL exempts personal information, third-party rights, departmental logos and other IP; each collected record keeps its own licence line and stays unverified until a person approves it. Not read: the Content API documentation site.",
      ja: "「GOV.UKのコンテンツを再利用するには、オープン・ガバメント・ライセンス（OGL）の条件を満たす必要がある」。再利用向けAPIとしてContent APIが挙げられており、「robots.txtを守る限りGOV.UKをスクレイピングしてよい。リクエストが多すぎるとレートが下がるまでアクセスが制限される」とあります。フッターは「特に記載がない限り、すべてのコンテンツはOGL v3.0で利用できる」、利用規約は「大半のコンテンツはCrown copyrightで、OGLで公開されている。OGLの対象外の内容もある」と述べ、OGL外のコンテンツは通常、著作権者が明記されるとしています。robots.txt（2026-10-14確認）は全エージェントに /*/print$ と /search/all* のみを禁止しており、/api/content/ は許可、当方のエージェントにCrawl-delayはありません。数値のリクエスト上限は公表されていないため、収集は1回2ページに留め、robots.txtを守ります。OGLの対象外は個人情報・第三者の権利・省庁のロゴ等の知的財産です。収集した各記録はページごとのライセンス表示を持ち、人が承認するまで未確認のままです。未確認：Content APIのドキュメントサイト。",
    },
    reviewed: [page("https://www.gov.uk/help/reuse-govuk-content", "Reuse GOV.UK content: OGL, APIs, scraping and rate limiting (full)"), page("https://www.gov.uk/help/terms-conditions", "Terms and conditions: Crown copyright and OGL (full)"), page("https://www.gov.uk/robots.txt", "crawl rules")],
  },
  "canada-open-gov": {
    sourceName: "Open Government Canada (CKAN API)", sourceUrl: "https://open.canada.ca/", licenseUrl: "https://open.canada.ca/en/open-government-licence-canada",
    licence: "Open Government Licence – Canada 2.0, checked per dataset",
    reuseStatus: "permitted", accessMethod: "open-api", automation: "allowed", lastReviewedAt: D, expertReview: false, restrictions: ["attribution-required", "crawl-delay"],
    attribution: "Contains information licensed under the Open Government Licence – Canada.",
    reviewNotes: {
      en: "The Open Government Licence – Canada (version 2.0, read in full) grants a “worldwide, royalty-free, perpetual, non-exclusive licence to use the Information, including for commercial purposes”: copy, modify, publish, translate, adapt, distribute or otherwise use it for any lawful purpose, with the provider's attribution statement (default: “Contains information licensed under the Open Government Licence – Canada.”). It does not cover personal information, third-party rights the provider is not authorised to license, official names, crests and logos, or information under other IP rights, and it implies no endorsement. The licence applies to a dataset only if the dataset is offered under it, so the collector checks every dataset's CKAN licence (license_id ca-ogl-lgo, “Open Government Licence - Canada”, listed by license_list) and pauses collection of any dataset with another or no licence – that dataset only. The two pinned datasets were recorded under this licence in earlier live runs. The API page confirms the public CKAN API needs no key and supports GET only (the collector uses GET). robots.txt asks for “Crawl-delay: 20” and does not disallow /data/; the collector observes the delay. The terms page requested (open.canada.ca/en/terms-and-conditions) returned HTTP 404; the site footer links to https://www.canada.ca/en/transparency/terms.html, which was not re-read here. Only dataset metadata is stored; no figures are shown.",
      ja: "オープン・ガバメント・ライセンス – カナダ（バージョン2.0、全文を確認）は「世界的・無償・永続・非独占で、商用を含めて情報を使用する」ライセンスを認めています。合法的な目的であれば複製・改変・公表・翻訳・翻案・配布など自由に利用でき、提供者が指定する出典表示（既定は「Contains information licensed under the Open Government Licence – Canada.」）が必要です。個人情報、提供者が許諾する権限を持たない第三者の権利、公式の名称・紋章・ロゴ、他の知的財産権の対象は含まれず、公認を示唆する使い方も認められません。このライセンスはデータセットがそのライセンスで提供されている場合にのみ適用されるため、収集時にCKANが示す各データセットのライセンス（license_id ca-ogl-lgo、「Open Government Licence - Canada」。license_listで確認）を検査し、別のライセンスまたは表示なしのデータセットは、そのデータセットだけ収集を一時停止します。固定している2件のデータセットは、過去の実収集でこのライセンスと記録されています。APIページは、公開CKAN APIがキー不要でGETのみ対応と述べています（収集はGETのみ）。robots.txtは「Crawl-delay: 20」を求め、/data/ は禁止していません。収集はこの間隔を守ります。指定された利用規約ページ（open.canada.ca/en/terms-and-conditions）はHTTP 404でした。サイトのフッターが指す https://www.canada.ca/en/transparency/terms.html は今回は読んでいません。保存するのはデータセットのメタデータのみで、数値は表示しません。",
    },
    reviewed: [page("https://open.canada.ca/en/open-government-licence-canada", "Open Government Licence - Canada 2.0 (full)"), page("https://open.canada.ca/en/access-our-application-programming-interface-api", "CKAN API page (GET only, no key)"), page("https://open.canada.ca/robots.txt", "Crawl-delay: 20"), page("https://open.canada.ca/data/api/action/license_list", "licence list: ca-ogl-lgo = Open Government Licence - Canada")],
  },
  "ons-private-rents": {
    sourceName: "Office for National Statistics – Price Index of Private Rents (Manchester)", sourceUrl: "https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003", licenseUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    licence: "Open Government Licence v3.0 (ONS website terms)",
    reuseStatus: "permitted", accessMethod: "open-data-file", automation: "blocked", lastReviewedAt: D, expertReview: false, restrictions: ["attribution-required"],
    attribution: "Source: Office for National Statistics licensed under the Open Government Licence v3.0.",
    reviewNotes: {
      en: "ONS terms: “Most content on this website is subject to Crown copyright protection and is published under the Open Government Licence (OGL). Some content is exempt from the OGL”; the exemptions named are photographs, illustrations and videos under third-party licences, and “Reproduction of information is subject to the terms of the OGL and the UK Government Licensing Framework.” The Manchester page ends “All content is available under the Open Government Licence v3.0, except where otherwise stated” and credits the rent figures to “Price Index of Private Rents from the Office for National Statistics”; the house-price figures on the same page come from the UK House Price Index (ONS and HM Land Registry) and are not covered by this record. Scope seen on the page: Manchester local authority, average monthly private rent £1,373 for August 2026 (+4.2% on a year earlier), also by bedroom count and property type; monthly; “UK-level rent estimates for the latest two months … are provisional”. The full data is a monthly UK-wide xlsx (about 17.8 MB, latest edition 16 September 2026) on the dataset page, with a “Download data” link per chart. ONS has no robots.txt (HTTP 404) and the terms pages say nothing about automated access. Not confirmed: the release bulletin (HTTP 502 when read) and so the precise definition (new and existing tenancies) and underlying data credits; the source's own caveats must be read before a figure is published. No ONS figure is stored or shown, and no collector exists: this source is blocked for automation until a collector is written and reviewed.",
      ja: "ONSの利用規約：「このサイトの大半のコンテンツはCrown copyrightで、オープン・ガバメント・ライセンス（OGL）で公開されている。一部のコンテンツはOGLの対象外」。対象外として挙げられているのは第三者のライセンスによる写真・イラスト・動画で、「情報の複製はOGLと英国政府ライセンス枠組みの条件に従う」とされています。Manchesterのページは末尾で「特に記載がない限り、すべてのコンテンツはOGL v3.0で利用できる」と述べ、家賃の数値の出典を「Price Index of Private Rents（英国国家統計局）」としています。同じページの住宅価格は英国住宅価格指数（ONSとHM Land Registry）のもので、この記録の対象外です。ページで確認した範囲：Manchester地方自治体、2026年8月の平均月額民間家賃£1,373（前年同月比+4.2%）、寝室数別・物件タイプ別もあり、月次。「直近2か月の英国全体の家賃推計は暫定値」。全データは、データセットページにある英国全体の月次xlsx（約17.8MB、最新版は2026年9月16日）で、各グラフに「Download data」リンクがあります。ONSにはrobots.txtがなく（HTTP 404）、規約ページは自動アクセスについて何も述べていません。未確認：公表レポート（読み込み時はHTTP 502）のため、家賃の正確な定義（新規契約と既存契約）や元データのクレジットは確認できていません。数値を公開する前に、出典自身の注意書きを読む必要があります。ONSの数値は保存も表示もしておらず、収集ツールもありません。収集ツールを作って確認するまで、自動取得は停止のままです。",
    },
    reviewed: [page("https://www.ons.gov.uk/help/terms-conditions", "ONS website terms: Crown copyright, OGL, exemptions (full)"), page("https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003", "Manchester page: rent figures, sources, licence footer"), page("https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics", "dataset page: monthly xlsx editions"), page("https://www.ons.gov.uk/robots.txt", "HTTP 404 (no crawl rules)")],
  },
};
