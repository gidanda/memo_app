import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('app not found');
}

app.innerHTML = `
  <div class="container">
    <h1>Memo App</h1>
    <form id="memo-form" class="memo-form">
      <input id="memo-title" class="memo-title-input" type="text" placeholder="タイトル" />
      <textarea id="memo-content" class="memo-content-input" placeholder="本文"></textarea>
      <button type="submit" class="primary-button">保存</button>
    </form>
    <ul id="memo-list" class="memo-list"></ul>
  </div>
`;

type Memo = {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

let memos: Memo[] = [];
let editingMemoId: number | null = null;

const formElement = document.querySelector<HTMLFormElement>('#memo-form');
const titleInputElement = document.querySelector<HTMLInputElement>('#memo-title');
const contentInputElement = document.querySelector<HTMLTextAreaElement>('#memo-content');
const memoListElement = document.querySelector<HTMLUListElement>('#memo-list');

if (!formElement || !titleInputElement || !contentInputElement || !memoListElement) {
  throw new Error('required elements not found');
}

const form = formElement;
const titleInput = titleInputElement;
const contentInput = contentInputElement;
const memoList = memoListElement;

const STORAGE_KEY = 'memos';

function loadMemos(): void {
  const savedMemos = localStorage.getItem(STORAGE_KEY);

  if (!savedMemos) {
    return;
  }

  const parsedMemos: unknown = JSON.parse(savedMemos);

  if (!Array.isArray(parsedMemos)) {
    return;
  }

  memos = parsedMemos as Memo[];
  renderMemos();
}

function renderMemos(): void {
  memoList.innerHTML = '';

  const sortedMemos = [...memos].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return 0;
    }

    return a.isPinned ? -1 : 1;
  });

  for (const memo of sortedMemos) {
    const li = document.createElement('li');
    li.classList.add('memo-item');

    const title = document.createElement('h2');
    title.textContent = memo.title;
    title.classList.add('memo-item-title');

    const content = document.createElement('p');
    content.textContent = memo.content;
    content.classList.add('memo-item-content');

    const buttonRow = document.createElement('div');
    buttonRow.classList.add('memo-item-buttons');

    const editButton = document.createElement('button');
    editButton.textContent = '編集';
    editButton.classList.add('secondary-button');

    editButton.addEventListener('click', () => {
      titleInput.value = memo.title;
      contentInput.value = memo.content;
      editingMemoId = memo.id;
    });

    const pinButton = document.createElement('button');
    pinButton.textContent = memo.isPinned ? 'Unpin' : 'Pin';
    pinButton.classList.add('secondary-button');

    pinButton.addEventListener('click', () => {
      memo.isPinned = !memo.isPinned;
      renderMemos();
      saveMemos();
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.classList.add('danger-button');

    deleteButton.addEventListener('click', () => {
      memos = memos.filter((item) => item.id !== memo.id);

      if (editingMemoId === memo.id) {
        editingMemoId = null;
        titleInput.value = '';
        contentInput.value = '';
      }

      renderMemos();
      saveMemos();
    });

    buttonRow.appendChild(editButton);
    buttonRow.appendChild(pinButton);
    buttonRow.appendChild(deleteButton);

    li.appendChild(title);
    li.appendChild(content);
    li.appendChild(buttonRow);

    memoList.appendChild(li);
  }
}

function saveMemos(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const now = new Date().toISOString();

  if (title === '' || content === '') return;

  if (editingMemoId === null) {
    const memo: Memo = {
      id: Date.now(),
      title,
      content,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    memos.push(memo);
  } else {
    memos = memos.map((memo) => {
      if (memo.id !== editingMemoId) {
        return memo;
      }

      return {
        ...memo,
        title,
        content,
        updatedAt: now,
      };
    });

    editingMemoId = null;
  }

  renderMemos();
  saveMemos();

  titleInput.value = '';
  contentInput.value = '';
});

loadMemos();