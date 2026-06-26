import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import bibleBundle from './src/data/bibles.json';

type Testament = 'old' | 'new';

type BibleVerse = {
  verse: number;
  text: string;
};

type BibleChapter = {
  chapter: number;
  verses: BibleVerse[];
};

type BibleBook = {
  id: string;
  number: number;
  name: string;
  testament: Testament;
  chapters: BibleChapter[];
};

type BibleTranslation = {
  id: string;
  name: string;
  language: string;
  verseCount: number;
  books: BibleBook[];
};

type BibleBundle = {
  defaultTranslationId: string;
  translations: BibleTranslation[];
};

type SearchResult = BibleVerse & {
  bookId: string;
  bookName: string;
  chapter: number;
};

const BIBLE_BUNDLE = bibleBundle as BibleBundle;
const SEARCH_RESULT_LIMIT = 200;

const testamentLabel: Record<Testament, string> = {
  old: '구약',
  new: '신약',
};

export default function App() {
  const [selectedTranslationId, setSelectedTranslationId] = useState(
    BIBLE_BUNDLE.defaultTranslationId,
  );
  const [selectedBookId, setSelectedBookId] = useState(BIBLE_BUNDLE.translations[0].books[0].id);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(1);
  const [query, setQuery] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [showFavorites, setShowFavorites] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const selectedTranslation =
    BIBLE_BUNDLE.translations.find((translation) => translation.id === selectedTranslationId) ??
    BIBLE_BUNDLE.translations[0];
  const selectedBook =
    selectedTranslation.books.find((book) => book.id === selectedBookId) ??
    selectedTranslation.books[0];
  const selectedChapter =
    selectedBook.chapters.find((chapter) => chapter.chapter === selectedChapterNumber) ??
    selectedBook.chapters[0];
  const normalizedQuery = query.trim();

  const allVerses = useMemo<SearchResult[]>(
    () =>
      selectedTranslation.books.flatMap((book) =>
        book.chapters.flatMap((chapter) =>
          chapter.verses.map((verse) => ({
            ...verse,
            bookId: book.id,
            bookName: book.name,
            chapter: chapter.chapter,
          })),
        ),
      ),
    [selectedTranslation],
  );

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return allVerses
      .filter((verse) => verse.text.toLowerCase().includes(normalizedQuery.toLowerCase()))
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [allVerses, normalizedQuery]);

  const totalSearchCount = useMemo(() => {
    if (!normalizedQuery) {
      return 0;
    }

    return allVerses.filter((verse) =>
      verse.text.toLowerCase().includes(normalizedQuery.toLowerCase()),
    ).length;
  }, [allVerses, normalizedQuery]);

  const favoriteResults = useMemo<SearchResult[]>(() => {
    return bookmarks
      .map((bookmarkId) => {
        const parts = bookmarkId.split('-');
        const verse = Number(parts.pop());
        const chapter = Number(parts.pop());
        const bookId = parts.join('-');
        const book = selectedTranslation.books.find((item) => item.id === bookId);
        const selectedFavoriteChapter = book?.chapters.find((item) => item.chapter === chapter);
        const favoriteVerse = selectedFavoriteChapter?.verses.find((item) => item.verse === verse);

        if (!book || !selectedFavoriteChapter || !favoriteVerse) {
          return null;
        }

        return {
          ...favoriteVerse,
          bookId: book.id,
          bookName: book.name,
          chapter: selectedFavoriteChapter.chapter,
        };
      })
      .filter((verse): verse is SearchResult => Boolean(verse));
  }, [bookmarks, selectedTranslation]);

  const selectTranslation = (translationId: string) => {
    const nextTranslation =
      BIBLE_BUNDLE.translations.find((translation) => translation.id === translationId) ??
      selectedTranslation;
    const nextBook =
      nextTranslation.books.find((book) => book.id === selectedBookId) ?? nextTranslation.books[0];
    const nextChapter =
      nextBook.chapters.find((chapter) => chapter.chapter === selectedChapterNumber) ??
      nextBook.chapters[0];

    setSelectedTranslationId(nextTranslation.id);
    setSelectedBookId(nextBook.id);
    setSelectedChapterNumber(nextChapter.chapter);
    setQuery('');
  };

  const toggleBookmark = (bookId: string, chapter: number, verse: number) => {
    const bookmarkId = `${bookId}-${chapter}-${verse}`;
    setBookmarks((current) =>
      current.includes(bookmarkId)
        ? current.filter((id) => id !== bookmarkId)
        : [...current, bookmarkId],
    );
  };

  const moveToVerse = (result: SearchResult) => {
    setSelectedBookId(result.bookId);
    setSelectedChapterNumber(result.chapter);
    setQuery('');
    setShowFavorites(false);
  };

  const renderVerse = (
    verse: BibleVerse,
    bookId: string,
    chapter: number,
    metaLabel?: string,
    onPress?: () => void,
  ) => {
    const bookmarkId = `${bookId}-${chapter}-${verse.verse}`;
    const isBookmarked = bookmarks.includes(bookmarkId);

    return (
      <Pressable
        key={`${selectedTranslation.id}-${bookmarkId}`}
        onPress={onPress ?? (() => toggleBookmark(bookId, chapter, verse.verse))}
        style={[styles.verseRow, isBookmarked && styles.verseRowMarked]}
      >
        <Text style={styles.verseNumber}>{metaLabel ?? verse.verse}</Text>
        <Text style={[styles.verseText, { fontSize, lineHeight: fontSize * 1.65 }]}>
          {verse.text}
        </Text>
        <Pressable
          accessibilityLabel="북마크"
          onPress={() => toggleBookmark(bookId, chapter, verse.verse)}
          style={styles.bookmarkButton}
        >
          <Text style={[styles.bookmark, isBookmarked && styles.bookmarkActive]}>
            {isBookmarked ? '저장됨' : '저장'}
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.appName}>성경을 읽다</Text>
          <Text style={styles.subtitle}>여러 번역본으로 읽고 검색하기</Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterNumber}>{bookmarks.length}</Text>
          <Text style={styles.counterLabel}>즐겨찾기</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.translationStrip}
      >
        {BIBLE_BUNDLE.translations.map((translation) => {
          const isSelected = translation.id === selectedTranslation.id;
          return (
            <Pressable
              key={translation.id}
              onPress={() => selectTranslation(translation.id)}
              style={[styles.translationButton, isSelected && styles.translationButtonSelected]}
            >
              <Text
                style={[
                  styles.translationButtonText,
                  isSelected && styles.translationButtonTextSelected,
                ]}
              >
                {translation.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.searchPanel}>
        <TextInput
          placeholder={`${selectedTranslation.name} 검색`}
          placeholderTextColor="#7d8378"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
        <Pressable
          accessibilityLabel="즐겨찾기 보기"
          onPress={() => {
            setShowFavorites((current) => !current);
            setQuery('');
          }}
          style={[styles.favoriteToggle, showFavorites && styles.favoriteToggleActive]}
        >
          <Text style={[styles.favoriteToggleText, showFavorites && styles.favoriteToggleTextActive]}>
            {showFavorites ? '본문' : '즐겨찾기'}
          </Text>
        </Pressable>
        <View style={styles.fontControls}>
          <Pressable
            accessibilityLabel="글자 작게"
            onPress={() => setFontSize((size) => Math.max(16, size - 2))}
            style={styles.iconButton}
          >
            <Text style={styles.iconButtonText}>A-</Text>
          </Pressable>
          <Text style={styles.fontSizeLabel}>{fontSize}</Text>
          <Pressable
            accessibilityLabel="글자 크게"
            onPress={() => setFontSize((size) => Math.min(30, size + 2))}
            style={styles.iconButton}
          >
            <Text style={styles.iconButtonText}>A+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookStrip}>
        {selectedTranslation.books.map((book) => {
          const isSelected = book.id === selectedBook.id;
          return (
            <Pressable
              key={book.id}
              onPress={() => {
                setSelectedBookId(book.id);
                setSelectedChapterNumber(book.chapters[0].chapter);
                setQuery('');
                setShowFavorites(false);
              }}
              style={[styles.bookButton, isSelected && styles.bookButtonSelected]}
            >
              <Text style={[styles.bookTestament, isSelected && styles.bookTextSelected]}>
                {testamentLabel[book.testament]}
              </Text>
              <Text style={[styles.bookName, isSelected && styles.bookTextSelected]}>{book.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chapterStrip}
      >
        {selectedBook.chapters.map((chapter) => {
          const isSelected = chapter.chapter === selectedChapter.chapter;
          return (
            <Pressable
              key={chapter.chapter}
              onPress={() => {
                setSelectedChapterNumber(chapter.chapter);
                setQuery('');
                setShowFavorites(false);
              }}
              style={[styles.chapterButton, isSelected && styles.chapterButtonSelected]}
            >
              <Text style={[styles.chapterButtonText, isSelected && styles.chapterButtonTextSelected]}>
                {chapter.chapter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.reader}>
        <Text style={styles.translationLabel}>
          {selectedTranslation.name} · {selectedTranslation.verseCount.toLocaleString()}절
        </Text>
        {showFavorites ? (
          <>
            <Text style={styles.chapterTitle}>즐겨찾기</Text>
            <Text style={styles.resultSummary}>{favoriteResults.length}개 즐겨찾기</Text>
            {favoriteResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>저장한 구절이 없습니다</Text>
                <Text style={styles.emptyText}>구절의 저장 버튼을 눌러 즐겨찾기에 추가하세요.</Text>
              </View>
            ) : (
              favoriteResults.map((result) =>
                renderVerse(
                  result,
                  result.bookId,
                  result.chapter,
                  `${result.bookName} ${result.chapter}:${result.verse}`,
                  () => moveToVerse(result),
                ),
              )
            )}
          </>
        ) : normalizedQuery ? (
          <>
            <Text style={styles.chapterTitle}>검색 결과</Text>
            <Text style={styles.resultSummary}>
              {totalSearchCount}개 중 {searchResults.length}개 표시
            </Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
                <Text style={styles.emptyText}>다른 단어나 짧은 표현으로 다시 찾아보세요.</Text>
              </View>
            ) : (
              searchResults.map((result) =>
                renderVerse(
                  result,
                  result.bookId,
                  result.chapter,
                  `${result.bookName} ${result.chapter}:${result.verse}`,
                  () => moveToVerse(result),
                ),
              )
            )}
          </>
        ) : (
          <>
            <Text style={styles.chapterTitle}>
              {selectedBook.name} {selectedChapter.chapter}장
            </Text>
            {selectedChapter.verses.map((verse) =>
              renderVerse(verse, selectedBook.id, selectedChapter.chapter),
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f4ee',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 14,
  },
  appName: {
    color: '#23312b',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#667067',
    fontSize: 14,
    marginTop: 4,
  },
  counter: {
    alignItems: 'center',
    backgroundColor: '#24463d',
    borderRadius: 8,
    minWidth: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  counterNumber: {
    color: '#fffdf7',
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    color: '#d6e7db',
    fontSize: 12,
  },
  translationStrip: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  translationButton: {
    backgroundColor: '#ebe4d8',
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  translationButtonSelected: {
    backgroundColor: '#24463d',
  },
  translationButtonText: {
    color: '#27322d',
    fontSize: 14,
    fontWeight: '800',
  },
  translationButtonTextSelected: {
    color: '#fffdf7',
  },
  searchPanel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  searchInput: {
    backgroundColor: '#fffdf8',
    borderColor: '#ded8cc',
    borderRadius: 8,
    borderWidth: 1,
    color: '#27322d',
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  favoriteToggle: {
    alignItems: 'center',
    backgroundColor: '#ebe4d8',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  favoriteToggleActive: {
    backgroundColor: '#92784d',
  },
  favoriteToggleText: {
    color: '#27322d',
    fontSize: 13,
    fontWeight: '800',
  },
  favoriteToggleTextActive: {
    color: '#fffdf7',
  },
  fontControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#e7efe7',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonText: {
    color: '#24463d',
    fontSize: 15,
    fontWeight: '800',
  },
  fontSizeLabel: {
    color: '#46534c',
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  bookStrip: {
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  bookButton: {
    backgroundColor: '#ebe4d8',
    borderRadius: 8,
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 104,
  },
  bookButtonSelected: {
    backgroundColor: '#24463d',
  },
  bookTestament: {
    color: '#71776f',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookName: {
    color: '#27322d',
    fontSize: 16,
    fontWeight: '800',
  },
  bookTextSelected: {
    color: '#fffdf7',
  },
  chapterStrip: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  chapterButton: {
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    borderColor: '#ded8cc',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 46,
  },
  chapterButtonSelected: {
    backgroundColor: '#92784d',
    borderColor: '#92784d',
  },
  chapterButtonText: {
    color: '#46534c',
    fontSize: 14,
    fontWeight: '800',
  },
  chapterButtonTextSelected: {
    color: '#fffdf7',
  },
  reader: {
    backgroundColor: '#fffdf8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
  },
  chapterTitle: {
    color: '#22312b',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
  },
  translationLabel: {
    color: '#7a6849',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  resultSummary: {
    color: '#69736b',
    fontSize: 14,
    marginBottom: 10,
  },
  verseRow: {
    borderBottomColor: '#ece5d9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
  },
  verseRowMarked: {
    backgroundColor: '#f0f6ec',
  },
  verseNumber: {
    color: '#92784d',
    fontSize: 13,
    fontWeight: '800',
    paddingTop: 7,
    width: 54,
  },
  verseText: {
    color: '#26322c',
    flex: 1,
    fontWeight: '500',
  },
  bookmarkButton: {
    minWidth: 44,
  },
  bookmark: {
    color: '#868a82',
    fontSize: 12,
    fontWeight: '800',
    paddingTop: 8,
  },
  bookmarkActive: {
    color: '#2f6f4e',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyTitle: {
    color: '#28352f',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#69736b',
    fontSize: 14,
  },
});
