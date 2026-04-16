export type NoteFilter = "all" | "pinned" | "recent";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  tags: string[];
}

export function createInitialNotes(): Note[] {
  const now = new Date().toISOString();

  return [
    {
      id: crypto.randomUUID(),
      title: "TypeScriptで最初に見るポイント",
      content:
        "type と interface を見比べる。関数の引数に型を書く。配列の中身にどんなオブジェクトが入るかを定義する。",
      createdAt: now,
      updatedAt: now,
      isPinned: true,
      tags: ["typescript", "study"],
    },
    {
      id: crypto.randomUUID(),
      title: "JSとの違いメモ",
      content:
        "JavaScript は実行時に値を見る。TypeScript は実行前に『どういう値のはずか』を確認する。エディタ補完が強くなる。",
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      tags: ["javascript", "comparison"],
    },
  ];
}
