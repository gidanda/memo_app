# memo_app

JavaScript の基礎を土台にしながら、TypeScript を実際に書いて学ぶためのメモアプリです。

## 使う技術

- TypeScript
- Vite
- DOM API
- localStorage

## はじめ方

```bash
npm install
npm run dev
```

## 学習ポイント

### 1. 型をどこに置くか

[`src/types.ts`](/Users/goudayuuki/dev/memo_app/src/types.ts) では、メモ1件の形を `interface Note` で定義しています。

JavaScript では「メモはたぶんこういう形」と頭の中で管理しますが、TypeScript ではコードに明示します。

### 2. `unknown` から安全に値を取り出す

[`src/storage.ts`](/Users/goudayuuki/dev/memo_app/src/storage.ts) では、`localStorage` から読んだ JSON をいきなり信用せず、`isNote` で中身を確認しています。

これは「実行時に入ってきた値」を扱う時の TypeScript の基本です。

### 3. 状態を1か所にまとめる

[`src/main.ts`](/Users/goudayuuki/dev/memo_app/src/main.ts) では、`AppState` にアプリ全体の状態をまとめています。

- `notes`: メモ一覧
- `selectedId`: 今開いているメモ
- `filter`: 表示条件
- `searchText`: 検索文字列

複雑なプロジェクトでも、まず「どこに状態があるか」を見つけるのが重要です。

### 4. JSからTSへ移る時に見るべき書き方

次の構文に注目すると学びやすいです。

- `const root = document.querySelector<HTMLDivElement>("#app")`
- `type AppState = { ... }`
- `function updateSelectedNote(patch: Partial<Pick<Note, "title" | "content">>)`
- `const filter = button.dataset.filter as NoteFilter | undefined`

## おすすめの読み順

1. [`src/types.ts`](/Users/goudayuuki/dev/memo_app/src/types.ts) でデータの形を見る
2. [`src/storage.ts`](/Users/goudayuuki/dev/memo_app/src/storage.ts) で保存処理を見る
3. [`src/main.ts`](/Users/goudayuuki/dev/memo_app/src/main.ts) で状態更新と画面描画を読む
4. [`src/style.css`](/Users/goudayuuki/dev/memo_app/src/style.css) で UI を確認する

## 次にやると良い拡張

- タグ編集機能を追加する
- メモを Markdown で書けるようにする
- `Note` を `class` で表現した場合との違いを比べる
- 将来的に React + TypeScript へ移植してみる
