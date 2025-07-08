# 🎨 DESIGN_GUIDELINE.md

このドキュメントは、`Project Template` のデザイン実装における HeroUI ベースの開発ガイドラインです。HeroUI コンポーネントライブラリ、Next.js、Tailwind CSS の最適な組み合わせで美しく一貫性のあるUIを構築します。

---

## 🎯 目的

- HeroUI コンポーネントの適切な使用方法の明示
- Figma → HeroUI 実装時のベストプラクティス
- 一貫性のあるデザインシステムの維持
- **AI実装時の HeroUI 活用精度向上**

---

## 🚫 AI実装時の絶対禁止事項

### HeroUI使用の原則
- **独自UIコンポーネントの新規作成は原則禁止**
- **HeroUIコンポーネントを最大限活用すること**
- **HeroUIのデザイントークンに従わない独自スタイルは禁止**

### 実装制限
- **標準HTMLタグの直接使用を制限**
  - ❌ `<button>`, `<input>`, `<select>` の直接使用
  - ✅ `<Button>`, `<Input>`, `<Select>` などのHeroUIコンポーネントを使用
- **独自CSS追加の制限**
  - HeroUIテーマシステムで解決できない場合のみ例外的に許可

---

## 📋 AI実装時のチェックリスト

### 実装前の確認事項
- [ ] 参照するFigmaデザインに対応するHeroUIコンポーネントを確認
- [ ] 必要なカスタマイズがHeroUIテーマシステムで実現可能か確認
- [ ] HeroUIのvariant、size、colorプロパティで要件を満たせるか確認
- [ ] レスポンシブ対応の方針を確認

### 実装中の確認事項
- [ ] すべてのUIコンポーネントがHeroUI製かを確認
- [ ] 色指定がHeroUIのcolor propまたはテーマカラーを使用しているか
- [ ] サイズ指定がHeroUIのsize propを使用しているか
- [ ] バリアント指定がHeroUIのvariant propを使用しているか

### 実装後の確認事項
- [ ] Figmaデザインとの視覚的一致を確認
- [ ] レスポンシブ表示が正しく動作するか
- [ ] アクセシビリティが適切に機能するか（HeroUIのデフォルト機能含む）

---

## 🎨 HeroUI コンポーネント活用ガイド

### 基本的な使用パターン

```tsx
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  CardHeader,
  Chip,
  Avatar
} from "@heroui/react";

// ✅ 推奨: HeroUIコンポーネントの基本使用
<Button color="primary" variant="solid" size="md">
  送信
</Button>

<Input
  type="email"
  label="メールアドレス"
  placeholder="you@example.com"
  variant="bordered"
/>

<Card className="max-w-[400px]">
  <CardHeader className="flex gap-3">
    <Avatar src="user.jpg" />
    <div className="flex flex-col">
      <p className="text-md">ユーザー名</p>
      <p className="text-small text-default-500">@username</p>
    </div>
  </CardHeader>
  <CardBody>
    <p>カードの内容がここに表示されます。</p>
  </CardBody>
</Card>
```

### カラーシステム

HeroUIの標準カラーパレットを使用：

```tsx
// プライマリカラー（ブランドカラー）
<Button color="primary">プライマリ</Button>

// セマンティックカラー
<Button color="success">成功</Button>
<Button color="warning">警告</Button>
<Button color="danger">エラー</Button>

// ニュートラルカラー
<Button color="default">デフォルト</Button>
<Button color="secondary">セカンダリ</Button>
```

### サイズシステム

```tsx
// 統一されたサイズ指定
<Button size="sm">小</Button>
<Button size="md">中（デフォルト）</Button>
<Button size="lg">大</Button>

<Input size="sm" />
<Input size="md" />
<Input size="lg" />
```

### バリアントシステム

```tsx
// ボタンバリアント
<Button variant="solid">ソリッド</Button>
<Button variant="bordered">ボーダー</Button>
<Button variant="light">ライト</Button>
<Button variant="flat">フラット</Button>
<Button variant="faded">フェード</Button>
<Button variant="shadow">シャドウ</Button>
<Button variant="ghost">ゴースト</Button>

// インプットバリアント
<Input variant="flat" />
<Input variant="bordered" />
<Input variant="faded" />
<Input variant="underlined" />
```

---

## � テーマカスタマイズ

### HeroUIProvider設定

`src/app/providers.tsx` での基本設定：

```tsx
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}
```

### Tailwind CSS設定

`tailwind.config.js` での HeroUI 統合：

```js
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
```

### カスタムテーマの適用

```tsx
import { HeroUIProvider } from "@heroui/react";

const customTheme = {
  extend: "dark", // base theme
  colors: {
    primary: {
      50: "#eff6ff",
      500: "#3b82f6",
      900: "#1e3a8a",
      DEFAULT: "#3b82f6",
    },
  },
};

<HeroUIProvider theme={customTheme}>
  {children}
</HeroUIProvider>
```

---

## 🧩 コンポーネント使い分けガイド

### フォーム関連

| 用途 | HeroUIコンポーネント | 使用例 |
|------|---------------------|--------|
| テキスト入力 | `Input` | ユーザー名、メール |
| パスワード入力 | `Input type="password"` | ログインフォーム |
| 長文入力 | `Textarea` | コメント、説明文 |
| 選択肢 | `Select` | 国選択、カテゴリ選択 |
| 複数選択 | `CheckboxGroup` | 興味・関心選択 |
| 単一選択 | `RadioGroup` | 性別、プラン選択 |
| オン/オフ切替 | `Switch` | 通知設定、プライバシー |

### ナビゲーション関連

| 用途 | HeroUIコンポーネント | 使用例 |
|------|---------------------|--------|
| メインボタン | `Button` | 送信、保存、削除 |
| アイコンボタン | `Button isIconOnly` | いいね、共有、メニュー |
| リンクボタン | `Button as={Link}` | ページ遷移 |
| ナビゲーション | `Navbar` | ヘッダーナビ |
| タブ切替 | `Tabs` | 設定画面、ダッシュボード |
| パンくずリスト | `Breadcrumbs` | ページ階層表示 |

### データ表示関連

| 用途 | HeroUIコンポーネント | 使用例 |
|------|---------------------|--------|
| カード表示 | `Card` | 投稿、プロフィール |
| リスト表示 | `Listbox` | メニュー、選択肢 |
| テーブル | `Table` | データ一覧 |
| ユーザー情報 | `User` | プロフィール表示 |
| アバター | `Avatar` | ユーザー画像 |
| タグ・ラベル | `Chip` | カテゴリ、ステータス |

### フィードバック関連

| 用途 | HeroUIコンポーネント | 使用例 |
|------|---------------------|--------|
| 読み込み表示 | `Spinner`, `CircularProgress` | データ取得中 |
| 通知・アラート | `Alert` (カスタム実装推奨) | エラー、成功メッセージ |
| モーダル | `Modal` | 確認ダイアログ、詳細表示 |
| ツールチップ | `Tooltip` | 補助説明 |
| ポップオーバー | `Popover` | 追加情報表示 |

---

## 🎯 アイコンシステム

### Material UI Icons - 標準アイコンライブラリ

このプロジェクトでは **Material UI Icons** を標準アイコンライブラリとして使用します。一貫性とデザイン品質の維持のため、アイコンが必要な場合は Material UI Icons を優先的に使用してください。

#### 基本的な使用方法

```tsx
import { 
  Home,
  Search,
  Settings,
  AccountCircle,
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  Check,
  Close
} from "@mui/icons-material";

// ✅ HeroUIボタンと組み合わせた使用
<Button 
  color="primary" 
  startContent={<Save />}
>
  保存
</Button>

<Button 
  color="danger" 
  variant="bordered"
  startContent={<Delete />}
>
  削除
</Button>

// ✅ アイコンのみのボタン
<Button 
  isIconOnly 
  color="primary" 
  variant="light"
  aria-label="設定"
>
  <Settings />
</Button>

// ✅ インプットとの組み合わせ
<Input
  type="search"
  placeholder="検索..."
  startContent={<Search />}
  variant="bordered"
/>
```

#### アイコンサイズとスタイリング

```tsx
// サイズ調整
<Home fontSize="small" />     // 20px
<Home fontSize="medium" />    // 24px (デフォルト)
<Home fontSize="large" />     // 35px

// カスタムサイズ
<Home sx={{ fontSize: 16 }} />
<Home style={{ fontSize: '18px' }} />

// カラー調整（Tailwind CSS使用時）
<Settings className="text-primary-500" />
<Delete className="text-danger-500" />
<Check className="text-success-500" />
```

#### HeroUIコンポーネントとの統合

```tsx
// ✅ Navbar での使用
<Navbar>
  <NavbarContent>
    <NavbarItem>
      <Button isIconOnly variant="light">
        <Home />
      </Button>
    </NavbarItem>
  </NavbarContent>
</Navbar>

// ✅ Card での使用
<Card>
  <CardHeader className="flex gap-3">
    <Avatar icon={<AccountCircle />} />
    <div className="flex flex-col">
      <p className="text-md">ユーザー設定</p>
    </div>
  </CardHeader>
</Card>

// ✅ Chip での使用
<Chip
  startContent={<Check />}
  color="success"
  variant="flat"
>
  完了
</Chip>
```

### よく使用されるアイコンカテゴリ

#### ナビゲーション・UI基本
```tsx
import {
  Home,           // ホーム
  ArrowBack,      // 戻る
  ArrowForward,   // 進む
  Menu,           // メニュー
  Close,          // 閉じる
  ExpandMore,     // 展開
  ExpandLess,     // 折りたたみ
  MoreVert,       // その他（縦3点）
  MoreHoriz       // その他（横3点）
} from "@mui/icons-material";
```

#### アクション系
```tsx
import {
  Add,            // 追加
  Edit,           // 編集
  Delete,         // 削除
  Save,           // 保存
  Cancel,         // キャンセル
  Check,          // チェック
  Refresh,        // 更新
  Download,       // ダウンロード
  Upload,         // アップロード
  Share           // 共有
} from "@mui/icons-material";
```

#### データ・ファイル系
```tsx
import {
  Search,         // 検索
  FilterList,     // フィルター
  Sort,           // ソート
  Folder,         // フォルダ
  InsertDriveFile,// ファイル
  Image,          // 画像
  VideoFile,      // 動画
  AudioFile       // 音声
} from "@mui/icons-material";
```

#### ユーザー・認証系
```tsx
import {
  AccountCircle,  // アカウント
  Person,         // ユーザー
  Group,          // グループ
  Settings,       // 設定
  Lock,           // ロック
  LockOpen,       // ロック解除
  Visibility,     // 表示
  VisibilityOff,  // 非表示
  Login,          // ログイン
  Logout          // ログアウト
} from "@mui/icons-material";
```

#### 通知・ステータス系
```tsx
import {
  Notifications,     // 通知
  NotificationsOff,  // 通知オフ
  Warning,           // 警告
  Error,             // エラー
  CheckCircle,       // 成功
  Info,              // 情報
  Help,              // ヘルプ
  Star,              // お気に入り
  StarBorder         // お気に入り（空）
} from "@mui/icons-material";
```

### アイコン使用時の注意事項

#### ✅ 推奨事項
- **Material UI Iconsを最優先で使用**
- **HeroUIコンポーネントのpropsでサイズ指定** (`size="sm"`, `size="md"`, `size="lg"`)
- **意味的に適切なアイコンの選択**（例：削除には`Delete`、編集には`Edit`）
- **aria-label の適切な設定**（アクセシビリティ向上）
- **一貫したアイコンスタイル**（同じUIエリア内で統一されたサイズ・色）

#### ❌ 禁止事項
- **複数のアイコンライブラリの混在使用**
- **Material UI Icons以外のアイコンライブラリの新規追加**
- **独自SVGアイコンの作成**（Material UI Iconsで代替可能な場合）
- **不適切なサイズ指定**（UIの一貫性を損なう極端なサイズ）

#### 例外ケース
以下の場合のみ、他のアイコンライブラリまたは独自アイコンの使用を認める：
- **ブランド固有のアイコン**（企業ロゴ、サービス固有アイコン）
- **Material UI Iconsに存在しない専門的なアイコン**
- **デザインシステムで明確に定義された独自アイコン**

### パフォーマンス最適化

```tsx
// ✅ 必要なアイコンのみインポート
import { Save, Delete, Edit } from "@mui/icons-material";

// ❌ 全体インポートは避ける
import * as Icons from "@mui/icons-material";

// ✅ 動的インポート（大量のアイコンを使用する場合）
const DynamicIcon = dynamic(() => import("@mui/icons-material/Settings"), {
  loading: () => <div className="w-6 h-6 bg-gray-200 rounded" />,
});
```

### TypeScript型定義

```tsx
import { SvgIconProps } from "@mui/icons-material";

// アイコンコンポーネントの型定義
interface IconButtonProps {
  icon: React.ComponentType<SvgIconProps>;
  label: string;
  onClick: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, label, onClick }) => (
  <Button 
    isIconOnly 
    variant="light" 
    aria-label={label}
    onPress={onClick}
  >
    <Icon />
  </Button>
);

// 使用例
<IconButton 
  icon={Settings} 
  label="設定を開く" 
  onClick={() => console.log('設定画面を開く')} 
/>
```

---

## 📱 レスポンシブデザイン対応

### HeroUI + Tailwind CSSの組み合わせ

```tsx
// レスポンシブなボタンサイズ
<Button 
  size="sm" 
  className="md:size-md lg:size-lg"
>
  レスポンシブボタン
</Button>

// レスポンシブなカードレイアウト
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="max-w-full">
    {/* カード内容 */}
  </Card>
</div>

// レスポンシブなナビゲーション
<Navbar 
  isBordered
  className="md:px-6"
  classNames={{
    wrapper: "max-w-full md:max-w-7xl"
  }}
>
  {/* ナビゲーション内容 */}
</Navbar>
```

### ブレークポイント設定

Tailwind CSSの標準ブレークポイントを使用：

```css
/* モバイルファースト */
.responsive-component {
  /* デフォルト（モバイル） */
  @apply text-sm;
  
  /* タブレット以上 */
  @apply md:text-base;
  
  /* デスクトップ以上 */
  @apply lg:text-lg;
}
```

---

## 🎨 デザインパターン

### 一般的なレイアウトパターン

#### 1. カード型レイアウト
```tsx
<Card className="max-w-[400px]">
  <CardHeader>
    <h4 className="text-large font-bold">タイトル</h4>
  </CardHeader>
  <CardBody className="px-3 py-0 text-small text-default-400">
    <p>説明文がここに入ります。</p>
  </CardBody>
  <CardFooter className="gap-3">
    <Button color="primary" variant="flat" size="sm">
      アクション1
    </Button>
    <Button color="primary" size="sm">
      アクション2
    </Button>
  </CardFooter>
</Card>
```

#### 2. フォームレイアウト
```tsx
<div className="flex flex-col gap-4 max-w-md">
  <Input
    type="email"
    label="メールアドレス"
    placeholder="you@example.com"
    variant="bordered"
  />
  <Input
    type="password"
    label="パスワード"
    placeholder="パスワードを入力"
    variant="bordered"
  />
  <div className="flex gap-2 justify-end">
    <Button color="danger" variant="flat">
      キャンセル
    </Button>
    <Button color="primary">
      ログイン
    </Button>
  </div>
</div>
```

#### 3. ナビゲーションレイアウト
```tsx
<Navbar isBordered>
  <NavbarContent>
    <NavbarBrand>
      <p className="font-bold text-inherit">PROJECT</p>
    </NavbarBrand>
  </NavbarContent>

  <NavbarContent className="hidden sm:flex gap-4" justify="center">
    <NavbarItem>
      <Link color="foreground" href="/home">
        ホーム
      </Link>
    </NavbarItem>
    <NavbarItem>
      <Link color="foreground" href="/about">
        概要
      </Link>
    </NavbarItem>
  </NavbarContent>

  <NavbarContent justify="end">
    <NavbarItem>
      <Button as={Link} color="primary" href="/login" variant="flat">
        ログイン
      </Button>
    </NavbarItem>
  </NavbarContent>
</Navbar>
```

---

## ❌ よくある間違い

### 間違った実装例
```tsx
// ❌ 標準HTMLタグの直接使用
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  ボタン
</button>

// ❌ 独自コンポーネントの作成
const CustomButton = ({ children }) => (
  <div className="custom-button-styles">
    {children}
  </div>
);

// ❌ HeroUIの機能を無視したスタイリング
<Button className="!bg-red-500 !text-white">
  色を強制上書き
</Button>
```

### 正しい実装例
```tsx
// ✅ HeroUIコンポーネントの適切な使用
<Button color="primary" variant="solid">
  ボタン
</Button>

// ✅ HeroUIのpropsを活用
<Button 
  color="danger"
  variant="bordered"
  size="lg"
  startContent={<DeleteIcon />}
>
  削除
</Button>

// ✅ 必要に応じたカスタマイズ
<Button 
  color="primary"
  className="font-bold"
  classNames={{
    base: "bg-gradient-to-r from-blue-500 to-purple-500"
  }}
>
  グラデーションボタン
</Button>
```

---

## � パフォーマンス最適化

### Tree Shaking対応
```tsx
// ✅ 必要なコンポーネントのみインポート
import { Button, Input, Card } from "@heroui/react";

// ❌ 全体インポートは避ける
import * as HeroUI from "@heroui/react";
```

### 動的インポート
```tsx
// 大きなコンポーネントは動的インポート
const DataTable = dynamic(() => import("@heroui/react").then(mod => mod.Table), {
  loading: () => <Spinner />,
});
```

---

## 🤖 AI実装時の追加ルール

### 基本方針
- **HeroUIコンポーネントファーストの開発**
- **Figmaデザインをそのままコードに落とし込む際も、可能な限りHeroUIで実現**
- **カスタマイズが必要な場合は、HeroUIのテーマシステムを優先活用**

### AI指示の効果的なパターン
```bash
# 新規UI実装時
HeroUIコンポーネントを使用して、[具体的な内容]を実装してください。
可能な限りvariant、size、colorプロパティで要件を満たしてください。
アイコンが必要な場合は、Material UI Iconsを使用してください。

# 既存UI更新時  
既存の独自コンポーネントを、対応するHeroUIコンポーネントに置き換えてください。
デザインの一貫性を保ちながら、HeroUIの機能を最大限活用してください。
アイコンはMaterial UI Iconsで統一してください。

# カスタマイズが必要な場合
HeroUIのテーマシステムまたはclassNamesプロパティを使用して、
[具体的な要件]を実現してください。独自CSSの追加は最小限に留めてください。

# アイコン実装時
Material UI Iconsから適切なアイコンを選択し、HeroUIコンポーネントと組み合わせて使用してください。
意味的に適切なアイコンを選択し、aria-labelでアクセシビリティを確保してください。
```

### アイコン実装時の確認事項
- [ ] **Material UI Iconsを使用しているか**
- [ ] **意味的に適切なアイコンを選択しているか**
- [ ] **HeroUIコンポーネントと適切に統合されているか**
- [ ] **aria-labelが設定されているか**（アイコンのみボタンの場合）
- [ ] **UIエリア内でアイコンサイズが統一されているか**
- [ ] **必要なアイコンのみインポートしているか**（パフォーマンス確保）

---

## 📚 参考リソース

### 公式ドキュメント
- [HeroUI Documentation](https://www.heroui.com/)
- [HeroUI Components](https://www.heroui.com/docs/components)
- [HeroUI Theming](https://www.heroui.com/docs/customization/theme)

### 実装例とテンプレート
- [HeroUI Templates](https://www.heroui.com/templates)
- [HeroUI Examples](https://www.heroui.com/examples)

---

## ✅ 今後の方針

- **HeroUIベースの継続的改善**: 新機能リリースに合わせてコンポーネント選択を最適化
- **デザインシステムの拡張**: プロジェクト固有の要件に合わせたテーマカスタマイズ
- **パフォーマンス監視**: Bundle sizeとレンダリング性能の継続的な監視
- **アクセシビリティの向上**: HeroUIの標準機能を活用したアクセシブルなUI構築

---

以上が `Project Template` における HeroUI ベースのデザイン実装ガイドラインです。
美しく一貫性があり、アクセシブルなUIを効率的に構築するために継続的に改善していきます ✨
