# fivem-typescript-sourcemap-support

高品質なTypeScriptデバッギング体験を提供するFiveM専用ソースマップサポートライブラリです。

## 🚀 簡単インストール

### 1. パッケージのインストール

```bash
# pnpmを使用（推奨）
pnpm add typescript-sourcemap-support

# または npm
npm install typescript-sourcemap-support
```

### 2. 使用方法

```typescript
// src/server/index.ts の最上部に追加
import { initializeSourceMapSupport } from 'typescript-sourcemap-support';

// ソースマップサポートを初期化
initializeSourceMapSupport({ debug: true });

// 以降は通常のコード...
console.log('サーバー開始');
```

### 3. FiveM設定

`fxmanifest.lua`に以下を追加：

```lua
-- ★重要★ ソースマップファイルを読み込み
files {
    'build/server/**/*.js.map',
    'build/client/**/*.js.map'
}
```

## 🔧 設定例

### TypeScript設定 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "sourceRoot": "../src",
    "outDir": "./build"
  }
}
```

### FiveM設定 (`fxmanifest.lua`)

```lua
fx_version 'cerulean'
game 'gta5'

server_scripts { 'build/server/**/*.js' }
client_scripts { 'build/client/**/*.js' }

-- ★重要★ ソースマップファイルを明示的に読み込み
files {
    'build/server/**/*.js.map',
    'build/client/**/*.js.map'
}
```

## 📊 効果の比較

### 従来のスタックトレース
```
Error: カスタムエラー
    at throwError (@your-resource/build/server/index.js:45:11)
    at Object.callback (@your-resource/build/server/index.js:78:17)
```

### ソースマップサポート適用後
```
Error: カスタムエラー
    at throwError (src/server/index.ts:120:11)    ← TypeScriptファイル！
    at <anonymous> (src/server/index.ts:156:17)   ← 正確な行番号！
```

## 🛠️ API リファレンス

### `initializeSourceMapSupport(options?)`

ソースマップサポートを初期化します。

```typescript
import { initializeSourceMapSupport } from 'fivem-typescript-sourcemap';

// 基本的な使用方法
initializeSourceMapSupport();

// デバッグモード有効
initializeSourceMapSupport({ debug: true });
```

### `enableDebugMode()` / `disableDebugMode()`

デバッグモードの切り替え：

```typescript
import { enableDebugMode, disableDebugMode } from 'fivem-typescript-sourcemap';

enableDebugMode();  // 詳細ログを有効化
disableDebugMode(); // 詳細ログを無効化
```

### `clearSourceMapCache()`

ソースマップキャッシュをクリア：

```typescript
import { clearSourceMapCache } from 'fivem-typescript-sourcemap';

clearSourceMapCache(); // 開発時のホットリロードに有効
```

## 🧪 テスト用コード

動作確認用のテストコード：

```typescript
RegisterCommand('test-sourcemap', () => {
  try {
    const testFunction = () => {
      throw new Error('ソースマップテストエラー');
    };
    testFunction();
  } catch (error) {
    console.error('スタックトレース（TypeScript行番号が表示されます）:');
    console.error(error.stack);
  }
}, false);
```

## 🚨 トラブルシューティング

### ソースマップが機能しない場合

1. **fxmanifest.lua確認**:
   ```lua
   files {
       'build/**/*.js.map'  -- これが含まれているか確認
   }
   ```

2. **TypeScriptビルド確認**:
   ```bash
   # .js.mapファイルが生成されているか確認
   ls -la build/server/*.js.map
   ```

3. **デバッグモード有効化**:
   ```typescript
   initializeSourceMapSupport({ debug: true });
   ```

### よくある問題

| 問題 | 解決方法 |
|------|----------|
| 行番号が正しくない | `sourceRoot`設定を確認 |
| ファイルパスが間違っている | `fxmanifest.lua`の`files`設定を確認 |
| パフォーマンス問題 | 本番環境では`debug: false`に設定 |



## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

---
