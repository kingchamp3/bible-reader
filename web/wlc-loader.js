window.BIBLE_HEBREW_LOADER = (() => {
  const remoteBase = "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc";
  const localBase =
    typeof document !== "undefined"
      ? new URL("./wlc/", document.currentScript?.src || window.location.href).toString()
      : "";
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

  const strongGlosses = {
    1254: "창조하다, 만들다",
    430: "하나님, 신",
    853: "목적격 표지",
    216: "빛",
    376: "사람, 남자",
    559: "말하다",
    776: "땅, 세상",
    835: "복됨",
    1961: "되다, 있다",
    1980: "가다, 걷다",
    2896: "좋은, 선한",
    3068: "여호와",
    3117: "날, 낮",
    3915: "밤",
    4325: "물",
    4428: "왕",
    6440: "얼굴, 앞",
    7225: "처음, 시작",
    7307: "영, 바람, 숨",
    8064: "하늘",
    8085: "듣다",
    8451: "율법, 가르침",
  };

  const letterMap = {
    א: "",
    ב: "b",
    ג: "g",
    ד: "d",
    ה: "h",
    ו: "w",
    ז: "z",
    ח: "ch",
    ט: "t",
    י: "y",
    כ: "k",
    ך: "k",
    ל: "l",
    מ: "m",
    ם: "m",
    נ: "n",
    ן: "n",
    ס: "s",
    ע: "",
    פ: "p",
    ף: "p",
    צ: "ts",
    ץ: "ts",
    ק: "q",
    ר: "r",
    ש: "sh",
    ת: "t",
  };

  const vowelMap = {
    "\u05B0": "e",
    "\u05B1": "e",
    "\u05B2": "a",
    "\u05B3": "o",
    "\u05B4": "i",
    "\u05B5": "e",
    "\u05B6": "e",
    "\u05B7": "a",
    "\u05B8": "a",
    "\u05B9": "o",
    "\u05BB": "u",
    "\u05C7": "a",
  };

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

  async function fetchSourceFile(fileName) {
    const urls = [
      localBase ? `${localBase}${fileName}` : "",
      `${remoteBase}/${fileName}`,
    ].filter(Boolean);

    let lastError = null;
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) return response.text();
        lastError = new Error(`${fileName} ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`${fileName} 로드 실패`);
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
    return tokensToText(parseVerseTokens(innerXml));
  }

  function parseAttributes(value) {
    const attributes = {};
    const attrRe = /([:\w-]+)="([^"]*)"/g;
    let match;
    while ((match = attrRe.exec(value))) {
      attributes[match[1]] = decodeXml(match[2]);
    }
    return attributes;
  }

  function displayWord(value) {
    return decodeXml(value.replace(/<[^>]+>/g, "")).replace(/\//g, "");
  }

  function baseStrong(lemma = "") {
    const match = lemma.match(/\d+/);
    return match ? match[0] : "";
  }

  function transliterateHebrew(value) {
    const cleaned = displayWord(value).replace(/[־׃׀]/g, "");
    const normalized = cleaned.normalize("NFD");
    let output = "";
    for (let index = 0; index < normalized.length; index += 1) {
      const char = normalized[index];
      if (letterMap[char] !== undefined) {
        output += letterMap[char];
        continue;
      }
      if (vowelMap[char]) {
        output += vowelMap[char];
      }
    }
    return output || "음역 준비 중";
  }

  function tokensToText(tokens) {
    let text = "";
    tokens.forEach((token) => {
      if (token.type === "word") {
        if (text && !text.endsWith("־") && !text.endsWith("׀ ")) text += " ";
        text += token.text;
      } else if (token.text === "׀") {
        text += ` ${token.text} `;
      } else {
        text += token.text;
      }
    });
    return text.replace(/\s+/g, " ").trim();
  }

  function parseVerseTokens(innerXml) {
    const xml = innerXml.replace(/<note\b[\s\S]*?<\/note>/g, "");
    const tokens = [];
    const partRe = /<(w|seg)\b([^>]*)>([\s\S]*?)<\/\1>/g;
    let match;
    while ((match = partRe.exec(xml))) {
      const [, tag, attrs, content] = match;
      if (tag === "seg") {
        const text = decodeXml(content.replace(/<[^>]+>/g, "")).trim();
        if (text) tokens.push({ type: "seg", text });
        continue;
      }

      const attributes = parseAttributes(attrs);
      const strong = baseStrong(attributes.lemma || "");
      const text = displayWord(content);
      if (!text) continue;
      tokens.push({
        type: "word",
        text,
        transliteration: transliterateHebrew(content),
        lemma: attributes.lemma || "",
        strong,
        morph: attributes.morph || "",
        meaning: strongGlosses[strong] || "뜻 사전 준비 중",
      });
    }
    return tokens;
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
    verseMapPromise = fetchSourceFile("VerseMap.xml")
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
      const tokens = parseVerseTokens(match[2]);
      const text = tokensToText(tokens);
      if (!text) continue;
      if (!chapterMap.has(mapped.chapter)) {
        chapterMap.set(mapped.chapter, new Map());
      }
      chapterMap.get(mapped.chapter).set(mapped.verse, {
        verse: mapped.verse,
        text,
        tokens,
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
              const xml = await fetchSourceFile(`${book[0]}.xml`);
              return parseBook(xml, book, verseMap);
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
