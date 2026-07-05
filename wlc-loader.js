window.BIBLE_HEBREW_LOADER = (() => {
  const repoBase = "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc";
  const source = {
    title: "Open Scriptures Hebrew Bible / Westminster Leningrad Codex",
    url: "https://github.com/openscriptures/morphhb",
    license: "WLC Public Domain; OSHB morphology CC BY 4.0",
    licenseUrl: "https://github.com/openscriptures/morphhb/blob/master/LICENSE.md",
    copyright: "Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb",
  };

  const books = [
    ["Gen", "genesis", 1, "창세기", 50],
    ["Exod", "exodus", 2, "출애굽기", 40],
    ["Lev", "leviticus", 3, "레위기", 27],
    ["Num", "numbers", 4, "민수기", 36],
    ["Deut", "deuteronomy", 5, "신명기", 34],
    ["Josh", "joshua", 6, "여호수아", 24],
    ["Judg", "judges", 7, "사사기", 21],
    ["Ruth", "ruth", 8, "룻기", 4],
    ["1Sam", "1-samuel", 9, "사무엘상", 31],
    ["2Sam", "2-samuel", 10, "사무엘하", 24],
    ["1Kgs", "1-kings", 11, "열왕기상", 22],
    ["2Kgs", "2-kings", 12, "열왕기하", 25],
    ["1Chr", "1-chronicles", 13, "역대상", 29],
    ["2Chr", "2-chronicles", 14, "역대하", 36],
    ["Ezra", "ezra", 15, "에스라", 10],
    ["Neh", "nehemiah", 16, "느헤미야", 13],
    ["Esth", "esther", 17, "에스더", 10],
    ["Job", "job", 18, "욥기", 42],
    ["Ps", "psalms", 19, "시편", 150],
    ["Prov", "proverbs", 20, "잠언", 31],
    ["Eccl", "ecclesiastes", 21, "전도서", 12],
    ["Song", "song-of-songs", 22, "아가", 8],
    ["Isa", "isaiah", 23, "이사야", 66],
    ["Jer", "jeremiah", 24, "예레미야", 52],
    ["Lam", "lamentations", 25, "예레미야애가", 5],
    ["Ezek", "ezekiel", 26, "에스겔", 48],
    ["Dan", "daniel", 27, "다니엘", 12],
    ["Hos", "hosea", 28, "호세아", 14],
    ["Joel", "joel", 29, "요엘", 3],
    ["Amos", "amos", 30, "아모스", 9],
    ["Obad", "obadiah", 31, "오바댜", 1],
    ["Jonah", "jonah", 32, "요나", 4],
    ["Mic", "micah", 33, "미가", 7],
    ["Nah", "nahum", 34, "나훔", 3],
    ["Hab", "habakkuk", 35, "하박국", 3],
    ["Zeph", "zephaniah", 36, "스바냐", 3],
    ["Hag", "haggai", 37, "학개", 2],
    ["Zech", "zechariah", 38, "스가랴", 14],
    ["Mal", "malachi", 39, "말라기", 4],
  ];

  let cachedTranslation = null;
  let loadingPromise = null;
  let verseMapPromise = null;

  function placeholder() {
    return {
      id: "wlc",
      name: "히브리어 원문",
      language: "he",
      source,
      loading: true,
      verseCount: 0,
      books: books.map(([, id, number, name, chapterCount]) => ({
        id,
        number,
        name,
        testament: "old",
        chapters: Array.from({ length: chapterCount }, (_, index) => ({
          chapter: index + 1,
          verses: [],
        })),
      })),
    };
  }

  function decodeXml(value) {
    return value
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  function cleanVerseText(innerXml) {
    return decodeXml(
      innerXml
        .replace(/<note\b[\s\S]*?<\/note>/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\//g, "")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }

  function parseReference(reference) {
    const parts = reference.split(".");
    if (parts.length !== 3) return null;
    return {
      osis: parts[0],
      chapter: Number(parts[1]),
      verse: Number(parts[2]),
    };
  }

  async function loadVerseMap() {
    if (verseMapPromise) return verseMapPromise;
    verseMapPromise = fetch(`${repoBase}/VerseMap.xml`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`히브리어 절 번호표를 불러오지 못했습니다. (${response.status})`);
        }
        return response.text();
      })
      .then((xml) => {
        const map = new Map();
        const verseRe = /<verse\b[^>]*\bwlc="([^"]+)"[^>]*\bkjv="([^"]+)"/g;
        let match;
        while ((match = verseRe.exec(xml))) {
          const wlc = parseReference(match[1]);
          const kjv = parseReference(match[2]);
          if (!wlc || !kjv || wlc.osis !== kjv.osis) continue;
          map.set(`${wlc.osis}.${wlc.chapter}.${wlc.verse}`, {
            chapter: kjv.chapter,
            verse: kjv.verse,
          });
        }
        return map;
      })
      .catch(() => new Map());
    return verseMapPromise;
  }

  function parseBook(xml, bookInfo, verseMap) {
    const [osis, id, number, name] = bookInfo;
    const chapterMap = new Map();
    const verseRe = /<verse\b[^>]*\bosisID="([^"]+)"[^>]*>([\s\S]*?)<\/verse>/g;
    let match;

    while ((match = verseRe.exec(xml))) {
      const reference = parseReference(match[1]);
      if (!reference) continue;
      const mapped = verseMap.get(match[1]) || reference;
      const text = cleanVerseText(match[2]);
      if (!text) continue;
      if (!chapterMap.has(mapped.chapter)) {
        chapterMap.set(mapped.chapter, new Map());
      }
      chapterMap.get(mapped.chapter).set(mapped.verse, {
        verse: mapped.verse,
        text,
      });
    }

    return {
      id,
      number,
      name,
      testament: "old",
      chapters: [...chapterMap.entries()]
        .sort(([a], [b]) => a - b)
        .map(([chapter, verses]) => ({
          chapter,
          verses: [...verses.values()].sort((a, b) => a.verse - b.verse),
        })),
    };
  }

  async function load() {
    if (cachedTranslation) return cachedTranslation;
    if (!loadingPromise) {
      loadingPromise = loadVerseMap()
        .then((verseMap) =>
          Promise.all(
            books.map(async (book) => {
              const response = await fetch(`${repoBase}/${book[0]}.xml`);
              if (!response.ok) {
                throw new Error(`히브리어 원문을 불러오지 못했습니다. (${book[0]} ${response.status})`);
              }
              return parseBook(await response.text(), book, verseMap);
            }),
          ),
        )
        .then((loadedBooks) => {
          cachedTranslation = {
            id: "wlc",
            name: "히브리어 원문",
            language: "he",
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
