import "./style.css";
import { createInitialNotes, type Note, type NoteFilter } from "./types";
import { loadNotes, saveNotes } from "./storage";
import { formatDate } from "./utils/date";

type AppState = {
  notes: Note[];
  selectedId: string | null;
  filter: NoteFilter;
  searchText: string;
};

const root = getRootElement();

const initialNotes = loadNotes();

const state: AppState = {
  notes: initialNotes.length > 0 ? initialNotes : createInitialNotes(),
  selectedId: initialNotes[0]?.id ?? null,
  filter: "all",
  searchText: "",
};

if (!state.selectedId && state.notes.length > 0) {
  state.selectedId = state.notes[0].id;
}

function setState(updater: (current: AppState) => AppState) {
  const nextState = updater(state);
  state.notes = nextState.notes;
  state.selectedId = nextState.selectedId;
  state.filter = nextState.filter;
  state.searchText = nextState.searchText;
  saveNotes(state.notes);
  render();
}

function createNote(): Note {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "新しいメモ",
    content: "",
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    tags: [],
  };
}

function updateSelectedNote(patch: Partial<Pick<Note, "title" | "content">>) {
  if (!state.selectedId) return;

  setState((current) => ({
    ...current,
    notes: current.notes.map((note) =>
      note.id === current.selectedId
        ? {
            ...note,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : note,
    ),
  }));
}

function togglePinned(noteId: string) {
  setState((current) => ({
    ...current,
    notes: current.notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            isPinned: !note.isPinned,
            updatedAt: new Date().toISOString(),
          }
        : note,
    ),
  }));
}

function deleteSelectedNote() {
  if (!state.selectedId) return;

  setState((current) => {
    const remainingNotes = current.notes.filter((note) => note.id !== current.selectedId);

    return {
      ...current,
      notes: remainingNotes,
      selectedId: remainingNotes[0]?.id ?? null,
    };
  });
}

function getVisibleNotes(notes: Note[], filter: NoteFilter, searchText: string) {
  return notes
    .filter((note) => {
      if (filter === "pinned") return note.isPinned;
      if (filter === "recent") {
        const lastUpdated = new Date(note.updatedAt).getTime();
        const threeDays = 1000 * 60 * 60 * 24 * 3;
        return Date.now() - lastUpdated < threeDays;
      }

      return true;
    })
    .filter((note) => {
      const query = searchText.trim().toLowerCase();
      if (!query) return true;

      return [note.title, note.content, note.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

function render() {
  const visibleNotes = getVisibleNotes(state.notes, state.filter, state.searchText);
  const selectedNote =
    state.notes.find((note) => note.id === state.selectedId) ?? visibleNotes[0] ?? null;

  if (!state.selectedId && selectedNote) {
    state.selectedId = selectedNote.id;
  }

  root.innerHTML = `
    <main class="layout">
      <section class="sidebar">
        <div class="sidebar__hero">
          <p class="eyebrow">Learn TypeScript with UI state</p>
          <h1>Memo Studio</h1>
          <p class="sidebar__copy">
            配列、型、イベント、ローカル保存をまとめて学ぶための小さなメモアプリです。
          </p>
        </div>

        <div class="toolbar">
          <button class="primary-button" data-action="create">+ メモを追加</button>
          <input
            class="search-input"
            data-role="search"
            type="search"
            placeholder="タイトル・本文を検索"
            value="${escapeHtml(state.searchText)}"
          />
        </div>

        <div class="filters">
          ${renderFilterButton("all", "すべて")}
          ${renderFilterButton("pinned", "ピン留め")}
          ${renderFilterButton("recent", "3日以内")}
        </div>

        <ul class="note-list">
          ${
            visibleNotes.length > 0
              ? visibleNotes
                  .map(
                    (note) => `
                      <li>
                        <button
                          class="note-card ${note.id === selectedNote?.id ? "is-active" : ""}"
                          data-action="select"
                          data-note-id="${note.id}"
                        >
                          <span class="note-card__top">
                            <strong>${escapeHtml(note.title)}</strong>
                            <span>${note.isPinned ? "📌" : ""}</span>
                          </span>
                          <span class="note-card__body">${escapeHtml(excerpt(note.content))}</span>
                          <span class="note-card__meta">${formatDate(note.updatedAt)}</span>
                        </button>
                      </li>
                    `,
                  )
                  .join("")
              : `<li class="empty-list">条件に一致するメモはありません。</li>`
          }
        </ul>
      </section>

      <section class="editor">
        ${
          selectedNote
            ? `
              <div class="editor__header">
                <div>
                  <p class="eyebrow">Selected memo</p>
                  <p class="editor__timestamp">更新: ${formatDate(selectedNote.updatedAt)}</p>
                </div>
                <div class="editor__actions">
                  <button class="secondary-button" data-action="toggle-pin" data-note-id="${selectedNote.id}">
                    ${selectedNote.isPinned ? "ピンを外す" : "ピン留めする"}
                  </button>
                  <button class="danger-button" data-action="delete">削除</button>
                </div>
              </div>

              <label class="field">
                <span>タイトル</span>
                <input
                  class="title-input"
                  data-role="title"
                  type="text"
                  value="${escapeHtml(selectedNote.title)}"
                />
              </label>

              <label class="field field--grow">
                <span>本文</span>
                <textarea class="content-input" data-role="content">${escapeHtml(selectedNote.content)}</textarea>
              </label>
            `
            : `
              <div class="empty-editor">
                <h2>メモがありません</h2>
                <p>左上の「メモを追加」から最初のメモを作成してください。</p>
              </div>
            `
        }
      </section>
    </main>
  `;

  bindEvents();
}

function bindEvents() {
  root.querySelector('[data-action="create"]')?.addEventListener("click", () => {
    const note = createNote();

    setState((current) => ({
      ...current,
      notes: [note, ...current.notes],
      selectedId: note.id,
    }));
  });

  root.querySelectorAll<HTMLElement>("[data-action='select']").forEach((button) => {
    button.addEventListener("click", () => {
      const noteId = button.dataset.noteId;
      if (!noteId) return;

      setState((current) => ({
        ...current,
        selectedId: noteId,
      }));
    });
  });

  root.querySelectorAll<HTMLElement>("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter as NoteFilter | undefined;
      if (!filter) return;

      setState((current) => ({
        ...current,
        filter,
      }));
    });
  });

  root.querySelector('[data-role="search"]')?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;

    setState((current) => ({
      ...current,
      searchText: target.value,
    }));
  });

  root.querySelector('[data-role="title"]')?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    updateSelectedNote({ title: target.value });
  });

  root.querySelector('[data-role="content"]')?.addEventListener("input", (event) => {
    const target = event.target as HTMLTextAreaElement;
    updateSelectedNote({ content: target.value });
  });

  root.querySelector('[data-action="toggle-pin"]')?.addEventListener("click", (event) => {
    const target = event.currentTarget as HTMLButtonElement;
    const noteId = target.dataset.noteId;
    if (!noteId) return;
    togglePinned(noteId);
  });

  root.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
    deleteSelectedNote();
  });
}

function renderFilterButton(filter: NoteFilter, label: string) {
  const isActive = state.filter === filter;

  return `
    <button class="filter-button ${isActive ? "is-active" : ""}" data-filter="${filter}">
      ${label}
    </button>
  `;
}

function excerpt(content: string) {
  if (!content.trim()) return "本文はまだありません。";
  return content.length > 64 ? `${content.slice(0, 64)}...` : content;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRootElement() {
  const appRoot = document.querySelector<HTMLDivElement>("#app");

  if (!appRoot) {
    throw new Error("#app element was not found.");
  }

  return appRoot;
}

render();
