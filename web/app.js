const bibleBundle = window.BIBLE_TRANSLATIONS;
const originalLoaders = {
  sblgnt: window.BIBLE_SBLGNT_LOADER,
  wlc: window.BIBLE_HEBREW_LOADER,
};
const searchLimit = 300;
const memberStorageKey = "bibleReaderMembers";
const legacyBookmarkKey = "malsseumgilBookmarks";
let authService = window.BIBLE_READER_AUTH;
let authListenerAttached = false;
let cloudStatus = "idle";
let cloudSaveDisabled = false;
window.BIBLE_READER_AUTH_READY?.then((service) => {
  authService = service || window.BIBLE_READER_AUTH;
  renderAuthPanel();
  subscribeAuthChanges();
  loadGratitudeNotes();
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

Object.entries(originalLoaders).forEach(([translationId, loader]) => {
  if (loader && !bibleBundle.translations.some((translation) => translation.id === translationId)) {
    bibleBundle.translations.push(loader.placeholder());
  }
});

function createMember(name) {
  return {
    id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    bookmarks: [],
    highlights: {},
    textHighlights: {},
    notes: {},
    devotionalNotes: {},
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
  highlightFilter: null,
  compareMode: false,
  members: memberState.members,
  activeMemberId: memberState.activeMemberId,
  signedInUser: null,
  bookmarks: new Set(),
  highlights: {},
  textHighlights: {},
  notes: {},
  devotionalNotes: {},
  editingNoteId: null,
  lastTextSelection: null,
  gratitudeNotes: [],
  gratitudeStatus: "",
};

const recommendedDailyVerseRefs = [
  ["john", 3, 16],
  ["john", 14, 6],
  ["john", 14, 27],
  ["john", 15, 5],
  ["john", 15, 7],
  ["matthew", 5, 16],
  ["matthew", 6, 33],
  ["matthew", 11, 28],
  ["matthew", 22, 37],
  ["matthew", 28, 19],
  ["mark", 10, 45],
  ["luke", 6, 31],
  ["luke", 11, 9],
  ["acts", 1, 8],
  ["acts", 4, 12],
  ["romans", 1, 16],
  ["romans", 5, 8],
  ["romans", 8, 1],
  ["romans", 8, 28],
  ["romans", 12, 2],
  ["1-corinthians", 10, 13],
  ["1-corinthians", 13, 13],
  ["2-corinthians", 5, 17],
  ["2-corinthians", 12, 9],
  ["galatians", 2, 20],
  ["galatians", 5, 22],
  ["ephesians", 2, 8],
  ["ephesians", 3, 20],
  ["ephesians", 6, 10],
  ["philippians", 1, 6],
  ["philippians", 4, 6],
  ["philippians", 4, 7],
  ["philippians", 4, 13],
  ["philippians", 4, 19],
  ["colossians", 3, 23],
  ["1-thessalonians", 5, 16],
  ["1-thessalonians", 5, 18],
  ["2-timothy", 1, 7],
  ["2-timothy", 3, 16],
  ["hebrews", 4, 12],
  ["hebrews", 11, 1],
  ["hebrews", 12, 2],
  ["james", 1, 5],
  ["james", 1, 22],
  ["1-peter", 5, 7],
  ["1-john", 1, 9],
  ["1-john", 4, 7],
  ["1-john", 4, 18],
  ["revelation", 3, 20],
  ["revelation", 21, 4],
];

const els = {
  searchInput: document.querySelector("#searchInput"),
  googleLoginButton: document.querySelector("#googleLoginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  authStatus: document.querySelector("#authStatus"),
  memberSelect: document.querySelector("#memberSelect"),
  progressPercent: document.querySelector("#progressPercent"),
  progressSummary: document.querySelector("#progressSummary"),
  lastReadButton: document.querySelector("#lastReadButton"),
  chapterReadToggle: document.querySelector("#chapterReadToggle"),
  dailyVerseButton: document.querySelector("#dailyVerseButton"),
  gratitudeForm: document.querySelector("#gratitudeForm"),
  gratitudeInput: document.querySelector("#gratitudeInput"),
  gratitudeStatus: document.querySelector("#gratitudeStatus"),
  gratitudeList: document.querySelector("#gratitudeList"),
  devotionalForm: document.querySelector("#devotionalForm"),
  devotionalDate: document.querySelector("#devotionalDate"),
  devotionalPassage: document.querySelector("#devotionalPassage"),
  devotionalInsight: document.querySelector("#devotionalInsight"),
  devotionalPrayer: document.querySelector("#devotionalPrayer"),
  devotionalAction: document.querySelector("#devotionalAction"),
  devotionalStatus: document.querySelector("#devotionalStatus"),
  devotionalList: document.querySelector("#devotionalList"),
  useCurrentPassageButton: document.querySelector("#useCurrentPassageButton"),
  translationSelect: document.querySelector("#translationSelect"),
  compareTranslationSelect: document.querySelector("#compareTranslationSelect"),
  compareTranslationSelect2: document.querySelector("#compareTranslationSelect2"),
  sourceAttribution: document.querySelector("#sourceAttribution"),
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
  highlightFilter: document.querySelector(".highlight-filter"),
  readingPlan: document.querySelector("#readingPlan"),
};

function selectedTranslation() {
  return (
    bibleBundle.translations.find((translation) => translation.id === state.selectedTranslationId) ||
    bibleBundle.translations[0]
  );
}

async function ensureTranslationLoaded(translationId) {
  const current = bibleBundle.translations.find((translation) => translation.id === translationId);
  const loader = originalLoaders[translationId];
  if (!current?.loading || !loader?.load) return current || selectedTranslation();

  els.readerTitle.textContent = `${current.name}을 불러오는 중`;
  els.readerMeta.textContent = current.source?.title || "공식 원문 데이터";
  els.verseList.innerHTML = `<p class="empty">${current.name}을 준비하고 있습니다.</p>`;

  try {
    const loaded = await loader.load();
    const index = bibleBundle.translations.findIndex((translation) => translation.id === loaded.id);
    if (index >= 0) {
      bibleBundle.translations[index] = loaded;
    } else {
      bibleBundle.translations.push(loaded);
    }
    return loaded;
  } catch (error) {
    els.readerTitle.textContent = `${current.name}을 불러오지 못했습니다`;
    els.readerMeta.textContent = "네트워크 연결을 확인해 주세요";
    els.verseList.innerHTML = `<p class="empty">${error?.message || `${current.name} 로드 실패`}</p>`;
    throw error;
  }
}

async function ensureVisibleTranslationsLoaded() {
  await ensureTranslationLoaded(state.selectedTranslationId);
  if (!state.compareMode) return;
  await Promise.all([state.compareTranslationId, state.compareTranslationId2].map((id) => ensureTranslationLoaded(id)));
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
  member.highlights = { ...state.highlights };
  member.textHighlights = { ...state.textHighlights };
  member.notes = { ...state.notes };
  member.devotionalNotes = { ...state.devotionalNotes };
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
  state.highlights = { ...(member.highlights || {}) };
  state.textHighlights = { ...(member.textHighlights || {}) };
  state.notes = { ...(member.notes || {}) };
  state.devotionalNotes = { ...(member.devotionalNotes || {}) };
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

function verseStorageId(translationId, bookId, chapter, verse) {
  return `${translationId}:${bookId}:${chapter}:${verse}`;
}

function textHighlightKey(translationId, verseId) {
  return `${translationId}:${verseId}`;
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

function todayDateInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function currentPassageLabel() {
  const location = currentLocation();
  return `${location.bookName} ${location.chapter}장`;
}

function currentChapterProgressId() {
  const location = currentLocation();
  return chapterProgressId(location.translationId, location.bookId, location.chapter);
}

function isCurrentChapterRead() {
  const member = activeMember();
  return (member.readChapters || []).includes(currentChapterProgressId());
}

function toggleCurrentChapterRead() {
  const member = activeMember();
  const progressId = currentChapterProgressId();
  member.readChapters = member.readChapters || [];
  if (member.readChapters.includes(progressId)) {
    member.readChapters = member.readChapters.filter((id) => id !== progressId);
  } else {
    member.readChapters.push(progressId);
    member.lastRead = currentLocation();
  }
  persistMembers();
  render();
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
  if (!authService?.enabled || !state.signedInUser || cloudSaveDisabled) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => {
    withTimeout(authService.saveUserData(data), cloudTimeoutMs).catch(() => {
      cloudSaveDisabled = true;
      cloudStatus = "save-failed";
      renderAuthPanel();
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

function highlightedVerses(color) {
  const translation = selectedTranslation();
  const ids = new Set(
    Object.entries(state.highlights)
      .filter(([, highlightColor]) => highlightColor === color)
      .map(([id]) => id),
  );
  const partialPrefix = `${translation.id}:`;
  Object.entries(state.textHighlights).forEach(([key, items]) => {
    if (key.startsWith(partialPrefix) && items.some((item) => item.color === color)) {
      ids.add(key.slice(partialPrefix.length));
    }
  });

  return [...ids]
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

function dailyVerse() {
  const translation = selectedTranslation();
  const recommendedVerses = recommendedDailyVerseRefs
    .map(([bookId, chapterNumber, verseNumber]) => {
      const book = translation.books.find((item) => item.id === bookId);
      const chapter = book?.chapters.find((item) => item.chapter === chapterNumber);
      const verse = chapter?.verses.find((item) => item.verse === verseNumber);
      if (!book || !chapter || !verse) return null;
      return {
        ...verse,
        bookId: book.id,
        bookName: book.name,
        chapter: chapter.chapter,
      };
    })
    .filter(Boolean);
  const verses = recommendedVerses.length ? recommendedVerses : allVerses().filter((verse) => {
    const book = translation.books.find((item) => item.id === verse.bookId);
    return book?.testament === "new";
  });
  const today = new Date();
  const seed = Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );
  return verses[seed % verses.length];
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
  els.memberSelect.replaceChildren(
    ...state.members.map((member) => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.name;
      return option;
    }),
  );
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
        : cloudStatus === "load-failed" || cloudStatus === "save-failed"
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
      cloudSaveDisabled = false;
      cloudStatus = "loading";
      els.authStatus.textContent = "클라우드 데이터 불러오는 중";
      applyCloudData()
        .then(() => {
          renderAuthPanel();
        })
        .catch(() => {
          cloudSaveDisabled = true;
          cloudStatus = "load-failed";
          renderAuthPanel();
        });
    } else {
      cloudStatus = "idle";
      cloudSaveDisabled = false;
      state.gratitudeStatus = "Google 로그인 후 감사 한줄을 나눌 수 있습니다.";
      renderGratitudePanel();
    }
    loadGratitudeNotes();
  });
}

async function setTranslation(translationId) {
  const nextTranslation = await ensureTranslationLoaded(translationId);
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
  state.highlightFilter = null;
  state.lastTextSelection = null;
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
  state.highlightFilter = null;
  state.lastTextSelection = null;
  render();
}

function setChapter(chapter) {
  state.selectedChapter = Number(chapter);
  els.searchInput.value = "";
  state.showFavorites = false;
  state.highlightFilter = null;
  state.lastTextSelection = null;
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

function closestVerseTextNode(node) {
  const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  return element?.closest?.(".verse-text") || null;
}

function selectedVerseTextRange(verseId) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const startBody = closestVerseTextNode(range.startContainer);
  const endBody = closestVerseTextNode(range.endContainer);
  if (!startBody || startBody !== endBody || startBody.dataset.verseId !== verseId) return null;

  const before = document.createRange();
  before.selectNodeContents(startBody);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const selectedLength = range.toString().length;
  if (selectedLength <= 0) return null;
  return { start, end: start + selectedLength };
}

function captureTextSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const startBody = closestVerseTextNode(range.startContainer);
  const endBody = closestVerseTextNode(range.endContainer);
  if (!startBody || startBody !== endBody || !startBody.dataset.verseId) return;

  const before = document.createRange();
  before.selectNodeContents(startBody);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const selectedLength = range.toString().length;
  if (selectedLength <= 0) return;

  state.lastTextSelection = {
    translationId: state.selectedTranslationId,
    verseId: startBody.dataset.verseId,
    start,
    end: start + selectedLength,
  };
}

function mergeTextHighlights(items) {
  return items
    .filter((item) => item.end > item.start)
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .reduce((merged, item) => {
      const previous = merged[merged.length - 1];
      if (previous && previous.color === item.color && item.start <= previous.end) {
        previous.end = Math.max(previous.end, item.end);
      } else {
        merged.push({ ...item });
      }
      return merged;
    }, []);
}

function setTextHighlight(translationId, verseId, range, color) {
  const key = textHighlightKey(translationId, verseId);
  const existing = state.textHighlights[key] || [];
  if (color === "clear") {
    const remaining = existing.filter((item) => item.end <= range.start || item.start >= range.end);
    if (remaining.length) state.textHighlights[key] = remaining;
    else delete state.textHighlights[key];
  } else {
    state.textHighlights[key] = mergeTextHighlights([...existing, { ...range, color }]);
  }
  window.getSelection()?.removeAllRanges();
  persistMembers();
  renderVerses();
}

function toggleHighlight(bookId, chapter, verse, color) {
  const id = bookmarkId(bookId, chapter, verse);
  captureTextSelection();
  const remembered = state.lastTextSelection;
  const range =
    selectedVerseTextRange(id) ||
    (remembered?.translationId === state.selectedTranslationId && remembered?.verseId === id
      ? { start: remembered.start, end: remembered.end }
      : null);
  if (range) {
    setTextHighlight(state.selectedTranslationId, id, range, color);
    state.lastTextSelection = null;
    return;
  }

  if (state.highlights[id] === color || color === "clear") {
    delete state.highlights[id];
    delete state.textHighlights[textHighlightKey(state.selectedTranslationId, id)];
  } else {
    state.highlights[id] = color;
  }
  persistMembers();
  renderVerses();
}

function editVerseNote(bookId, chapter, verse) {
  const id = bookmarkId(bookId, chapter, verse);
  state.editingNoteId = state.editingNoteId === id ? null : id;
  renderVerses();
}

function saveVerseNote(id, value) {
  const trimmed = value.trim();
  if (trimmed) {
    state.notes[id] = trimmed;
  } else {
    delete state.notes[id];
  }
  state.editingNoteId = null;
  persistMembers();
  renderVerses();
}

function renderTranslationSelect() {
  els.translationSelect.replaceChildren(
    ...bibleBundle.translations.map((translation) => {
      const option = document.createElement("option");
      option.value = translation.id;
      option.textContent = translation.name;
      return option;
    }),
  );
  els.translationSelect.value = state.selectedTranslationId;
}

function renderCompareTranslationSelect() {
  selectedParallelTranslations();
  const createOptions = () =>
    bibleBundle.translations.map((translation) => {
      const option = document.createElement("option");
      option.value = translation.id;
      option.textContent = translation.name;
      return option;
    });
  els.compareTranslationSelect.replaceChildren(...createOptions());
  els.compareTranslationSelect2.replaceChildren(...createOptions());
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
  els.chapterReadToggle.textContent = isCurrentChapterRead() ? "현재 장 읽음 취소" : "현재 장 읽음 체크";
}

function renderDailyVerse() {
  const verse = dailyVerse();
  els.dailyVerseButton.textContent = `${verse.bookName} ${verse.chapter}:${verse.verse} ${verse.text}`;
  els.dailyVerseButton.onclick = () => {
    setBook(verse.bookId, verse.chapter);
  };
}

function renderGratitudePanel() {
  els.gratitudeStatus.textContent = state.gratitudeStatus || "";
  els.gratitudeList.innerHTML = "";
  if (state.gratitudeNotes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "gratitude-status";
    empty.textContent = "아직 나눠진 감사가 없습니다.";
    els.gratitudeList.append(empty);
    return;
  }

  state.gratitudeNotes.forEach((item) => {
    const note = document.createElement("article");
    note.className = "gratitude-note";
    const text = document.createElement("p");
    text.textContent = item.text || "";
    const meta = document.createElement("small");
    meta.textContent = item.name ? `${item.name}의 감사` : "감사 나눔";
    note.append(text, meta);
    els.gratitudeList.append(note);
  });
}

async function loadGratitudeNotes() {
  if (!authService?.enabled || !authService.loadGratitudeNotes) {
    state.gratitudeStatus = "공유 기능을 준비 중입니다.";
    renderGratitudePanel();
    return;
  }
  try {
    state.gratitudeStatus = "감사 한줄을 불러오는 중";
    renderGratitudePanel();
    state.gratitudeNotes = await withTimeout(authService.loadGratitudeNotes(), cloudTimeoutMs);
    state.gratitudeStatus = state.signedInUser ? "감사 한줄을 나눌 수 있습니다." : "Google 로그인 후 감사 한줄을 나눌 수 있습니다.";
    renderGratitudePanel();
  } catch {
    state.gratitudeStatus = "감사 한줄을 불러오지 못했습니다. Firestore 권한을 확인해 주세요.";
    renderGratitudePanel();
  }
}

async function submitGratitudeNote(event) {
  event.preventDefault();
  const text = els.gratitudeInput.value.trim();
  if (!text) return;
  if (!state.signedInUser) {
    state.gratitudeStatus = "Google 로그인 후 감사 한줄을 나눌 수 있습니다.";
    renderGratitudePanel();
    return;
  }
  try {
    state.gratitudeStatus = "감사 한줄을 저장하는 중";
    renderGratitudePanel();
    await withTimeout(authService.saveGratitudeNote(text), cloudTimeoutMs);
    els.gratitudeInput.value = "";
    await loadGratitudeNotes();
  } catch {
    state.gratitudeStatus = "감사 한줄 저장에 실패했습니다. Firestore 규칙을 확인해 주세요.";
    renderGratitudePanel();
  }
}

function devotionalValues() {
  return {
    date: els.devotionalDate.value || todayDateInputValue(),
    passage: els.devotionalPassage.value.trim(),
    insight: els.devotionalInsight.value.trim(),
    prayer: els.devotionalPrayer.value.trim(),
    action: els.devotionalAction.value.trim(),
  };
}

function clearDevotionalForm() {
  els.devotionalDate.value = todayDateInputValue();
  els.devotionalPassage.value = currentPassageLabel();
  els.devotionalInsight.value = "";
  els.devotionalPrayer.value = "";
  els.devotionalAction.value = "";
}

function fillDevotionalForm(note) {
  els.devotionalDate.value = note.date || todayDateInputValue();
  els.devotionalPassage.value = note.passage || "";
  els.devotionalInsight.value = note.insight || "";
  els.devotionalPrayer.value = note.prayer || "";
  els.devotionalAction.value = note.action || "";
}

function saveDevotionalNote(event) {
  event.preventDefault();
  const next = devotionalValues();
  if (!next.insight && !next.prayer && !next.action) {
    els.devotionalStatus.textContent = "깨달은 점, 기도 제목, 적용할 점 중 하나를 적어 주세요.";
    return;
  }

  const previous = state.devotionalNotes[next.date] || {};
  state.devotionalNotes[next.date] = {
    ...previous,
    ...next,
    passage: next.passage || currentPassageLabel(),
    updatedAt: new Date().toISOString(),
  };
  persistMembers();
  els.devotionalStatus.textContent = `${next.date} 묵상 노트를 저장했습니다.`;
  renderDevotionalList();
}

function editDevotionalNote(date) {
  const note = state.devotionalNotes[date];
  if (!note) return;
  fillDevotionalForm(note);
  els.devotionalStatus.textContent = `${date} 묵상 노트를 편집 중입니다.`;
}

function deleteDevotionalNote(date) {
  if (!window.confirm(`${date} 묵상 노트를 삭제할까요?`)) return;
  delete state.devotionalNotes[date];
  persistMembers();
  if (els.devotionalDate.value === date) {
    clearDevotionalForm();
  }
  els.devotionalStatus.textContent = `${date} 묵상 노트를 삭제했습니다.`;
  renderDevotionalList();
}

function renderDevotionalList() {
  const notes = Object.values(state.devotionalNotes || {}).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  els.devotionalList.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "devotional-status";
    empty.textContent = "아직 저장된 묵상 노트가 없습니다.";
    els.devotionalList.append(empty);
    return;
  }

  notes.slice(0, 8).forEach((note) => {
    const article = document.createElement("article");
    article.className = "devotional-note";

    const header = document.createElement("header");
    const date = document.createElement("strong");
    date.textContent = note.date || "날짜 없음";
    const passage = document.createElement("small");
    passage.textContent = note.passage || "본문 없음";
    header.append(date, passage);

    const summary = document.createElement("p");
    summary.textContent = note.insight || note.prayer || note.action || "내용 없음";

    const actions = document.createElement("div");
    actions.className = "devotional-note-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "편집";
    edit.addEventListener("click", () => editDevotionalNote(note.date));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "삭제";
    remove.addEventListener("click", () => deleteDevotionalNote(note.date));
    actions.append(edit, remove);

    article.append(header, summary, actions);
    els.devotionalList.append(article);
  });
}

function renderDevotionalPanel() {
  if (!els.devotionalDate.value) {
    clearDevotionalForm();
  }
  renderDevotionalList();
}

function renderReadingPlan() {
  const translation = selectedTranslation();
  const book = selectedBook();
  const member = activeMember();
  const readSet = new Set(member.readChapters || []);
  els.readingPlan.innerHTML = book.chapters
    .map((chapter) => {
      const id = chapterProgressId(translation.id, book.id, chapter.chapter);
      const read = readSet.has(id);
      const active = chapter.chapter === state.selectedChapter;
      return `<button type="button" class="${read ? "read" : ""} ${active ? "active" : ""}" data-plan-chapter="${chapter.chapter}">${chapter.chapter}</button>`;
    })
    .join("");
}

function renderBookSelect() {
  const translation = selectedTranslation();
  els.bookSelect.replaceChildren(
    ...translation.books.map((book) => {
      const option = document.createElement("option");
      option.value = book.id;
      option.textContent = book.name;
      return option;
    }),
  );
  els.bookSelect.value = state.selectedBookId;
}

function renderChapterSelect() {
  const book = selectedBook();
  els.chapterSelect.replaceChildren(
    ...book.chapters.map((chapter) => {
      const option = document.createElement("option");
      option.value = chapter.chapter;
      option.textContent = `${chapter.chapter}장`;
      return option;
    }),
  );
  els.chapterSelect.value = state.selectedChapter;
}

function renderTabs() {
  const translation = selectedTranslation();
  const hasOld = translation.books.some((book) => book.testament === "old");
  const hasNew = translation.books.some((book) => book.testament === "new");
  els.oldTab.classList.toggle("active", state.activeTestament === "old");
  els.newTab.classList.toggle("active", state.activeTestament === "new");
  els.oldTab.disabled = !hasOld;
  els.newTab.disabled = !hasNew;
}

function renderBookButtons() {
  const translation = selectedTranslation();
  const books = translation.books.filter((book) => book.testament === state.activeTestament);
  if (!books.length) {
    els.bookList.textContent = state.activeTestament === "old" ? "구약 원어 데이터는 준비 중입니다." : "표시할 성경이 없습니다.";
    return;
  }

  els.bookList.replaceChildren(
    ...books.map((book) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = book.id === state.selectedBookId ? "active" : "";
      button.dataset.bookId = book.id;
      button.textContent = book.name;
      return button;
    }),
  );
}

function renderSourceAttribution() {
  const visibleTranslations = state.compareMode
    ? selectedParallelTranslations()
    : [selectedTranslation()];
  const sourceTranslations = visibleTranslations.filter((translation) => translation.source);
  const uniqueSources = [...new Map(sourceTranslations.map((translation) => [translation.id, translation])).values()];
  if (!uniqueSources.length) {
    els.sourceAttribution.hidden = true;
    els.sourceAttribution.replaceChildren();
    return;
  }

  const title = document.createElement("span");
  title.textContent = "원문 출처";
  const items = uniqueSources.map((translation) => {
    const source = translation.source;
    const paragraph = document.createElement("p");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.title;
    paragraph.append(link, ` · ${source.license} · ${source.copyright}`);
    return paragraph;
  });

  els.sourceAttribution.hidden = false;
  els.sourceAttribution.replaceChildren(title, ...items);
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
    : state.highlightFilter
      ? `형광펜 · ${highlightLabel(state.highlightFilter)}`
    : `${translation.name} · ${translation.verseCount.toLocaleString()}절`;
  els.readerTitle.textContent = state.showFavorites
    ? "즐겨찾기"
    : state.highlightFilter
      ? "형광펜 모아보기"
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
  els.highlightFilter.querySelectorAll("button[data-highlight-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.highlightFilter === state.highlightFilter);
  });
  renderAuthPanel();
  renderProgress();
  renderReadingPlan();
}

function highlightLabel(color) {
  return {
    yellow: "노랑",
    green: "초록",
    pink: "분홍",
    blue: "파랑",
  }[color] || color;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some browsers expose the Clipboard API but deny it in embedded contexts.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function showCopyStatus(success) {
  const previousStatus = els.authStatus.textContent;
  els.authStatus.textContent = success ? "구절이 복사되었습니다" : "복사하지 못했습니다";
  window.setTimeout(() => {
    if (els.authStatus.textContent === "구절이 복사되었습니다" || els.authStatus.textContent === "복사하지 못했습니다") {
      els.authStatus.textContent = previousStatus;
    }
  }, 1400);
}

function formatVerseCopy({ translationName, bookName, chapter, verse, text }) {
  return `[${translationName}] ${bookName} ${chapter}:${verse} ${text}`;
}

function attachCopyHandler(element, copyPayload) {
  element.classList.add("copyable-verse");
  element.title = "클릭하면 구절이 복사됩니다";
  element.addEventListener("click", () => {
    copyText(formatVerseCopy(copyPayload))
      .then(() => showCopyStatus(true))
      .catch(() => showCopyStatus(false));
  });
}

function appendHighlightedText(element, text, query, textHighlights = []) {
  const highlights = textHighlights.filter((item) => item.end > item.start);
  if (!query && highlights.length === 0) {
    element.textContent = text;
    return;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query?.toLowerCase() || "";
  const queryRanges = [];
  if (lowerQuery) {
    let queryIndex = lowerText.indexOf(lowerQuery);
    while (queryIndex !== -1) {
      queryRanges.push({ start: queryIndex, end: queryIndex + query.length });
      queryIndex = lowerText.indexOf(lowerQuery, queryIndex + query.length);
    }
  }

  let index = 0;
  while (index < text.length) {
    const color = highlights.find((item) => index >= item.start && index < item.end)?.color || "";
    const matchedQuery = queryRanges.some((item) => index >= item.start && index < item.end);
    let end = index + 1;
    while (end < text.length) {
      const nextColor = highlights.find((item) => end >= item.start && end < item.end)?.color || "";
      const nextQuery = queryRanges.some((item) => end >= item.start && end < item.end);
      if (nextColor !== color || nextQuery !== matchedQuery) break;
      end += 1;
    }

    const chunk = text.slice(index, end);
    if (matchedQuery) {
      const mark = document.createElement("mark");
      mark.textContent = chunk;
      if (color) mark.className = `text-highlight text-highlight-${color}`;
      element.append(mark);
    } else if (color) {
      const span = document.createElement("span");
      span.className = `text-highlight text-highlight-${color}`;
      span.textContent = chunk;
      element.append(span);
    } else {
      element.append(document.createTextNode(chunk));
    }
    index = end;
  }
}

function morphSummary(morph = "") {
  const parts = [];
  if (morph.includes("/N")) parts.push("명사");
  if (morph.includes("/V") || morph.includes("HV")) parts.push("동사");
  if (morph.includes("/A") || morph.includes("HA")) parts.push("형용사");
  if (morph.includes("/R") || morph.includes("HR")) parts.push("전치사");
  if (morph.includes("/C") || morph.includes("HC")) parts.push("접속");
  if (morph.includes("/T") || morph.includes("HT")) parts.push("관사/표지");
  return parts.length ? `${parts.join(", ")} · ${morph}` : morph || "문법 정보 없음";
}

function showHebrewWordPanel(panel, token) {
  panel.hidden = false;
  panel.replaceChildren();

  const word = document.createElement("strong");
  word.textContent = token.text;
  word.dir = "rtl";
  word.lang = "he";

  const rows = [
    ["음역", token.transliteration || "음역 준비 중"],
    ["뜻", token.meaning || "뜻 사전 준비 중"],
    ["원형", token.lemma || (token.strong ? `Strong ${token.strong}` : "원형 정보 없음")],
    ["문법", morphSummary(token.morph)],
  ];

  panel.append(word);
  rows.forEach(([label, value]) => {
    const row = document.createElement("p");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("b");
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    panel.append(row);
  });
}

function appendHebrewTokens(element, verseData, detailsPanel) {
  let previousWasWord = false;
  (verseData.tokens || []).forEach((token) => {
    if (token.type === "word") {
      if (previousWasWord) element.append(document.createTextNode(" "));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hebrew-token";
      button.textContent = token.text;
      button.dir = "rtl";
      button.lang = "he";
      button.title = `${token.transliteration || "음역"} · ${token.meaning || "뜻"}`;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        showHebrewWordPanel(detailsPanel, token);
      });
      element.append(button);
      previousWasWord = true;
      return;
    }

    element.append(document.createTextNode(token.text));
    previousWasWord = token.text !== "־";
  });
}

function hebrewTransliteration(tokens = []) {
  return tokens
    .filter((token) => token.type === "word" && token.transliteration)
    .map((token) => token.transliteration)
    .join(" ");
}

function createHebrewTransliteration(tokens = [], compact = false) {
  const transliteration = hebrewTransliteration(tokens);
  if (!transliteration) return null;

  const wrapper = document.createElement("div");
  wrapper.className = `hebrew-transliteration${compact ? " compact" : ""}`;
  const label = document.createElement("span");
  label.textContent = "음역";
  const text = document.createElement("p");
  text.textContent = transliteration;
  wrapper.append(label, text);
  return wrapper;
}

function applyHighlight(row, id) {
  const highlight = state.highlights[id];
  if (highlight) {
    row.dataset.highlight = highlight;
  }
}

function hasTextHighlightColor(verseId, color) {
  const key = textHighlightKey(state.selectedTranslationId, verseId);
  return (state.textHighlights[key] || []).some((item) => item.color === color);
}

function createVerseActions({ bookId, chapter, verse, marked }) {
  const actions = document.createElement("div");
  actions.className = "verse-actions";
  const id = bookmarkId(bookId, chapter, verse);

  const save = document.createElement("button");
  save.type = "button";
  save.className = `verse-save${marked ? " saved" : ""}`;
  save.textContent = marked ? "저장됨" : "저장";
  save.addEventListener("click", () => toggleBookmark(bookId, chapter, verse));

  const palette = document.createElement("div");
  palette.className = "highlight-palette";
  [
    ["yellow", "노랑"],
    ["green", "초록"],
    ["pink", "분홍"],
    ["blue", "파랑"],
  ].forEach(([color, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `highlight-swatch highlight-${color}`;
    button.dataset.highlightColor = color;
    button.title = `${label} 형광펜`;
    button.setAttribute("aria-label", `${label} 형광펜`);
    button.classList.toggle("active", state.highlights[id] === color || hasTextHighlightColor(id, color));
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("touchstart", () => captureTextSelection(), { passive: true });
    button.addEventListener("click", () => toggleHighlight(bookId, chapter, verse, color));
    palette.append(button);
  });

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "highlight-clear";
  clear.dataset.highlightColor = "clear";
  clear.textContent = "지우기";
  clear.addEventListener("mousedown", (event) => event.preventDefault());
  clear.addEventListener("touchstart", () => captureTextSelection(), { passive: true });
  clear.addEventListener("click", () => toggleHighlight(bookId, chapter, verse, "clear"));
  palette.append(clear);

  const note = document.createElement("button");
  note.type = "button";
  note.dataset.noteButton = bookmarkId(bookId, chapter, verse);
  note.className = `verse-note-button${state.notes[bookmarkId(bookId, chapter, verse)] ? " has-note" : ""}`;
  note.textContent = state.notes[bookmarkId(bookId, chapter, verse)] ? "메모됨" : "메모";
  note.addEventListener("click", () => editVerseNote(bookId, chapter, verse));

  actions.append(save, palette, note);
  return actions;
}

function createNoteElement(id) {
  const noteText = state.notes[id];
  if (!noteText) return null;

  const note = document.createElement("p");
  note.className = "verse-note";
  note.textContent = noteText;
  return note;
}

function createNoteEditor(id) {
  if (state.editingNoteId !== id) return null;

  const editor = document.createElement("div");
  editor.className = "verse-note-editor";
  editor.dataset.noteEditor = id;

  const textarea = document.createElement("textarea");
  textarea.value = state.notes[id] || "";
  textarea.placeholder = "구절 메모";
  textarea.rows = 3;

  const actions = document.createElement("div");

  const save = document.createElement("button");
  save.type = "button";
  save.dataset.noteSave = id;
  save.textContent = "저장";
  save.addEventListener("click", () => saveVerseNote(id, textarea.value));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.dataset.noteDelete = id;
  remove.textContent = "삭제";
  remove.addEventListener("click", () => saveVerseNote(id, ""));

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "취소";
  cancel.addEventListener("click", () => {
    state.editingNoteId = null;
    renderVerses();
  });

  actions.append(save, remove, cancel);
  editor.append(textarea, actions);
  return editor;
}

function createVerseRow({ bookId, chapter, verse, text, tokens, refLabel, searchResult, searchQuery }) {
  const id = bookmarkId(bookId, chapter, verse);
  const marked = state.bookmarks.has(id);
  const translation = selectedTranslation();
  const book = translation.books.find((item) => item.id === bookId) || selectedBook();
  const row = document.createElement("section");
  row.className = `verse-row${marked ? " marked" : ""}`;
  row.dataset.verseId = id;
  applyHighlight(row, id);

  const ref = document.createElement("button");
  ref.type = "button";
  ref.className = "verse-ref";
  ref.textContent = refLabel || verse;
  if (searchResult) {
    ref.addEventListener("click", () => setBook(bookId, chapter));
  }

  const body = document.createElement("div");
  body.className = "verse-text";
  body.dataset.verseId = id;
  if (translation.language === "he") {
    body.dir = "rtl";
    body.lang = "he";
  }
  const hebrewDetails = document.createElement("div");
  hebrewDetails.className = "hebrew-word-panel";
  hebrewDetails.hidden = true;
  if (translation.language === "he" && tokens?.length) {
    appendHebrewTokens(body, { text, tokens }, hebrewDetails);
  } else {
    appendHighlightedText(body, text, searchQuery, state.textHighlights[textHighlightKey(translation.id, id)] || []);
  }
  attachCopyHandler(body, {
    translationName: translation.name,
    bookName: book.name,
    chapter,
    verse,
    text,
  });
  const noteEditor = createNoteEditor(id);
  const note = createNoteElement(id);
  const content = document.createElement("div");
  content.className = "verse-content";
  content.append(body);
  if (translation.language === "he" && tokens?.length) {
    const transliteration = createHebrewTransliteration(tokens);
    if (transliteration) content.append(transliteration);
    content.append(hebrewDetails);
  }
  if (noteEditor) {
    content.append(noteEditor);
  } else if (note) {
    content.append(note);
  }

  row.append(ref, content, createVerseActions({ bookId, chapter, verse, marked }));
  return row;
}

function findTranslationVerse(translation, bookId, chapterNumber, verseNumber) {
  const book = translation.books.find((item) => item.id === bookId);
  const chapter = book?.chapters.find((item) => item.chapter === chapterNumber);
  return chapter?.verses.find((item) => item.verse === verseNumber);
}

function verseFromRef(translation, [bookId, chapterNumber, verseNumber]) {
  const book = translation.books.find((item) => item.id === bookId);
  const chapter = book?.chapters.find((item) => item.chapter === chapterNumber);
  const verse = chapter?.verses.find((item) => item.verse === verseNumber);
  if (!book || !chapter || !verse) return null;
  return {
    ...verse,
    bookId: book.id,
    bookName: book.name,
    chapter: chapter.chapter,
  };
}

function createComparePane(translation, { bookName, chapter, verse, verseData }) {
  const pane = document.createElement("div");
  pane.className = "compare-pane";
  const label = document.createElement("strong");
  label.textContent = translation.name;
  const verseText = document.createElement("p");
  const text = verseData?.text || "";
  const hebrewDetails = document.createElement("div");
  hebrewDetails.className = "hebrew-word-panel compact";
  hebrewDetails.hidden = true;
  if (translation.language === "he") {
    verseText.dir = "rtl";
    verseText.lang = "he";
  }
  if (translation.language === "he" && verseData?.tokens?.length) {
    appendHebrewTokens(verseText, verseData, hebrewDetails);
  } else {
    verseText.textContent = text || "해당 절 없음";
  }
  if (text) {
    attachCopyHandler(verseText, {
      translationName: translation.name,
      bookName,
      chapter,
      verse,
      text,
    });
  }
  pane.append(label, verseText);
  if (translation.language === "he" && verseData?.tokens?.length) {
    const transliteration = createHebrewTransliteration(verseData.tokens, true);
    if (transliteration) pane.append(transliteration);
    pane.append(hebrewDetails);
  }
  return pane;
}

function createCompareVerseRow(verseData) {
  const { bookId, chapter, verse, text } = verseData;
  const id = bookmarkId(bookId, chapter, verse);
  const marked = state.bookmarks.has(id);
  const parallelTranslations = selectedParallelTranslations();
  const bookName = selectedBook().name;
  const row = document.createElement("section");
  row.className = `verse-row compare-row${marked ? " marked" : ""}`;
  row.dataset.verseId = id;
  applyHighlight(row, id);

  const ref = document.createElement("button");
  ref.type = "button";
  ref.className = "verse-ref";
  ref.textContent = verse;

  const body = document.createElement("div");
  body.className = "compare-grid";

  parallelTranslations.forEach((translation, index) => {
    const paneVerse = index === 0 ? verseData : findTranslationVerse(translation, bookId, chapter, verse);
    body.append(createComparePane(translation, { bookName, chapter, verse, verseData: paneVerse }));
  });
  const noteEditor = createNoteEditor(id);
  const note = createNoteElement(id);
  const content = document.createElement("div");
  content.className = "verse-content";
  content.append(body);
  if (noteEditor) {
    content.append(noteEditor);
  } else if (note) {
    content.append(note);
  }

  row.append(ref, content, createVerseActions({ bookId, chapter, verse, marked }));
  return row;
}

function renderVerses() {
  const query = els.searchInput.value.trim();
  const lowerQuery = query.toLowerCase();
  els.verseList.innerHTML = "";

  if (state.highlightFilter) {
    els.resultSummary.hidden = false;
    const verses = highlightedVerses(state.highlightFilter);
    els.resultSummary.textContent = `${highlightLabel(state.highlightFilter)} 형광펜 ${verses.length}개`;

    if (verses.length === 0) {
      els.verseList.innerHTML = '<p class="empty">이 색으로 표시한 구절이 없습니다.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    verses.forEach((verse) => {
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
          searchQuery: query,
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
  renderSourceAttribution();
  renderDailyVerse();
  renderGratitudePanel();
  renderDevotionalPanel();
  renderHeader();
  renderVerses();
}

async function renderAfterCompareSelection() {
  await ensureVisibleTranslationsLoaded();
  selectedParallelTranslations();
  renderCompareTranslationSelect();
  renderSourceAttribution();
  renderHeader();
  renderVerses();
}

els.translationSelect.addEventListener("change", async (event) => {
  await setTranslation(event.target.value);
});
els.compareTranslationSelect.addEventListener("change", async (event) => {
  state.compareTranslationId = event.target.value;
  await renderAfterCompareSelection();
});
els.compareTranslationSelect2.addEventListener("change", async (event) => {
  state.compareTranslationId2 = event.target.value;
  await renderAfterCompareSelection();
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
els.lastReadButton.addEventListener("click", async () => {
  const lastRead = activeMember().lastRead;
  if (!lastRead) return;
  await setTranslation(lastRead.translationId);
  setBook(lastRead.bookId, lastRead.chapter);
});
els.chapterReadToggle.addEventListener("click", toggleCurrentChapterRead);
els.bookSelect.addEventListener("change", (event) => setBook(event.target.value));
els.chapterSelect.addEventListener("change", (event) => setChapter(event.target.value));
els.oldTab.addEventListener("click", () => {
  if (!selectedTranslation().books.some((book) => book.testament === "old")) return;
  state.activeTestament = "old";
  renderTabs();
  renderBookButtons();
});
els.newTab.addEventListener("click", () => {
  if (!selectedTranslation().books.some((book) => book.testament === "new")) return;
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
els.readingPlan.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-plan-chapter]");
  if (button) {
    setChapter(button.dataset.planChapter);
  }
});
els.searchInput.addEventListener("input", () => {
  state.showFavorites = false;
  state.highlightFilter = null;
  state.lastTextSelection = null;
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
  state.highlightFilter = null;
  els.searchInput.value = "";
  renderHeader();
  renderVerses();
});
els.compareToggle.addEventListener("click", async () => {
  state.compareMode = !state.compareMode;
  state.showFavorites = false;
  state.highlightFilter = null;
  els.searchInput.value = "";
  await ensureVisibleTranslationsLoaded();
  renderSourceAttribution();
  renderHeader();
  renderVerses();
});
els.highlightFilter.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-highlight-filter]");
  if (!button) return;
  state.highlightFilter = state.highlightFilter === button.dataset.highlightFilter ? null : button.dataset.highlightFilter;
  state.showFavorites = false;
  state.lastTextSelection = null;
  els.searchInput.value = "";
  renderHeader();
  renderVerses();
});
els.gratitudeForm.addEventListener("submit", submitGratitudeNote);
els.devotionalForm.addEventListener("submit", saveDevotionalNote);
els.useCurrentPassageButton.addEventListener("click", () => {
  els.devotionalPassage.value = currentPassageLabel();
  els.devotionalStatus.textContent = "현재 읽는 본문을 넣었습니다.";
});

document.addEventListener("selectionchange", captureTextSelection);

loadActiveMember();
persistMembers();
render();
saveBookmarks();
subscribeAuthChanges();
loadGratitudeNotes();
