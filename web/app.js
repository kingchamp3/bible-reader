const bibleBundle = window.BIBLE_TRANSLATIONS;
const searchLimit = 300;

if (!bibleBundle?.translations?.length) {
  const verseList = document.querySelector("#verseList");
  const readerTitle = document.querySelector("#readerTitle");
  if (readerTitle) {
    readerTitle.textContent = "성경 데이터를 불러오지 못했습니다";
  }
  if (verseList) {
    verseList.innerHTML =
      '<p class="empty">web 폴더 안의 index.html, app.js, styles.css, bibles-data.js 파일이 함께 있어야 합니다.</p>';
  }
  throw new Error("BIBLE_TRANSLATIONS is missing.");
}

const state = {
  activeTestament: "old",
  selectedTranslationId: bibleBundle.defaultTranslationId,
  selectedBookId: bibleBundle.translations[0].books[0].id,
  selectedChapter: 1,
  fontSize: 20,
  bookmarks: new Set(JSON.parse(localStorage.getItem("malsseumgilBookmarks") || "[]")),
};

const els = {
  searchInput: document.querySelector("#searchInput"),
  translationSelect: document.querySelector("#translationSelect"),
  bookSelect: document.querySelector("#bookSelect"),
  chapterSelect: document.querySelector("#chapterSelect"),
  bookList: document.querySelector("#bookList"),
  oldTab: document.querySelector("#oldTab"),
  newTab: document.querySelector("#newTab"),
  verseList: document.querySelector("#verseList"),
  readerMeta: document.querySelector("#readerMeta"),
  readerTitle: document.querySelector("#readerTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  bookmarkCount: document.querySelector("#bookmarkCount"),
  decreaseFont: document.querySelector("#decreaseFont"),
  increaseFont: document.querySelector("#increaseFont"),
  fontSizeLabel: document.querySelector("#fontSizeLabel"),
  themeToggle: document.querySelector("#themeToggle"),
};

function selectedTranslation() {
  return (
    bibleBundle.translations.find((translation) => translation.id === state.selectedTranslationId) ||
    bibleBundle.translations[0]
  );
}

function selectedBook() {
  const translation = selectedTranslation();
  return translation.books.find((book) => book.id === state.selectedBookId) || translation.books[0];
}

function selectedChapter() {
  const book = selectedBook();
  return book.chapters.find((chapter) => chapter.chapter === state.selectedChapter) || book.chapters[0];
}

function allVerses() {
  const translation = selectedTranslation();
  return translation.books.flatMap((book) =>
    book.chapters.flatMap((chapter) =>
      chapter.verses.map((verse) => ({
        ...verse,
        bookId: book.id,
        bookName: book.name,
        chapter: chapter.chapter,
      })),
    ),
  );
}

function bookmarkId(bookId, chapter, verse) {
  return `${bookId}-${chapter}-${verse}`;
}

function saveBookmarks() {
  localStorage.setItem("malsseumgilBookmarks", JSON.stringify([...state.bookmarks]));
  els.bookmarkCount.textContent = state.bookmarks.size;
}

function setTranslation(translationId) {
  const nextTranslation =
    bibleBundle.translations.find((translation) => translation.id === translationId) || selectedTranslation();
  const nextBook = nextTranslation.books.find((book) => book.id === state.selectedBookId) || nextTranslation.books[0];
  const nextChapter =
    nextBook.chapters.find((chapter) => chapter.chapter === state.selectedChapter) || nextBook.chapters[0];

  state.selectedTranslationId = nextTranslation.id;
  state.selectedBookId = nextBook.id;
  state.selectedChapter = nextChapter.chapter;
  state.activeTestament = nextBook.testament;
  els.searchInput.value = "";
  render();
}

function setBook(bookId, chapter = 1) {
  const translation = selectedTranslation();
  const book = translation.books.find((item) => item.id === bookId);
  if (!book) return;

  state.selectedBookId = book.id;
  state.selectedChapter = chapter;
  state.activeTestament = book.testament;
  els.searchInput.value = "";
  render();
}

function setChapter(chapter) {
  state.selectedChapter = Number(chapter);
  els.searchInput.value = "";
  render();
}

function toggleBookmark(bookId, chapter, verse) {
  const id = bookmarkId(bookId, chapter, verse);
  if (state.bookmarks.has(id)) {
    state.bookmarks.delete(id);
  } else {
    state.bookmarks.add(id);
  }
  saveBookmarks();
  renderVerses();
}

function renderTranslationSelect() {
  els.translationSelect.innerHTML = bibleBundle.translations
    .map((translation) => `<option value="${translation.id}">${translation.name}</option>`)
    .join("");
  els.translationSelect.value = state.selectedTranslationId;
}

function renderBookSelect() {
  const translation = selectedTranslation();
  els.bookSelect.innerHTML = translation.books
    .map((book) => `<option value="${book.id}">${book.name}</option>`)
    .join("");
  els.bookSelect.value = state.selectedBookId;
}

function renderChapterSelect() {
  const book = selectedBook();
  els.chapterSelect.innerHTML = book.chapters
    .map((chapter) => `<option value="${chapter.chapter}">${chapter.chapter}장</option>`)
    .join("");
  els.chapterSelect.value = state.selectedChapter;
}

function renderTabs() {
  els.oldTab.classList.toggle("active", state.activeTestament === "old");
  els.newTab.classList.toggle("active", state.activeTestament === "new");
}

function renderBookButtons() {
  const translation = selectedTranslation();
  const books = translation.books.filter((book) => book.testament === state.activeTestament);
  els.bookList.innerHTML = books
    .map(
      (book) =>
        `<button type="button" class="${book.id === state.selectedBookId ? "active" : ""}" data-book-id="${book.id}">${book.name}</button>`,
    )
    .join("");
}

function renderHeader() {
  const translation = selectedTranslation();
  const book = selectedBook();
  const chapter = selectedChapter();
  const searching = els.searchInput.value.trim().length > 0;
  els.readerMeta.textContent = `${translation.name} · ${translation.verseCount.toLocaleString()}절`;
  els.readerTitle.textContent = searching ? "검색 결과" : `${book.name} ${chapter.chapter}장`;
  document.documentElement.style.setProperty("--reader-font-size", `${state.fontSize}px`);
  els.fontSizeLabel.textContent = state.fontSize;
  els.bookmarkCount.textContent = state.bookmarks.size;
}

function createVerseRow({ bookId, chapter, verse, text, refLabel, searchResult }) {
  const id = bookmarkId(bookId, chapter, verse);
  const marked = state.bookmarks.has(id);
  const row = document.createElement("section");
  row.className = `verse-row${marked ? " marked" : ""}`;

  const ref = document.createElement("button");
  ref.type = "button";
  ref.className = "verse-ref verse-save";
  ref.textContent = refLabel || verse;
  if (searchResult) {
    ref.addEventListener("click", () => setBook(bookId, chapter));
  }

  const body = document.createElement("div");
  body.className = "verse-text";
  body.textContent = text;

  const save = document.createElement("button");
  save.type = "button";
  save.className = `verse-save${marked ? " saved" : ""}`;
  save.textContent = marked ? "저장됨" : "저장";
  save.addEventListener("click", () => toggleBookmark(bookId, chapter, verse));

  row.append(ref, body, save);
  return row;
}

function renderVerses() {
  const query = els.searchInput.value.trim();
  const lowerQuery = query.toLowerCase();
  els.verseList.innerHTML = "";

  if (query) {
    const matches = allVerses().filter((verse) => verse.text.toLowerCase().includes(lowerQuery));
    const visibleMatches = matches.slice(0, searchLimit);
    els.resultSummary.hidden = false;
    els.resultSummary.textContent = `${matches.length}개 중 ${visibleMatches.length}개 표시`;

    if (visibleMatches.length === 0) {
      els.verseList.innerHTML = '<p class="empty">검색 결과가 없습니다.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    visibleMatches.forEach((verse) => {
      fragment.append(
        createVerseRow({
          ...verse,
          refLabel: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
          searchResult: true,
        }),
      );
    });
    els.verseList.append(fragment);
    return;
  }

  els.resultSummary.hidden = true;
  const book = selectedBook();
  const chapter = selectedChapter();
  const fragment = document.createDocumentFragment();
  chapter.verses.forEach((verse) => {
    fragment.append(createVerseRow({ ...verse, bookId: book.id, chapter: chapter.chapter }));
  });
  els.verseList.append(fragment);
}

function render() {
  renderTranslationSelect();
  renderBookSelect();
  renderChapterSelect();
  renderTabs();
  renderBookButtons();
  renderHeader();
  renderVerses();
}

els.translationSelect.addEventListener("change", (event) => setTranslation(event.target.value));
els.bookSelect.addEventListener("change", (event) => setBook(event.target.value));
els.chapterSelect.addEventListener("change", (event) => setChapter(event.target.value));
els.oldTab.addEventListener("click", () => {
  state.activeTestament = "old";
  renderTabs();
  renderBookButtons();
});
els.newTab.addEventListener("click", () => {
  state.activeTestament = "new";
  renderTabs();
  renderBookButtons();
});
els.bookList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-book-id]");
  if (button) {
    setBook(button.dataset.bookId);
  }
});
els.searchInput.addEventListener("input", () => {
  renderHeader();
  renderVerses();
});
els.decreaseFont.addEventListener("click", () => {
  state.fontSize = Math.max(16, state.fontSize - 2);
  renderHeader();
});
els.increaseFont.addEventListener("click", () => {
  state.fontSize = Math.min(32, state.fontSize + 2);
  renderHeader();
});
els.themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  els.themeToggle.textContent = document.body.classList.contains("dark") ? "밝게" : "어둡게";
});

render();
saveBookmarks();
