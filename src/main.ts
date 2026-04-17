const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('app not found');
}

app.innerHTML = `
  <h1>Memo App</h1>
  <form id="memo-form">
    <input id="memo-title" type="text" placeholder="タイトル" />
    <textarea id="memo-content" placeholder="本文"></textarea>
    <button type="submit">保存</button>
  </form>
  <ul id="memo-list"></ul>
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

  for (const memo of memos) {
    const li = document.createElement('li');

    const title = document.createElement('h2');
    title.textContent = memo.title;

    const content = document.createElement('p');
    content.textContent = memo.content;

    li.appendChild(title);
    li.appendChild(content);

    memoList.appendChild(li);
  }
}

function saveMemos(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const id = Date.now();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const isPinned = false;
  const now = new Date().toISOString();

  if (title === '' || content === '') return;
  const memo: Memo = {
    id,
    title,
    content,
    isPinned,
    createdAt: now,
    updatedAt: now,
  };

  memos.push(memo);

  renderMemos();
  saveMemos();

  console.log(memo);
  console.log(memos);

  titleInput.value = '';
  contentInput.value = '';
});

loadMemos();