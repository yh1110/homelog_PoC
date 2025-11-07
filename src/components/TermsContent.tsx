const TermsContent = () => {
  return (
    <div className="space-y-6 text-sm text-foreground leading-relaxed">
      <section>
        <h1 className="text-xl font-bold mb-4 text-center">
          テスト利用に関する同意事項
        </h1>
        <p className="mb-4">
          本アプリ（以下、「本アプリ」といいます。）は、株式会社
          TreyLink（以下、「当社」といいます。）が開発中の「Home-LOG」のテスト版（ベータ版）です。
          <br />
          本アプリのテスト利用にあたり、以下の事項に同意の上、ご利用ください。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">1. テストの目的について</h2>
        <p>
          本アプリは、正式リリース前のテスト版であり、サービスの機能改善、AI
          の精度向上、および不具合の検出を目的としています。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">2. 取得する情報</h2>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Google アカウントによる認証情報（メールアドレス等）</li>
          <li>
            お客様が本アプリにアップロードする全ての画像（製品、レシート、保証書、外観写真など）
          </li>
          <li>
            お客様が本アプリに入力する全ての情報（製品名、メーカー、型番、購入日、価格など）
          </li>
          <li>
            上記の情報（レシートや保証書に含まれうる氏名・住所・電話番号等の個人情報を含みます）
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">3. 情報の利用目的</h2>
        <p className="mb-2">当社は、取得した情報を以下の目的で利用します。</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>本アプリの機能を提供するため</li>
          <li>
            本サービスの品質向上、AI の精度向上のための分析・調査に利用するため
          </li>
          <li>本アプリの不具合修正や機能改善に役立てるため</li>
          <li>
            テストに関するフィードバック（インタビュー等）をお願いするためのご連絡のため
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">4. 個人情報の取り扱い</h2>
        <p>
          取得した個人情報は、上記利用目的の範囲内で適切に管理し、法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">5. 禁止事項（遵守事項）</h2>
        <p className="mb-2">本アプリの利用にあたり、以下の行為を禁止します。</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            お客様ご自身の所有または管理するものではない物品の情報を登録する行為
          </li>
          <li>
            お客様ご自身のものではない個人情報（ご家族以外の他人の氏名・住所・顔写真など）や、
            許可なく撮影した他人の家屋・所有物などが写り込んだ画像をアップロードする行為
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">6. 免責・非保証事項</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium mb-2">（AI の精度について）</h3>
            <p>
              AI による自動入力（製品名、メーカー、型番、公式サイト
              URL、マニュアル URL 等）は、
              内容の正確性、完全性、最新性を保証するものではありません。
              登録内容は必ずご自身で確認・修正してください。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">（データの安全性について）</h3>
            <p>
              テスト版のため、登録されたデータが、予期せぬ不具合やテスト終了等により、
              予告なく変更、アクセス不能、または消失する可能性があります。
              重要なデータのバックアップはご自身で行ってください。
            </p>
          </div>
          <div>
            <p className="font-medium">
              当社は、本アプリの利用によって生じたいかなる損害についても、一切の責任を負いません。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsContent;
