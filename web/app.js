const bibleBundle = window.BIBLE_TRANSLATIONS;
const searchLimit = 300;
const memberStorageKey = "bibleReaderMembers";
const legacyBookmarkKey = "malsseumgilBookmarks";
let authService = window.BIBLE_READER_AUTH;
let authListenerAttached = false;
let cloudStatus = "idle";
window.BIBLE_READER_AUTH_READY?.then((service) => {
  authService = service || window.BIBLE_READER_AUTH;
  renderAuthPanel();
  subscribeAuthChanges();
}).catch((error) => {
  window.BIBLE_READER_AUTH_ERROR = error?.message || "Google 로그인 준비 중 오류가 발생했습니다.";
  renderAuthPanel();
});
let cloudSaveTimer = null;
const cloudTimeoutMs = 8000;

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

function createMember(name) {
  return {
    id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    bookmarks: [],
    readChapters: [],
    lastRead: null,
  };
}

function loadMemberState() {
  const saved = JSON.parse(localStorage.getItem(memberStorageKey) || "null");
  if (saved?.members?.length) {
    return saved;
  }

  const defaultMember = createMember("기본 회원");
  defaultMember.bookmarks = JSON.parse(localStorage.getItem(legacyBookmarkKey) || "[]");
  return {
    activeMemberId: defaultMember.id,
    members: [defaultMember],
  };
}

const memberState = loadMemberState();

const state = {
  activeTestament: "old",
  selectedTranslationId: bibleBundle.defaultTranslationId,
  compareTranslationId: defaultCompareTranslationIds()[0],
  compareTranslationId2: defaultCompareTranslationIds()[1],
  selectedBookId: bibleBundle.translations[0].books[0].id,
  selectedChapter: 1,
  fontSize: 20,
  showFavorites: false,
  compareMode: false,
  members: memberState.members,
  activeMemberId: memberState.activeMemberId,
  signedInUser: null,
  bookmarks: new Set(),
};

const els = {
  searchInput: document.querySelector("#searchInput"),
  googleLoginButton: document.querySelector("#googleLoginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  authStatus: document.querySelector("#authStatus"),
  memberSelect: document.querySelector("#memberSelect"),
  progressPercent: document.querySelector("#progressPercent"),
  progressSummary: document.querySelector("#progressSummary"),
  lastReadButton: document.querySelector("#lastReadButton"),
  translationSelect: document.querySelector("#translationSelect"),
  compareTranslationSelect: document.querySelector("#compareTranslationSelect"),
  compareTranslationSelect2: document.querySelector("#compareTranslationSelect2"),
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
  favoritesToggle: document.querySelector("#favoritesToggle"),
  compareToggle: document.querySelector("#compareToggle"),
};

function selectedTranslation() {
  return (
    bibleBundle.translations.find((translation) => translation.id === state.selectedTranslationId) ||
    bibleBundle.translations[0]
  );
}

function defaultCompareTranslationIds() {
  const ids = bibleBundle.translations
    .filter((translation) => translation.id !== bibleBundle.defaultTranslationId)
    .map((translation) => translation.id);
  return [ids[0] || bibleBundle.defaultTranslationId, ids[1] || ids[0] || bibleBundle.defaultTranslationId];
}

function fallbackCompareTranslationId(excludedIds = []) {
  return (
    bibleBundle.translations.find((translation) => !excludedIds.includes(translation.id))?.id ||
    state.selectedTranslationId
  );
}

function selectedCompareTranslation() {
  if (
    state.compareTranslationId === state.selectedTranslationId ||
    state.compareTranslationId === state.compareTranslationId2
  ) {
    state.compareTranslationId = fallbackCompareTranslationId([state.selectedTranslationId, state.compareTranslationId2]);
  }
  return (
    bibleBundle.translations.find((translation) => translation.id === state.compareTranslationId) ||
    bibleBundle.translations.find((translation) => translation.id !== state.selectedTranslationId) ||
    selectedTranslation()
  );
}

function selectedCompareTranslation2() {
  if (
    state.compareTranslationId2 === state.selectedTranslationId ||
    state.compareTranslationId2 === state.compareTranslationId
  ) {
    state.compareTranslationId2 = fallbackCompareTranslationId([
      state.selectedTranslationId,
      state.compareTranslationId,
    ]);
  }
  return (
    bibleBundle.translations.find((translation) => translation.id === state.compareTranslationId2) ||
    bibleBundle.translations.find(
      (translation) => translation.id !== state.selectedTranslationId && translation.id !== state.compareTranslationId,
    ) ||
    selectedCompareTranslation()
  );
}

function selectedParallelTranslations() {
  return [selectedTranslation(), selectedCompareTranslation(), selectedCompareTranslation2()];
}

function selectedBook() {
  const translation = selectedTranslation();
  return translation.books.find((book) => book.id === state.selectedBookId) || translation.books[0];
}

function selectedChapter() {
  const book = selectedBook();
  return book.chapters.find((chapter) => chapter.chapter === state.selectedChapter) || book.chapters[0];
}

function activeMember() {
  let member = state.members.find((item) => item.id === state.activeMemberId);
  if (!member) {
    member = state.members[0];
    state.activeMemberId = member.id;
  }
  return member;
}

function persistMembers() {
  const member = activeMember();
  member.bookmarks = [...state.bookmarks];
  const data = {
    activeMemberId: state.activeMemberId,
    members: state.members,
  };
  localStorage.setItem(memberStorageKey, JSON.stringify(data));
  localStorage.setItem(legacyBookmarkKey, JSON.stringify(member.bookmarks));
  scheduleCloudSave(data);
}

function loadActiveMember() {
  const member = activeMember();
  state.bookmarks = new Set(member.bookmarks || []);
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

function chapterProgressId(translationId, bookId, chapter) {
  return `${translationId}:${bookId}:${chapter}`;
}

function totalChapterCount(translation = selectedTranslation()) {
  return translation.books.reduce((total, book) => total + book.chapters.length, 0);
}

function readChapterCount(member = activeMember(), translation = selectedTranslation()) {
  const prefix = `${translation.id}:`;
  return new Set((member.readChapters || []).filter((id) => id.startsWith(prefix))).size;
}

function currentLocation() {
  const translation = selectedTranslation();
  const book = selectedBook();
  const chapter = selectedChapter();
  return {
    translationId: translation.id,
    translationName: translation.name,
    bookId: book.id,
    bookName: book.name,
    chapter: chapter.chapter,
  };
}

function markCurrentChapterRead() {
  const member = activeMember();
  const location = currentLocation();
  const progressId = chapterProgressId(location.translationId, location.bookId, location.chapter);
  member.readChapters = member.readChapters || [];
  if (!member.readChapters.includes(progressId)) {
    member.readChapters.push(progressId);
  }
  member.lastRead = location;
  persistMembers();
}

function scheduleCloudSave(data) {
  if (!authService?.enabled || !state.signedInUser) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => {
    withTimeout(authService.saveUserData(data), cloudTimeoutMs).catch(() => {
      cloudStatus = "save-failed";
      els.authStatus.textContent = "클라우드 저장 실패";
    });
  }, 500);
}

function withTimeout(promise, timeoutMs) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timerId));
}

async function applyCloudData() {
  if (!authService?.enabled || !state.signedInUser) return;
  const cloudData = await withTimeout(authService.loadUserData(), cloudTimeoutMs);
  if (cloudData?.members?.length) {
    state.members = cloudData.members;
    state.activeMemberId = cloudData.activeMemberId || cloudData.members[0].id;
    loadActiveMember();
    persistMembers();
    render();
  } else {
    persistMembers();
  }
  cloudStatus = "loaded";
}

function parseBookmarkId(id) {
  const parts = id.split("-");
  const verse = Number(parts.pop());
  const chapter = Number(parts.pop());
  const bookId = parts.join("-");
  return { bookId, chapter, verse };
}

function favoriteVerses() {
  const translation = selectedTranslation();
  return [...state.bookmarks]
    .map((id) => {
      const parsed = parseBookmarkId(id);
      const book = translation.books.find((item) => item.id === parsed.bookId);
      const chapter = book?.chapters.find((item) => item.chapter === parsed.chapter);
      const verse = chapter?.verses.find((item) => item.verse === parsed.verse);
      if (!book || !chapter || !verse) return null;
      return {
        ...verse,
        bookId: book.id,
        bookName: book.name,
        chapter: chapter.chapter,
      };
    })
    .filter(Boolean);
}

function saveBookmarks() {
  persistMembers();
  els.bookmarkCount.textContent = state.bookmarks.size;
}

function switchMember(memberId) {
  state.activeMemberId = memberId;
  loadActiveMember();
  state.showFavorites = false;
  persistMembers();
  render();
}

function renderMemberPanel() {
  els.memberSelect.innerHTML = state.members
    .map((member) => `<option value="${member.id}">${member.name}</option>`)
    .join("");
  els.memberSelect.value = state.activeMemberId;
}

function renderAuthPanel() {
  const hasCloud = Boolean(authService?.enabled);
  const signedIn = Boolean(state.signedInUser);
  els.googleLoginButton.hidden = !hasCloud || signedIn;
  els.logoutButton.hidden = !hasCloud || !signedIn;
  els.authStatus.textContent = !hasCloud
    ? window.BIBLE_READER_AUTH_ERROR
      ? "Google 로그인 준비 실패 · 브라우저 저장 중"
      : "브라우저 저장 중"
    : signedIn
      ? cloudStatus === "loaded"
        ? `${state.signedInUser.name} 동기화됨`
        : cloudStatus === "load-failed"
          ? `${state.signedInUser.name} 로그인됨 · 브라우저 저장 중`
          : `${state.signedInUser.name} 로그인됨`
      : "Google 동기화 가능";
}

function subscribeAuthChanges() {
  if (authListenerAttached || !authService?.enabled) return;
  authListenerAttached = true;
  authService.onAuthChanged((user) => {
    state.signedInUser = user;
    renderAuthPanel();
    if (user) {
      cloudStatus = "loading";
      els.authStatus.textContent = "클라우드 데이터 불러오는 중";
      applyCloudData()
        .then(() => {
          renderAuthPanel();
        })
        .catch(() => {
          cloudStatus = "load-failed";
          els.authStatus.textContent = `${state.signedInUser.name} 로그인됨 · 브라우저 저장 중`;
        });
    } else {
      cloudStatus = "idle";
    }
  });
}

function setTranslation(translationId) {
  const nextTranslation =
    bibleBundle.translations.find((translation) => translation.id === translationId) || selectedTranslation();
  const nextBook = nextTranslation.books.find((book) => book.id === state.selectedBookId) || nextTranslation.books[0];
  const nextChapter =
    nextBook.chapters.find((chapter) => chapter.chapter === state.selectedChapter) || nextBook.chapters[0];

  state.selectedTranslationId = nextTranslation.id;
  if (state.compareTranslationId === nextTranslation.id) {
    state.compareTranslationId = fallbackCompareTranslationId([nextTranslation.id, state.compareTranslationId2]);
  }
  if (state.compareTranslationId2 === nextTranslation.id || state.compareTranslationId2 === state.compareTranslationId) {
    state.compareTranslationId2 = fallbackCompareTranslationId([nextTranslation.id, state.compareTranslationId]);
  }
  state.selectedBookId = nextBook.id;
  state.selectedChapter = nextChapter.chapter;
  state.activeTestament = nextBook.testament;
  els.searchInput.value = "";
  state.showFavorites = false;
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
  state.showFavorites = false;
  render();
}

function setChapter(chapter) {
  state.selectedChapter = Number(chapter);
  els.searchInput.value = "";
  state.showFavorites = false;
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

function renderCompareTranslationSelect() {
  selectedParallelTranslations();
  els.compareTranslationSelect.innerHTML = bibleBundle.translations
    .map((translation) => `<option value="${translation.id}">${translation.name}</option>`)
    .join("");
  els.compareTranslationSelect2.innerHTML = els.compareTranslationSelect.innerHTML;
  els.compareTranslationSelect.value = state.compareTranslationId;
  els.compareTranslationSelect2.value = state.compareTranslationId2;
  els.compareTranslationSelect.disabled = bibleBundle.translations.length < 2;
  els.compareTranslationSelect2.disabled = bibleBundle.translations.length < 3;
}

function renderProgress() {
  const member = activeMember();
  const translation = selectedTranslation();
  const readCount = readChapterCount(member, translation);
  const totalCount = totalChapterCount(translation);
  const percent = totalCount === 0 ? 0 : Math.round((readCount / totalCount) * 100);
  els.progressPercent.textContent = `${percent}%`;
  els.progressSummary.textContent = `읽은 장 ${readCount} / ${totalCount}`;
  els.lastReadButton.disabled = !member.lastRead;
  els.lastReadButton.textContent = member.lastRead
    ? `${member.lastRead.bookName} ${member.lastRead.chapter}장`
    : "최근 위치";
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
  const parallelTranslations = selectedParallelTranslations();
  const book = selectedBook();
  const chapter = selectedChapter();
  const searching = els.searchInput.value.trim().length > 0;
  const comparing = state.compareMode && !state.showFavorites && !searching;
  els.readerMeta.textContent = comparing
    ? parallelTranslations.map((item) => item.name).join(" ↔ ")
    : `${translation.name} · ${translation.verseCount.toLocaleString()}절`;
  els.readerTitle.textContent = state.showFavorites
    ? "즐겨찾기"
    : searching
      ? "검색 결과"
      : comparing
        ? `${book.name} ${chapter.chapter}장 대조`
        : `${book.name} ${chapter.chapter}장`;
  document.documentElement.style.setProperty("--reader-font-size", `${state.fontSize}px`);
  els.fontSizeLabel.textContent = state.fontSize;
  els.bookmarkCount.textContent = state.bookmarks.size;
  els.favoritesToggle.classList.toggle("active", state.showFavorites);
  els.favoritesToggle.textContent = state.showFavorites ? "성경 본문 보기" : "즐겨찾기 보기";
  els.compareToggle.classList.toggle("active", state.compareMode);
  els.compareToggle.textContent = state.compareMode ? "대조 끄기" : "대조 보기";
  renderAuthPanel();
  renderProgress();
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

function findTranslationVerse(translation, bookId, chapterNumber, verseNumber) {
  const book = translation.books.find((item) => item.id === bookId);
  const chapter = book?.chapters.find((item) => item.chapter === chapterNumber);
  return chapter?.verses.find((item) => item.verse === verseNumber);
}

function createComparePane(translation, text) {
  const pane = document.createElement("div");
  pane.className = "compare-pane";
  const label = document.createElement("strong");
  label.textContent = translation.name;
  const verseText = document.createElement("p");
  verseText.textContent = text || "해당 절 없음";
  pane.append(label, verseText);
  return pane;
}

function createCompareVerseRow({ bookId, chapter, verse, text }) {
  const id = bookmarkId(bookId, chapter, verse);
  const marked = state.bookmarks.has(id);
  const parallelTranslations = selectedParallelTranslations();
  const row = document.createElement("section");
  row.className = `verse-row compare-row${marked ? " marked" : ""}`;

  const ref = document.createElement("button");
  ref.type = "button";
  ref.className = "verse-ref verse-save";
  ref.textContent = verse;

  const body = document.createElement("div");
  body.className = "compare-grid";

  parallelTranslations.forEach((translation, index) => {
    const verseText = index === 0 ? text : findTranslationVerse(translation, bookId, chapter, verse)?.text;
    body.append(createComparePane(translation, verseText));
  });

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

  if (state.showFavorites) {
    els.resultSummary.hidden = false;
    const favorites = favoriteVerses();
    els.resultSummary.textContent = `${favorites.length}개 즐겨찾기`;

    if (favorites.length === 0) {
      els.verseList.innerHTML = '<p class="empty">저장한 구절이 없습니다.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    favorites.forEach((verse) => {
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
  markCurrentChapterRead();
  const book = selectedBook();
  const chapter = selectedChapter();
  const fragment = document.createDocumentFragment();
  if (state.compareMode) {
    chapter.verses.forEach((verse) => {
      fragment.append(createCompareVerseRow({ ...verse, bookId: book.id, chapter: chapter.chapter }));
    });
    els.verseList.append(fragment);
    return;
  }

  chapter.verses.forEach((verse) => {
    fragment.append(createVerseRow({ ...verse, bookId: book.id, chapter: chapter.chapter }));
  });
  els.verseList.append(fragment);
}

function render() {
  renderMemberPanel();
  renderTranslationSelect();
  renderCompareTranslationSelect();
  renderBookSelect();
  renderChapterSelect();
  renderTabs();
  renderBookButtons();
  renderHeader();
  renderVerses();
}

function renderAfterCompareSelection() {
  selectedParallelTranslations();
  renderCompareTranslationSelect();
  renderHeader();
  renderVerses();
}

els.translationSelect.addEventListener("change", (event) => setTranslation(event.target.value));
els.compareTranslationSelect.addEventListener("change", (event) => {
  state.compareTranslationId = event.target.value;
  renderAfterCompareSelection();
});
els.compareTranslationSelect2.addEventListener("change", (event) => {
  state.compareTranslationId2 = event.target.value;
  renderAfterCompareSelection();
});
els.googleLoginButton.addEventListener("click", () => {
  authService.login().catch((error) => {
    const code = error?.code || "";
    if (code.includes("unauthorized-domain")) {
      els.authStatus.textContent = "로그인 실패: 승인된 도메인을 확인해 주세요";
    } else if (code.includes("popup-blocked")) {
      els.authStatus.textContent = "로그인 실패: 팝업 차단을 해제해 주세요";
    } else if (code.includes("popup-closed")) {
      els.authStatus.textContent = "로그인이 취소되었습니다";
    } else {
      els.authStatus.textContent = "로그인 실패";
    }
  });
});
els.logoutButton.addEventListener("click", () => {
  authService.logout().catch(() => {
    els.authStatus.textContent = "로그아웃 실패";
  });
});
els.memberSelect.addEventListener("change", (event) => switchMember(event.target.value));
els.lastReadButton.addEventListener("click", () => {
  const lastRead = activeMember().lastRead;
  if (!lastRead) return;
  setTranslation(lastRead.translationId);
  setBook(lastRead.bookId, lastRead.chapter);
});
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
  state.showFavorites = false;
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
els.favoritesToggle.addEventListener("click", () => {
  state.showFavorites = !state.showFavorites;
  els.searchInput.value = "";
  renderHeader();
  renderVerses();
});
els.compareToggle.addEventListener("click", () => {
  state.compareMode = !state.compareMode;
  state.showFavorites = false;
  els.searchInput.value = "";
  renderHeader();
  renderVerses();
});

loadActiveMember();
persistMembers();
render();
saveBookmarks();
subscribeAuthChanges();
