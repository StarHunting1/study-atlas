/*
 * Reviewer aids for the 15 government claims (Ver.1.3.9). Nothing here changes what the site shows or any status: it only collects, per claim,
 * who/what the claim covers, how it differs from what was displayed before, and what a person must decide before approving. The wording of each
 * claim itself stays in data/countries.ts and the profiles (the approval sheet prints it from there).
 * Written from the claims' own conditions and review notes; no new research (the sources were last read on 2026-10-15 by GitHub Actions).
 */
export type Scope = {
  /** Nationality the claim applies to */ who: string;
  /** Length of stay / course */ stay: string;
  /** Visa class */ visa: string;
  /** How it differs from the earlier displayed wording (the claim text is what is displayed today) */ changed: string;
  /** What the approver must decide, beyond comparing the text with the page */ decide: string;
};
const OGL = "OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。";
export const SCOPE: Record<string, Scope> = {
  U1: { who: "国籍を問わず（国籍によりビザ/ETAが別途必要）", stay: "6か月以内のコース", visa: "訪問者（Standard Visitor）", changed: "Ver.1.3.4 で簡略化。例外（アカデミー・公立校・遠隔学習）は文言に入れていない", decide: `例外を文言に入れなくてよいか（簡略化であり誤りではないと判断）。${OGL}` },
  U2: { who: "国籍を問わず（国籍別の渡航認証は別）", stay: "英語コースで6か月超〜11か月", visa: "短期学習ビザ（Short-term study visa）", changed: "変更なし", decide: `18歳未満は別扱いである点を文言に入れなくてよいか。${OGL}` },
  U3: { who: "短期学習ビザの申請者", stay: "6か月超〜11か月の英語コース", visa: "短期学習ビザ", changed: "金額に確認日（2026-10-15）を併記済み", decide: `金額は変わりうる。確認日つきで掲載することでよいか（承認後も陳腐化するので、再確認の期限を決める）。${OGL}` },
  U4: { who: "国籍を問わず（16歳以上）", stay: "長期の学習（コースの期間だけでは決まらない）", visa: "Student visa", changed: "Ver.1.3.10 で文言を修正：「長いコース＝Student visa」と読める表現をやめ、licensed student sponsor・資金・英語力・年齢（16歳以上、16・17歳は保護者の同意）を明記。旧「学位取得も」は削除済み。申請料£558は画面に載せていない", decide: "修正後の文言を gov.uk/student-visa と照合。短いコースは U1・U2 の区分になる場合があると読めるか。OGL v3.0 の範囲で再利用可（出典表示）。" },
  U6: { who: "すべての申請者（国籍で要否が異なる）", stay: "—（渡航前の確認）", visa: "ビザ／電子渡航認証（ETA）", changed: "変更なし", decide: OGL },
  U5a: { who: "Student visa／短期学習ビザの申請者", stay: "ビザの期間による（年額）", visa: "Student visa／短期学習ビザ", changed: "Ver.1.3.10 で文言を修正：「IHSを支払えばNHSを利用できる」という無条件の表現をやめ、ビザの種類・期間・申請場所・個々の事情で支払いとNHS利用の扱いが異なることを明記。年£776／£1,035は維持", decide: "修正後の文言を料金ページと照合。金額は変わる。Planner には自動計上しない（承認後も同じ）。OGL v3.0 の範囲で再利用可（出典表示）。" },
  U5b: { who: "ビザ申請者（英国外／英国内で異なる）", stay: "6か月以内／6か月超〜1年未満", visa: "Student visa／短期学習ビザ", changed: "旧文言「訪問者の滞在にはIHSがなく保険が必要」は読んだページにない推論のため削除済み", decide: `同伴者・免除の規定に触れなくてよいか。${OGL}` },
  C1: { who: "国籍により eTA または訪問者ビザ（C2 参照）", stay: "6か月以内のプログラム", visa: "就学許可（study permit）不要／eTA・訪問者ビザ", changed: "Canada.ca の文章は引用せず言い換えのみ", decide: "Canada.ca の商用再利用が未確認。「言い換え＋リンク」で足りると判断して承認するか、書面で確認するか、リンクのみにするか。" },
  C2: { who: "査証免除国の国籍（それ以外は訪問者ビザなど）", stay: "6か月未満の学習", visa: "eTA（航空機で入国する場合）", changed: "変更なし", decide: "C1 と同じ（Canada.ca の再利用条件）。" },
  C3: { who: "国籍を問わず", stay: "6か月を超えるプログラム", visa: "就学許可（study permit）", changed: "旧文言「渡航前に申請」「学習を続ける可能性がある場合」は逐語の記載が確認できず、確認できた記載に置換。申請料の金額は載せていない", decide: "C1 と同じ（Canada.ca の再利用条件）。" },
  "C4-ref": { who: "—", stay: "—", visa: "—", changed: "StudyAtlas 自身の案内文で、出典ページの記述ではない", decide: "保留。承認せず、C4a〜C4c を承認するか、この文をリンクのみに書き換える。" },
  C4a: { who: "有効な就学許可を持つ国際学生（BC州）", stay: "年間で少なくとも6か月は州内に滞在", visa: "就学許可（study permit）", changed: "旧文言「6か月以上有効な就学許可」は不正確だったため Ver.1.3.4 で修正済み。金額（月75カナダドル）に確認日を併記", decide: "BC州の著作権は書面許可なしの複製・再配布を禁止。「事実の言い換え＋リンク」で足りるか、BC州に書面で確認するか。医療費は Planner に自動計上しない。" },
  C4b: { who: "成人の国際学生（未成年は脱退不可）", stay: "MSP 加入期間", visa: "就学許可（study permit）", changed: "変更なし", decide: "C4a と同じ（BC州の再利用条件）。脱退すると州の医療保険が使えない点を画面で伝えているか。" },
  C4c: { who: "MSP に加入する学生", stay: "居住開始月の残り＋2か月の待機", visa: "就学許可（study permit）", changed: "変更なし（保険の助言ではない）", decide: "C4a と同じ（BC州の再利用条件）。" },
};
/** Where the unresolved reuse terms can be confirmed. These are the publishers' own pages (not opened in this session; the reviewer should read them). */
export const TERMS_CHECK: { who: string; claims: string; pages: { label: string; url: string }[]; question: string }[] = [
  { who: "Canada.ca（IRCC）", claims: "C1・C2・C3", pages: [{ label: "Government of Canada – Terms and conditions", url: "https://www.canada.ca/en/transparency/terms.html" }], question: "短い事実を自分の言葉に言い換え、出典リンクを付けて商用サイトに載せてよいか（引用・転載はしない前提）。" },
  { who: "Province of British Columbia", claims: "C4a・C4b・C4c（C4-ref は保留）", pages: [{ label: "Province of BC – Copyright", url: "https://www2.gov.bc.ca/gov/content/home/copyright" }, { label: "Province of BC – Disclaimer", url: "https://www2.gov.bc.ca/gov/content/home/disclaimer" }], question: "料金・対象条件などの事実の言い換え＋出典リンクが、書面許可なしの複製・再配布に当たらないか。当たる場合は許可の申請先。" },
];
