window.BIBLE_SBLGNT_LOADER = (() => {
  const repoBase = "https://raw.githubusercontent.com/Faithlife/SBLGNT/master/data/sblgnt/text";
  const source = {
    title: "SBL Greek New Testament",
    url: "https://github.com/Faithlife/SBLGNT",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    copyright: "Copyright 2010 Society of Biblical Literature and Logos Bible Software",
  };
  const books = [
    ["Matt", "matthew", 40, "마태복음", 28],
    ["Mark", "mark", 41, "마가복음", 16],
    ["Luke", "luke", 42, "누가복음", 24],
    ["John", "john", 43, "요한복음", 21],
    ["Acts", "acts", 44, "사도행전", 28],
    ["Rom", "romans", 45, "로마서", 16],
    ["1Cor", "1-corinthians", 46, "고린도전서", 16],
    ["2Cor", "2-corinthians", 47, "고린도후서", 13],
    ["Gal", "galatians", 48, "갈라디아서", 6],
    ["Eph", "ephesians", 49, "에베소서", 6],
    ["Phil", "philippians", 50, "빌립보서", 4],
    ["Col", "colossians", 51, "골로새서", 4],
    ["1Thess", "1-thessalonians", 52, "데살로니가전서", 5],
    ["2Thess", "2-thessalonians", 53, "데살로니가후서", 3],
    ["1Tim", "1-timothy", 54, "디모데전서", 6],
    ["2Tim", "2-timothy", 55, "디모데후서", 4],
    ["Titus", "titus", 56, "디도서", 3],
    ["Phlm", "philemon", 57, "빌레몬서", 1],
    ["Heb", "hebrews", 58, "히브리서", 13],
    ["Jas", "james", 59, "야고보서", 5],
    ["1Pet", "1-peter", 60, "베드로전서", 5],
    ["2Pet", "2-peter", 61, "베드로후서", 3],
    ["1John", "1-john", 62, "요한일서", 5],
    ["2John", "2-john", 63, "요한이서", 1],
    ["3John", "3-john", 64, "요한삼서", 1],
    ["Jude", "jude", 65, "유다서", 1],
    ["Rev", "revelation", 66, "요한계시록", 22],
  ];

  let cachedTranslation = null;
  let loadingPromise = null;

  function placeholder() {
    return {
      id: "sblgnt",
      name: "SBLGNT 헬라어",
      language: "grc",
      source,
      loading: true,
      verseCount: 0,
      books: books.map(([, id, number, name, chapterCount]) => ({
        id,
        number,
        name,
        testament: "new",
        chapters: Array.from({ length: chapterCount }, (_, index) => ({
          chapter: index + 1,
          verses: [],
        })),
      })),
    };
  }

  function normalizeText(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function parseBook(text, [, id, number, name]) {
    const chapterMap = new Map();
    text.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^[1-3]?[A-Za-z]+ (\d+):(\d+)\t(.+)$/);
      if (!match) return;
      const chapter = Number(match[1]);
      const verse = Number(match[2]);
      if (!chapterMap.has(chapter)) {
        chapterMap.set(chapter, []);
      }
      chapterMap.get(chapter).push({
        verse,
        text: normalizeText(match[3]),
      });
    });
    return {
      id,
      number,
      name,
      testament: "new",
      chapters: [...chapterMap.entries()].map(([chapter, verses]) => ({ chapter, verses })),
    };
  }

  async function load() {
    if (cachedTranslation) return cachedTranslation;
    if (!loadingPromise) {
      loadingPromise = Promise.all(
        books.map(async (book) => {
          const response = await fetch(`${repoBase}/${book[0]}.txt`);
          if (!response.ok) {
            throw new Error(`SBLGNT 원문을 불러오지 못했습니다. (${book[0]} ${response.status})`);
          }
          return parseBook(await response.text(), book);
        }),
      ).then((loadedBooks) => {
        cachedTranslation = {
          id: "sblgnt",
          name: "SBLGNT 헬라어",
          language: "grc",
          source,
          verseCount: loadedBooks.reduce(
            (total, book) => total + book.chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0),
            0,
          ),
          books: loadedBooks,
        };
        return cachedTranslation;
      });
    }
    return loadingPromise;
  }

  return { placeholder, load };
})();
