// ==========================================================================
// BIBLE READER - CORE APPLICATION LOGIC
// ==========================================================================

// 1. Bible Books Configuration
const BIBLE_BOOKS = [
    { eng: 'Genesis', kor: '창세기', abb: '창', type: 'OT' },
    { eng: 'Exodus', kor: '출애굽기', abb: '출', type: 'OT' },
    { eng: 'Leviticus', kor: '레위기', abb: '레', type: 'OT' },
    { eng: 'Numbers', kor: '민수기', abb: '민', type: 'OT' },
    { eng: 'Deuteronomy', kor: '신명기', abb: '신', type: 'OT' },
    { eng: 'Joshua', kor: '여호수아', abb: '여', type: 'OT' },
    { eng: 'Judges', kor: '사사기', abb: '삿', type: 'OT' },
    { eng: 'Ruth', kor: '룻기', abb: '룻', type: 'OT' },
    { eng: '1 Samuel', kor: '사무엘상', abb: '삼상', type: 'OT' },
    { eng: '2 Samuel', kor: '사무엘하', abb: '삼하', type: 'OT' },
    { eng: '1 Kings', kor: '열왕기상', abb: '왕상', type: 'OT' },
    { eng: '2 Kings', kor: '열왕기하', abb: '왕하', type: 'OT' },
    { eng: '1 Chronicles', kor: '역대기상', abb: '대상', type: 'OT' },
    { eng: '2 Chronicles', kor: '역대기하', abb: '대하', type: 'OT' },
    { eng: 'Ezra', kor: '에스라', abb: '스', type: 'OT' },
    { eng: 'Nehemiah', kor: '느헤미야', abb: '느', type: 'OT' },
    { eng: 'Esther', kor: '에스더', abb: '에', type: 'OT' },
    { eng: 'Job', kor: '욥기', abb: '욥', type: 'OT' },
    { eng: 'Psalms', kor: '시편', abb: '시', type: 'OT' },
    { eng: 'Proverbs', kor: '잠언', abb: '잠', type: 'OT' },
    { eng: 'Ecclesiastes', kor: '전도서', abb: '전', type: 'OT' },
    { eng: 'Song of Solomon', kor: '아가', abb: '아', type: 'OT' },
    { eng: 'Isaiah', kor: '이사야', abb: '사', type: 'OT' },
    { eng: 'Jeremiah', kor: '예레미야', abb: '렘', type: 'OT' },
    { eng: 'Lamentations', kor: '예레미야애가', abb: '애', type: 'OT' },
    { eng: 'Ezekiel', kor: '에스겔', abb: '겔', type: 'OT' },
    { eng: 'Daniel', kor: '다니엘', abb: '단', type: 'OT' },
    { eng: 'Hosea', kor: '호세아', abb: '호', type: 'OT' },
    { eng: 'Joel', kor: '요엘', abb: '욜', type: 'OT' },
    { eng: 'Amos', kor: '아모스', abb: '암', type: 'OT' },
    { eng: 'Obadiah', kor: '오바디야', abb: '오', type: 'OT' },
    { eng: 'Jonah', kor: '요나', abb: '욘', type: 'OT' },
    { eng: 'Micah', kor: '미가', abb: '미', type: 'OT' },
    { eng: 'Nahum', kor: '나훔', abb: '나', type: 'OT' },
    { eng: 'Habakkuk', kor: '하박국', abb: '합', type: 'OT' },
    { eng: 'Zephaniah', kor: '스바냐', abb: '습', type: 'OT' },
    { eng: 'Haggai', kor: '학개', abb: '학', type: 'OT' },
    { eng: 'Zechariah', kor: '스가랴', abb: '슥', type: 'OT' },
    { eng: 'Malachi', kor: '말라기', abb: '말', type: 'OT' },
    { eng: 'Matthew', kor: '마태복음', abb: '마', type: 'NT' },
    { eng: 'Mark', kor: '마가복음', abb: '막', type: 'NT' },
    { eng: 'Luke', kor: '누가복음', abb: '누', type: 'NT' },
    { eng: 'John', kor: '요한복음', abb: '요', type: 'NT' },
    { eng: 'Acts', kor: '사도행전', abb: '행', type: 'NT' },
    { eng: 'Romans', kor: '로마서', abb: '롬', type: 'NT' },
    { eng: '1 Corinthians', kor: '고린도전서', abb: '고전', type: 'NT' },
    { eng: '2 Corinthians', kor: '고린도후서', abb: '고후', type: 'NT' },
    { eng: 'Galatians', kor: '갈라디아서', abb: '갈', type: 'NT' },
    { eng: 'Ephesians', kor: '에베소서', abb: '엡', type: 'NT' },
    { eng: 'Philippians', kor: '빌립보서', abb: '빌', type: 'NT' },
    { eng: 'Colossians', kor: '골로새서', abb: '골', type: 'NT' },
    { eng: '1 Thessalonians', kor: '데살로니가전서', abb: '살전', type: 'NT' },
    { eng: '2 Thessalonians', kor: '데살로니가후서', abb: '살후', type: 'NT' },
    { eng: '1 Timothy', kor: '디모데전서', abb: '딤전', type: 'NT' },
    { eng: '2 Timothy', kor: '디모데후서', abb: '딤후', type: 'NT' },
    { eng: 'Titus', kor: '디도서', abb: '딛', type: 'NT' },
    { eng: 'Philemon', kor: '빌레몬서', abb: '몬', type: 'NT' },
    { eng: 'Hebrews', kor: '히브리서', abb: '히', type: 'NT' },
    { eng: 'James', kor: '야고보서', abb: '약', type: 'NT' },
    { eng: '1 Peter', kor: '베드로전서', abb: '벧전', type: 'NT' },
    { eng: '2 Peter', kor: '베드로후서', abb: '벧후', type: 'NT' },
    { eng: '1 John', kor: '요한일서', abb: '요일', type: 'NT' },
    { eng: '2 John', kor: '요한이서', abb: '요이', type: 'NT' },
    { eng: '3 John', kor: '요한삼서', abb: '요삼', type: 'NT' },
    { eng: 'Jude', kor: '유다서', abb: '유', type: 'NT' },
    { eng: 'Revelation', kor: '요한계시록', abb: '계', type: 'NT' }
];

// Curated Daily Verses List
const DAILY_VERSES = [
    { text: "태초에 하나님이 천지를 창조하시니라", ref: "창세기 1:1" },
    { text: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1" },
    { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
    { text: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라", ref: "로마서 8:28" },
    { text: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라", ref: "이사야 41:10" },
    { text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라", ref: "잠언 3:5-6" },
    { text: "그런즉 너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라", ref: "마태복음 6:33" },
    { text: "사랑하는 자여 네 영혼이 잘됨 같이 네가 범사에 잘되고 강건하기를 내가 간구하노라", ref: "요한삼서 1:2" },
    { text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라", ref: "데살로니가전서 5:16-18" },
    { text: "너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라", ref: "베드로전서 5:7" },
    { text: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", ref: "시편 119:105" },
    { text: "믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니", ref: "히브리서 11:1" },
    { text: "사랑 안에 두려움이 없고 온전한 사랑이 두려움을 내쫓나니", ref: "요한일서 4:18" },
    { text: "하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라", ref: "시편 46:1" },
    { text: "그런즉 믿음, 소망, 사랑, 이 세 가지는 항상 있을 것인데 그 중의 제일은 사랑이라", ref: "고린도전서 13:13" },
    { text: "모든 지킬 만한 것 중에 더욱 네 마음을 지키라 생명의 근원이 이에서 남이니라", ref: "잠언 4:23" },
    { text: "예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라", ref: "요한복음 14:6" },
    { text: "너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라", ref: "잠언 16:3" },
    { text: "사람이 마음으로 자기의 길을 계획할지라도 그의 걸음을 인도하시는 이는 여호와시니라", ref: "잠언 16:9" },
    { text: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라", ref: "마태복음 11:28" }
];

// 2. Application State
let bibleData = null;
let currentBookIdx = 0;   // Genesis
let currentChapterIdx = 0; // Chapter 1
let activeTestament = 'OT'; // 'OT' or 'NT'

// Persistent Data
let highlights = {};
let bookmarks = [];
let notes = {};
let settings = {
    theme: 'sepia',
    fontSize: 18,
    fontStyle: 'myeongjo',
    lineHeight: 1.8
};

// Selected Verse for Popover
let selectedVerse = null; // { bookIdx, chapIdx, verseIdx, element }

// 3. DOM Elements
const elements = {
    appContainer: document.getElementById('appContainer'),
    appSidebar: document.getElementById('appSidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    menuBtn: document.getElementById('menuBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    
    // Tabs & Lists
    tabOtBtn: document.getElementById('tabOtBtn'),
    tabNtBtn: document.getElementById('tabNtBtn'),
    booksContainer: document.getElementById('booksContainer'),
    
    // Header
    currentLocation: document.getElementById('currentLocation'),
    currentBookName: document.getElementById('currentBookName'),
    currentChapterNum: document.getElementById('currentChapterNum'),
    quickNavTrigger: document.getElementById('quickNavTrigger'),
    headerSearchBtn: document.getElementById('headerSearchBtn'),
    sidebarSearchBtn: document.getElementById('sidebarSearchBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    libraryBtn: document.getElementById('libraryBtn'),
    sidebarLibraryBtn: document.getElementById('sidebarLibraryBtn'),
    
    // Quick Nav
    quickNavPanel: document.getElementById('quickNavPanel'),
    quickNavCloseBtn: document.getElementById('quickNavCloseBtn'),
    quickBooksList: document.getElementById('quickBooksList'),
    quickChaptersGrid: document.getElementById('quickChaptersGrid'),
    
    // Reading Viewer
    viewerContainer: document.getElementById('viewerContainer'),
    dailyVerseCard: document.getElementById('dailyVerseCard'),
    dailyVerseText: document.getElementById('dailyVerseText'),
    dailyVerseRef: document.getElementById('dailyVerseRef'),
    chapterTitle: document.getElementById('chapterTitle'),
    versesList: document.getElementById('versesList'),
    prevChapterBtn: document.getElementById('prevChapterBtn'),
    nextChapterBtn: document.getElementById('nextChapterBtn'),
    
    // Drawers
    searchDrawer: document.getElementById('searchDrawer'),
    closeSearchDrawerBtn: document.getElementById('closeSearchDrawerBtn'),
    searchInput: document.getElementById('searchInput'),
    searchSubmitBtn: document.getElementById('searchSubmitBtn'),
    searchStats: document.getElementById('searchStats'),
    searchResults: document.getElementById('searchResults'),
    
    libraryDrawer: document.getElementById('libraryDrawer'),
    closeLibraryDrawerBtn: document.getElementById('closeLibraryDrawerBtn'),
    libTabBookmarks: document.getElementById('libTabBookmarks'),
    libTabNotes: document.getElementById('libTabNotes'),
    libTabHighlights: document.getElementById('libTabHighlights'),
    libraryContent: document.getElementById('libraryContent'),
    
    // Modals
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
    themeBtns: document.querySelectorAll('.theme-select-btn'),
    fontBtns: document.querySelectorAll('.font-select-btn'),
    fontSizeSlider: document.getElementById('fontSizeSlider'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    lineHeightSlider: document.getElementById('lineHeightSlider'),
    lineHeightValue: document.getElementById('lineHeightValue'),
    
    // Popover Action Menu
    verseActionPopover: document.getElementById('verseActionPopover'),
    popoverBookmarkBtn: document.getElementById('popoverBookmarkBtn'),
    popoverNoteBtn: document.getElementById('popoverNoteBtn'),
    popoverCopyBtn: document.getElementById('popoverCopyBtn'),
    popoverNoteContainer: document.getElementById('popoverNoteContainer'),
    popoverNoteText: document.getElementById('popoverNoteText'),
    popoverNoteCancel: document.getElementById('popoverNoteCancel'),
    popoverNoteSave: document.getElementById('popoverNoteSave'),
    highlightDots: document.querySelectorAll('.highlight-dot'),
    highlightClearBtn: document.querySelector('.highlight-clear')
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    loadLocalStorageData();
    applySettings();
    displayDailyVerse();
    
    try {
        await loadBibleData();
        renderSidebarBooks();
        loadHistory();
        renderChapter();
        setupEventListeners();
        lucide.createIcons();
    } catch (err) {
        console.error("앱 초기화 오류:", err);
        elements.chapterTitle.textContent = "데이터 로딩 오류";
        elements.versesList.innerHTML = `<div class="library-empty">
            <i data-lucide="alert-triangle"></i>
            <p>성경 데이터를 불러오는 과정에서 오류가 발생했습니다.<br>페이지를 새로고침 하거나 경로를 확인해 주세요.</p>
        </div>`;
        lucide.createIcons();
    }
});

// Load Data from LocalStorage
function loadLocalStorageData() {
    const savedSettings = localStorage.getItem('bible_reader_settings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    
    const savedHighlights = localStorage.getItem('bible_reader_highlights');
    if (savedHighlights) {
        highlights = JSON.parse(savedHighlights);
    }
    
    const savedBookmarks = localStorage.getItem('bible_reader_bookmarks');
    if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
    }
    
    const savedNotes = localStorage.getItem('bible_reader_notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}

// Save to LocalStorage
function saveSettings() {
    localStorage.setItem('bible_reader_settings', JSON.stringify(settings));
}

function saveHighlights() {
    localStorage.setItem('bible_reader_highlights', JSON.stringify(highlights));
}

function saveBookmarks() {
    localStorage.setItem('bible_reader_bookmarks', JSON.stringify(bookmarks));
}

function saveNotes() {
    localStorage.setItem('bible_reader_notes', JSON.stringify(notes));
}

// Fetch the Bible JSON file
async function loadBibleData() {
    const response = await fetch('data/ko_ko.json');
    if (!response.ok) {
        throw new Error('성경 데이터 파일을 가져올 수 없습니다.');
    }
    bibleData = await response.json();
}

// Render Daily Verse
function displayDailyVerse() {
    const day = new Date().getDate();
    const verse = DAILY_VERSES[day % DAILY_VERSES.length];
    elements.dailyVerseText.textContent = `"${verse.text}"`;
    elements.dailyVerseRef.textContent = verse.ref;
}

// Load last read history
function loadHistory() {
    const history = localStorage.getItem('bible_reader_history');
    if (history) {
        const { bookIdx, chapterIdx } = JSON.parse(history);
        if (bookIdx >= 0 && bookIdx < 66) {
            currentBookIdx = bookIdx;
            activeTestament = BIBLE_BOOKS[bookIdx].type;
            
            const maxChapters = bibleData[bookIdx].chapters.length;
            currentChapterIdx = (chapterIdx >= 0 && chapterIdx < maxChapters) ? chapterIdx : 0;
            
            // Set tab state
            if (activeTestament === 'OT') {
                elements.tabOtBtn.classList.add('active');
                elements.tabNtBtn.classList.remove('active');
            } else {
                elements.tabNtBtn.classList.add('active');
                elements.tabOtBtn.classList.remove('active');
            }
        }
    }
}

// Save reading history
function saveHistory() {
    const history = {
        bookIdx: currentBookIdx,
        chapterIdx: currentChapterIdx
    };
    localStorage.setItem('bible_reader_history', JSON.stringify(history));
}

// ==========================================================================
// RENDERERS
// ==========================================================================

// Render book list in the sidebar
function renderSidebarBooks() {
    elements.booksContainer.innerHTML = '';
    
    BIBLE_BOOKS.forEach((book, idx) => {
        if (book.type !== activeTestament) return;
        
        const chaptersCount = bibleData[idx].chapters.length;
        
        // Container for book and its chapters
        const container = document.createElement('div');
        container.className = `book-item-container ${idx === currentBookIdx ? 'expanded' : ''}`;
        
        // Book select button
        const bookBtn = document.createElement('button');
        bookBtn.className = `book-item ${idx === currentBookIdx ? 'active' : ''}`;
        bookBtn.innerHTML = `
            <span>${book.kor}</span>
            <span class="chapters-count">${chaptersCount}장</span>
        `;
        
        // Chapters selection grid
        const grid = document.createElement('div');
        grid.className = 'sidebar-chapters-grid';
        
        for (let i = 0; i < chaptersCount; i++) {
            const chapBtn = document.createElement('button');
            chapBtn.className = `sidebar-chapter-btn ${idx === currentBookIdx && i === currentChapterIdx ? 'active' : ''}`;
            chapBtn.textContent = i + 1;
            
            chapBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering book toggle
                navigateTo(idx, i);
                
                // On mobile, close sidebar after selecting a chapter
                if (window.innerWidth <= 768) {
                    elements.appSidebar.classList.remove('open');
                    elements.sidebarOverlay.classList.remove('open');
                }
            });
            grid.appendChild(chapBtn);
        }
        
        bookBtn.addEventListener('click', () => {
            if (idx === currentBookIdx) {
                // Toggle expansion if clicking already active book
                container.classList.toggle('expanded');
            } else {
                // Navigate to chapter 1 of selected book (automatically collapses others and expands this one)
                navigateTo(idx, 0);
            }
        });
        
        container.appendChild(bookBtn);
        container.appendChild(grid);
        elements.booksContainer.appendChild(container);
    });
}

// Render active chapter text in the main reader area
function renderChapter() {
    if (!bibleData) return;
    
    const book = bibleData[currentBookIdx];
    const bookInfo = BIBLE_BOOKS[currentBookIdx];
    const chapterTextArray = book.chapters[currentChapterIdx];
    
    // Update Header
    elements.currentBookName.textContent = bookInfo.kor;
    elements.currentChapterNum.textContent = `${currentChapterIdx + 1}장`;
    elements.chapterTitle.textContent = `${bookInfo.kor} ${currentChapterIdx + 1}장`;
    
    // Render Verses
    elements.versesList.innerHTML = '';
    
    // Hide Daily Verse if we're not on Genesis 1
    if (currentBookIdx === 0 && currentChapterIdx === 0) {
        elements.dailyVerseCard.style.display = 'block';
    } else {
        elements.dailyVerseCard.style.display = 'none';
    }
    
    chapterTextArray.forEach((verseText, vIdx) => {
        const verseNum = vIdx + 1;
        const verseKey = `b_${currentBookIdx}_c_${currentChapterIdx}_v_${vIdx}`;
        
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse-item';
        verseDiv.dataset.verseIdx = vIdx;
        
        // Apply bookmarks styling
        const isBookmarked = bookmarks.some(b => b.bookIdx === currentBookIdx && b.chapterIdx === currentChapterIdx && b.verseIdx === vIdx);
        if (isBookmarked) {
            verseDiv.classList.add('bookmarked');
        }
        
        // Highlight class
        const hlColor = highlights[verseKey] || '';
        const hlClass = hlColor ? `hl-${hlColor}` : '';
        
        // Note indicator
        const hasNote = notes[verseKey] !== undefined;
        const noteIndicatorHtml = hasNote ? 
            `<span class="note-indicator" data-verse-idx="${vIdx}"><i data-lucide="sticky-note"></i>메모</span>` : '';
            
        verseDiv.innerHTML = `
            <span class="verse-num">${verseNum}</span><span class="verse-text ${hlClass}">${verseText}</span>${noteIndicatorHtml}
        `;
        
        // Highlight / Note/ Copy Interaction
        verseDiv.addEventListener('click', (e) => {
            // If clicked note indicator, let's open library drawer note tab
            if (e.target.closest('.note-indicator')) {
                e.stopPropagation();
                openLibraryDrawer('notes');
                return;
            }
            
            e.stopPropagation();
            showVerseActionPopover(verseDiv, vIdx);
        });
        
        elements.versesList.appendChild(verseDiv);
    });
    
    // Enable/Disable navigation buttons
    elements.prevChapterBtn.disabled = (currentBookIdx === 0 && currentChapterIdx === 0);
    elements.nextChapterBtn.disabled = (currentBookIdx === 65 && currentChapterIdx === bibleData[65].chapters.length - 1);
    
    // Scroll viewer to top
    elements.viewerContainer.scrollTop = 0;
    
    // Close popover
    hideVerseActionPopover();
    
    // Save history
    saveHistory();
    
    // Re-create icons for note indicators
    lucide.createIcons();
}

// Navigation Helper
function navigateTo(bookIdx, chapterIdx, verseIdx = null) {
    currentBookIdx = bookIdx;
    currentChapterIdx = chapterIdx;
    activeTestament = BIBLE_BOOKS[bookIdx].type;
    
    renderSidebarBooks();
    renderChapter();
    
    // Scroll to specific verse if provided
    if (verseIdx !== null) {
        setTimeout(() => {
            const verseEl = elements.versesList.querySelector(`[data-verse-idx="${verseIdx}"]`);
            if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                verseEl.classList.add('selected-focus');
                setTimeout(() => {
                    verseEl.classList.remove('selected-focus');
                }, 3000);
            }
        }, 100);
    }
}

// Go to next chapter
function nextChapter() {
    const chaptersCount = bibleData[currentBookIdx].chapters.length;
    if (currentChapterIdx < chaptersCount - 1) {
        navigateTo(currentBookIdx, currentChapterIdx + 1);
    } else if (currentBookIdx < 65) {
        navigateTo(currentBookIdx + 1, 0);
    }
}

// Go to previous chapter
function prevChapter() {
    if (currentChapterIdx > 0) {
        navigateTo(currentBookIdx, currentChapterIdx - 1);
    } else if (currentBookIdx > 0) {
        const prevBookChapters = bibleData[currentBookIdx - 1].chapters.length;
        navigateTo(currentBookIdx - 1, prevBookChapters - 1);
    }
}

// ==========================================================================
// POPOVER ACTIONS & INTERACTION
// ==========================================================================

function showVerseActionPopover(verseElement, verseIdx) {
    // Clear previous focus
    document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('selected-focus'));
    
    // Focus selected
    verseElement.classList.add('selected-focus');
    
    const verseKey = `b_${currentBookIdx}_c_${currentChapterIdx}_v_${verseIdx}`;
    selectedVerse = {
        bookIdx: currentBookIdx,
        chapIdx: currentChapterIdx,
        verseIdx: verseIdx,
        element: verseElement
    };
    
    // Position Popover
    const rect = verseElement.getBoundingClientRect();
    const viewerRect = elements.viewerContainer.getBoundingClientRect();
    const scrollTop = elements.viewerContainer.scrollTop;
    
    // Calculate positioning relative to the main container
    const popoverHeight = 110; // Approximate
    const popoverWidth = 260;
    
    let top = rect.top + window.scrollY - popoverHeight - 12;
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    
    // Adjust if popover goes out of screen bounds
    if (left < 10) left = 10;
    if (left + popoverWidth > window.innerWidth - 10) {
        left = window.innerWidth - popoverWidth - 10;
    }
    
    elements.verseActionPopover.style.top = `${top}px`;
    elements.verseActionPopover.style.left = `${left}px`;
    elements.verseActionPopover.style.display = 'flex';
    
    // Hide note text container initially inside popover
    elements.popoverNoteContainer.style.display = 'none';
    
    // Toggle Active State for Bookmark button in Popover
    const isBookmarked = bookmarks.some(b => b.bookIdx === currentBookIdx && b.chapterIdx === currentChapterIdx && b.verseIdx === verseIdx);
    if (isBookmarked) {
        elements.popoverBookmarkBtn.classList.add('active');
        elements.popoverBookmarkBtn.querySelector('span').textContent = '북마크 해제';
    } else {
        elements.popoverBookmarkBtn.classList.remove('active');
        elements.popoverBookmarkBtn.querySelector('span').textContent = '북마크';
    }
    
    // Note initial text
    const savedNote = notes[verseKey];
    if (savedNote) {
        elements.popoverNoteText.value = savedNote.noteText;
        elements.popoverNoteBtn.classList.add('active');
    } else {
        elements.popoverNoteText.value = '';
        elements.popoverNoteBtn.classList.remove('active');
    }
}

function hideVerseActionPopover() {
    elements.verseActionPopover.style.display = 'none';
    document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('selected-focus'));
    selectedVerse = null;
}

// Highlighter colors click handler
function applyHighlight(colorName) {
    if (!selectedVerse) return;
    
    const { bookIdx, chapIdx, verseIdx, element } = selectedVerse;
    const verseKey = `b_${bookIdx}_c_${chapIdx}_v_${verseIdx}`;
    const textSpan = element.querySelector('.verse-text');
    
    // Reset classes
    textSpan.classList.remove('hl-yellow', 'hl-blue', 'hl-green', 'hl-pink');
    
    if (colorName === 'none') {
        delete highlights[verseKey];
    } else {
        highlights[verseKey] = colorName;
        textSpan.classList.add(`hl-${colorName}`);
    }
    
    saveHighlights();
    hideVerseActionPopover();
}

// Bookmark click handler
function toggleBookmark() {
    if (!selectedVerse) return;
    
    const { bookIdx, chapIdx, verseIdx, element } = selectedVerse;
    
    const bIndex = bookmarks.findIndex(b => b.bookIdx === bookIdx && b.chapterIdx === chapIdx && b.verseIdx === verseIdx);
    
    if (bIndex > -1) {
        // Remove
        bookmarks.splice(bIndex, 1);
        element.classList.remove('bookmarked');
    } else {
        // Add
        bookmarks.push({
            bookIdx,
            chapterIdx: chapIdx,
            verseIdx,
            timestamp: Date.now()
        });
        element.classList.add('bookmarked');
    }
    
    saveBookmarks();
    hideVerseActionPopover();
}

// Note click handler - toggles note input field in popover
function toggleNoteInput() {
    if (elements.popoverNoteContainer.style.display === 'none') {
        elements.popoverNoteContainer.style.display = 'flex';
        elements.popoverNoteText.focus();
    } else {
        elements.popoverNoteContainer.style.display = 'none';
    }
}

function saveNote() {
    if (!selectedVerse) return;
    
    const { bookIdx, chapIdx, verseIdx } = selectedVerse;
    const verseKey = `b_${bookIdx}_c_${chapIdx}_v_${verseIdx}`;
    const noteText = elements.popoverNoteText.value.trim();
    
    if (noteText === '') {
        delete notes[verseKey];
    } else {
        notes[verseKey] = {
            noteText,
            timestamp: Date.now()
        };
    }
    
    saveNotes();
    renderChapter(); // Rerender to update note indicators
    hideVerseActionPopover();
}

function copyVerse() {
    if (!selectedVerse) return;
    
    const { bookIdx, chapIdx, verseIdx, element } = selectedVerse;
    const bookName = BIBLE_BOOKS[bookIdx].kor;
    const chapNum = chapIdx + 1;
    const verseNum = verseIdx + 1;
    const text = element.querySelector('.verse-text').textContent;
    
    const copyText = `${bookName} ${chapNum}:${verseNum} - "${text}"`;
    
    navigator.clipboard.writeText(copyText).then(() => {
        // Small alert
        const oldAlert = document.querySelector('.copy-alert');
        if (oldAlert) oldAlert.remove();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'copy-alert';
        alertDiv.style.cssText = `
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideUpFade 0.3s ease-out;
        `;
        alertDiv.textContent = '구절이 클립보드에 복사되었습니다.';
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => alertDiv.remove(), 500);
        }, 2000);
    });
    
    hideVerseActionPopover();
}

// ==========================================================================
// SEARCH ENGINE
// ==========================================================================

function performSearch() {
    const query = elements.searchInput.value.trim();
    if (!query) return;
    
    elements.searchResults.innerHTML = `<div class="library-empty">
        <div class="loader" style="border: 2px solid var(--border-color); border-top: 2px solid var(--accent); border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite;"></div>
        <p>성경 구절을 검색하는 중입니다...</p>
    </div>`;
    
    setTimeout(() => {
        const results = [];
        const regex = new RegExp(query, 'gi');
        
        bibleData.forEach((book, bIdx) => {
            book.chapters.forEach((chapter, cIdx) => {
                chapter.forEach((verseText, vIdx) => {
                    if (verseText.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            bookIdx: bIdx,
                            chapterIdx: cIdx,
                            verseIdx: vIdx,
                            bookName: BIBLE_BOOKS[bIdx].kor,
                            chapterNum: cIdx + 1,
                            verseNum: vIdx + 1,
                            text: verseText
                        });
                    }
                });
            });
        });
        
        // Render search stats
        elements.searchStats.innerHTML = `총 <strong>${results.length}</strong>개의 구절을 찾았습니다.`;
        elements.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            elements.searchResults.innerHTML = `<div class="library-empty">
                <i data-lucide="search-code"></i>
                <p>검색 결과가 없습니다.<br>다른 검색어로 검색해 보세요.</p>
            </div>`;
            lucide.createIcons();
            return;
        }
        
        // Render items (cap at 200 for rendering performance)
        const displayResults = results.slice(0, 200);
        
        displayResults.forEach(res => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'search-result-item';
            
            // Highlight matching keyword
            const highlightedText = res.text.replace(regex, (match) => `<mark>${match}</mark>`);
            
            itemDiv.innerHTML = `
                <div class="search-result-ref">${res.bookName} ${res.chapterNum}:${res.verseNum}</div>
                <div class="search-result-text">${highlightedText}</div>
            `;
            
            itemDiv.addEventListener('click', () => {
                navigateTo(res.bookIdx, res.chapterIdx, res.verseIdx);
                // Close search drawer
                elements.searchDrawer.classList.remove('open');
            });
            
            elements.searchResults.appendChild(itemDiv);
        });
        
        if (results.length > 200) {
            const limitMsg = document.createElement('div');
            limitMsg.style.cssText = 'text-align: center; padding: 16px; font-size: 12px; color: var(--text-tertiary);';
            limitMsg.textContent = '검색 결과가 200개를 초과하여 상위 200개만 표시합니다.';
            elements.searchResults.appendChild(limitMsg);
        }
    }, 50);
}

// Add spin animation to CSS if not present
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

// ==========================================================================
// LIBRARY DRAWER (BOOKMARKS & NOTES & HIGHLIGHTS)
// ==========================================================================

function openLibraryDrawer(tab = 'bookmarks') {
    elements.libraryDrawer.classList.add('open');
    switchLibraryTab(tab);
}

function switchLibraryTab(tab) {
    // Set tabs active
    elements.libTabBookmarks.classList.toggle('active', tab === 'bookmarks');
    elements.libTabNotes.classList.toggle('active', tab === 'notes');
    elements.libTabHighlights.classList.toggle('active', tab === 'highlights');
    
    renderLibraryContent(tab);
}

function renderLibraryContent(tab) {
    elements.libraryContent.innerHTML = '';
    
    if (tab === 'bookmarks') {
        if (bookmarks.length === 0) {
            elements.libraryContent.innerHTML = `<div class="library-empty">
                <i data-lucide="bookmark"></i>
                <p>저장된 북마크가 없습니다.<br>본문 구절을 탭하여 북마크를 추가해 보세요.</p>
            </div>`;
            lucide.createIcons();
            return;
        }
        
        // Sort by timestamp decending
        const sortedBookmarks = [...bookmarks].sort((a,b) => b.timestamp - a.timestamp);
        
        sortedBookmarks.forEach(b => {
            const bookName = BIBLE_BOOKS[b.bookIdx].kor;
            const chapNum = b.chapterIdx + 1;
            const verseNum = b.verseIdx + 1;
            const verseText = bibleData[b.bookIdx].chapters[b.chapterIdx][b.verseIdx];
            
            const libItem = document.createElement('div');
            libItem.className = 'library-item';
            libItem.innerHTML = `
                <div class="library-item-header">
                    <span class="library-item-ref">${bookName} ${chapNum}:${verseNum}</span>
                    <button class="library-item-delete" data-type="bookmark" data-book="${b.bookIdx}" data-chap="${b.chapterIdx}" data-verse="${b.verseIdx}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="library-item-text">"${verseText}"</div>
            `;
            
            // Navigate on click
            libItem.addEventListener('click', (e) => {
                if (e.target.closest('.library-item-delete')) return; // handled separately
                navigateTo(b.bookIdx, b.chapterIdx, b.verseIdx);
                elements.libraryDrawer.classList.remove('open');
            });
            
            // Delete button handler
            libItem.querySelector('.library-item-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                bookmarks = bookmarks.filter(item => !(item.bookIdx === b.bookIdx && item.chapterIdx === b.chapterIdx && item.verseIdx === b.verseIdx));
                saveBookmarks();
                renderChapter(); // update UI marker
                renderLibraryContent('bookmarks');
            });
            
            elements.libraryContent.appendChild(libItem);
        });
        
    } else if (tab === 'notes') {
        const notesList = Object.keys(notes);
        
        if (notesList.length === 0) {
            elements.libraryContent.innerHTML = `<div class="library-empty">
                <i data-lucide="edit-3"></i>
                <p>작성된 메모가 없습니다.<br>본문 구절을 탭하여 감동적인 묵상을 기록하세요.</p>
            </div>`;
            lucide.createIcons();
            return;
        }
        
        // Sort notes by timestamp
        const sortedNotes = notesList.map(key => {
            const parts = key.split('_');
            return {
                key,
                bookIdx: parseInt(parts[1]),
                chapIdx: parseInt(parts[3]),
                verseIdx: parseInt(parts[5]),
                ...notes[key]
            };
        }).sort((a,b) => b.timestamp - a.timestamp);
        
        sortedNotes.forEach(n => {
            const bookName = BIBLE_BOOKS[n.bookIdx].kor;
            const chapNum = n.chapIdx + 1;
            const verseNum = n.verseIdx + 1;
            const verseText = bibleData[n.bookIdx].chapters[n.chapIdx][n.verseIdx];
            
            const libItem = document.createElement('div');
            libItem.className = 'library-item';
            libItem.innerHTML = `
                <div class="library-item-header">
                    <span class="library-item-ref">${bookName} ${chapNum}:${verseNum}</span>
                    <button class="library-item-delete" data-type="note" data-key="${n.key}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="library-item-text">"${verseText}"</div>
                <div class="library-item-note">
                    <span>나의 묵상</span>
                    <p>${n.noteText.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            
            libItem.addEventListener('click', (e) => {
                if (e.target.closest('.library-item-delete')) return;
                navigateTo(n.bookIdx, n.chapIdx, n.verseIdx);
                elements.libraryDrawer.classList.remove('open');
            });
            
            libItem.querySelector('.library-item-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                delete notes[n.key];
                saveNotes();
                renderChapter(); // remove note icon
                renderLibraryContent('notes');
            });
            
            elements.libraryContent.appendChild(libItem);
        });
        
    } else if (tab === 'highlights') {
        const hlList = Object.keys(highlights);
        
        if (hlList.length === 0) {
            elements.libraryContent.innerHTML = `<div class="library-empty">
                <i data-lucide="highlighter"></i>
                <p>형광펜 칠한 구절이 없습니다.<br>강조하고 싶은 구절을 탭하여 예쁜 색상으로 표시하세요.</p>
            </div>`;
            lucide.createIcons();
            return;
        }
        
        // Parse highlights
        const parsedHl = hlList.map(key => {
            const parts = key.split('_');
            return {
                key,
                bookIdx: parseInt(parts[1]),
                chapIdx: parseInt(parts[3]),
                verseIdx: parseInt(parts[5]),
                color: highlights[key]
            };
        }).reverse();
        
        parsedHl.forEach(h => {
            const bookName = BIBLE_BOOKS[h.bookIdx].kor;
            const chapNum = h.chapIdx + 1;
            const verseNum = h.verseIdx + 1;
            const verseText = bibleData[h.bookIdx].chapters[h.chapIdx][h.verseIdx];
            
            const libItem = document.createElement('div');
            libItem.className = 'library-item';
            libItem.innerHTML = `
                <div class="library-item-header">
                    <span class="library-item-ref">${bookName} ${chapNum}:${verseNum}</span>
                    <span class="highlight-dot color-${h.color}" style="width:14px; height:14px; display:inline-block; border-radius:50%; box-shadow: 0 0 2px rgba(0,0,0,0.1)"></span>
                </div>
                <div class="library-item-text">"${verseText}"</div>
            `;
            
            libItem.addEventListener('click', () => {
                navigateTo(h.bookIdx, h.chapIdx, h.verseIdx);
                elements.libraryDrawer.classList.remove('open');
            });
            
            elements.libraryContent.appendChild(libItem);
        });
    }
    
    lucide.createIcons();
}

// ==========================================================================
// ENVIRONMENT SETTINGS (MODAL ACTIONS)
// ==========================================================================

function applySettings() {
    // 1. Theme
    elements.appContainer.className = 'app-container'; // clear previous theme
    elements.appContainer.classList.add(`theme-${settings.theme}`);
    
    // Update theme preview buttons in settings dialog
    elements.themeBtns.forEach(btn => {
        if (btn.dataset.theme === settings.theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 2. Font Family
    if (settings.fontStyle === 'myeongjo') {
        elements.versesList.classList.add('font-myeongjo');
        elements.versesList.classList.remove('font-sans');
    } else {
        elements.versesList.classList.add('font-sans');
        elements.versesList.classList.remove('font-myeongjo');
    }
    
    elements.fontBtns.forEach(btn => {
        if (btn.dataset.font === settings.fontStyle) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 3. Font Size
    elements.versesList.style.fontSize = `${settings.fontSize}px`;
    elements.fontSizeSlider.value = settings.fontSize;
    elements.fontSizeValue.textContent = `${settings.fontSize}px`;
    
    // 4. Line Height
    elements.versesList.style.lineHeight = settings.lineHeight;
    elements.lineHeightSlider.value = settings.lineHeight;
    elements.lineHeightValue.textContent = settings.lineHeight;
}

// ==========================================================================
// QUICK JUMP MENU NAVIGATION
// ==========================================================================

function toggleQuickNav() {
    if (elements.quickNavPanel.style.display === 'flex') {
        hideQuickNav();
    } else {
        showQuickNav();
    }
}

function showQuickNav() {
    elements.currentLocation.classList.add('active');
    elements.quickNavPanel.style.display = 'flex';
    
    // Render Quick Nav Books
    elements.quickBooksList.innerHTML = '';
    BIBLE_BOOKS.forEach((book, idx) => {
        const btn = document.createElement('button');
        btn.className = `quick-book-btn ${idx === currentBookIdx ? 'active' : ''}`;
        btn.textContent = book.kor;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quick-book-btn').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            renderQuickChapters(idx);
        });
        elements.quickBooksList.appendChild(btn);
    });
    
    renderQuickChapters(currentBookIdx);
    
    // Auto scroll active book button into view inside quicknav
    const activeBtn = elements.quickBooksList.querySelector('.quick-book-btn.active');
    if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest' });
    }
}

function hideQuickNav() {
    elements.currentLocation.classList.remove('active');
    elements.quickNavPanel.style.display = 'none';
}

function renderQuickChapters(bookIdx) {
    elements.quickChaptersGrid.innerHTML = '';
    const chaptersCount = bibleData[bookIdx].chapters.length;
    
    for (let i = 0; i < chaptersCount; i++) {
        const btn = document.createElement('button');
        btn.className = `quick-chapter-btn ${bookIdx === currentBookIdx && i === currentChapterIdx ? 'active' : ''}`;
        btn.textContent = `${i + 1}`;
        
        btn.addEventListener('click', () => {
            navigateTo(bookIdx, i);
            hideQuickNav();
        });
        
        elements.quickChaptersGrid.appendChild(btn);
    }
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================

function setupEventListeners() {
    // Sidebar toggle (Mobile)
    elements.menuBtn.addEventListener('click', () => {
        elements.appSidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('open');
    });
    
    elements.closeSidebarBtn.addEventListener('click', () => {
        elements.appSidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('open');
    });
    
    elements.sidebarOverlay.addEventListener('click', () => {
        elements.appSidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('open');
    });
    
    // Sidebar Testament Tabs
    elements.tabOtBtn.addEventListener('click', () => {
        activeTestament = 'OT';
        elements.tabOtBtn.classList.add('active');
        elements.tabNtBtn.classList.remove('active');
        renderSidebarBooks();
    });
    
    elements.tabNtBtn.addEventListener('click', () => {
        activeTestament = 'NT';
        elements.tabNtBtn.classList.add('active');
        elements.tabOtBtn.classList.remove('active');
        renderSidebarBooks();
    });
    
    // Prev / Next Chapter Buttons
    elements.prevChapterBtn.addEventListener('click', prevChapter);
    elements.nextChapterBtn.addEventListener('click', nextChapter);
    
    // Quick Nav Trigger
    elements.currentLocation.addEventListener('click', toggleQuickNav);
    elements.quickNavCloseBtn.addEventListener('click', hideQuickNav);
    
    // Drawer Open / Close (Search)
    const openSearch = () => {
        elements.searchDrawer.classList.add('open');
        elements.libraryDrawer.classList.remove('open');
        elements.searchInput.focus();
        hideVerseActionPopover();
        hideQuickNav();
    };
    
    elements.headerSearchBtn.addEventListener('click', openSearch);
    elements.sidebarSearchBtn.addEventListener('click', openSearch);
    
    elements.closeSearchDrawerBtn.addEventListener('click', () => {
        elements.searchDrawer.classList.remove('open');
    });
    
    // Drawer Open / Close (Library)
    const openLib = () => {
        openLibraryDrawer('bookmarks');
        elements.searchDrawer.classList.remove('open');
        hideVerseActionPopover();
        hideQuickNav();
    };
    
    elements.libraryBtn.addEventListener('click', openLib);
    elements.sidebarLibraryBtn.addEventListener('click', openLib);
    
    elements.closeLibraryDrawerBtn.addEventListener('click', () => {
        elements.libraryDrawer.classList.remove('open');
    });
    
    // Library Tabs switcher
    elements.libTabBookmarks.addEventListener('click', () => switchLibraryTab('bookmarks'));
    elements.libTabNotes.addEventListener('click', () => switchLibraryTab('notes'));
    elements.libTabHighlights.addEventListener('click', () => switchLibraryTab('highlights'));
    
    // Search Action handlers
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    elements.searchSubmitBtn.addEventListener('click', performSearch);
    
    // Settings Modal
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.style.display = 'flex';
        hideVerseActionPopover();
        hideQuickNav();
    });
    
    elements.closeSettingsModalBtn.addEventListener('click', () => {
        elements.settingsModal.style.display = 'none';
    });
    
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.style.display = 'none';
        }
    });
    
    // Settings Actions: Themes
    elements.themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            settings.theme = btn.dataset.theme;
            applySettings();
            saveSettings();
        });
    });
    
    // Settings Actions: Font family
    elements.fontBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            settings.fontStyle = btn.dataset.font;
            applySettings();
            saveSettings();
        });
    });
    
    // Settings Actions: Font Size slider
    elements.fontSizeSlider.addEventListener('input', (e) => {
        settings.fontSize = parseInt(e.target.value);
        applySettings();
    });
    
    elements.fontSizeSlider.addEventListener('change', () => {
        saveSettings();
    });
    
    // Settings Actions: Line Height slider
    elements.lineHeightSlider.addEventListener('input', (e) => {
        settings.lineHeight = parseFloat(e.target.value);
        applySettings();
    });
    
    elements.lineHeightSlider.addEventListener('change', () => {
        saveSettings();
    });
    
    // Popover interaction events
    elements.highlightDots.forEach(dot => {
        dot.addEventListener('click', () => applyHighlight(dot.dataset.color));
    });
    
    elements.highlightClearBtn.addEventListener('click', () => applyHighlight('none'));
    elements.popoverBookmarkBtn.addEventListener('click', toggleBookmark);
    elements.popoverNoteBtn.addEventListener('click', toggleNoteInput);
    elements.popoverCopyBtn.addEventListener('click', copyVerse);
    
    // Popover Note Save/Cancel
    elements.popoverNoteSave.addEventListener('click', saveNote);
    elements.popoverNoteCancel.addEventListener('click', () => {
        elements.popoverNoteContainer.style.display = 'none';
    });
    
    // Global clicks - Close popover and quicknav on clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#verseActionPopover') && !e.target.closest('.verse-item')) {
            hideVerseActionPopover();
        }
        
        if (!e.target.closest('#quickNavPanel') && !e.target.closest('#currentLocation')) {
            hideQuickNav();
        }
    });
    
    // Support keyboard navigation (Left/Right arrow keys for chapter navigation)
    document.addEventListener('keydown', (e) => {
        // Only trigger arrow keys if user is not typing in inputs
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.key === 'ArrowLeft') {
            prevChapter();
        } else if (e.key === 'ArrowRight') {
            nextChapter();
        }
    });
}
