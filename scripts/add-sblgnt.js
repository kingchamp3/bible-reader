const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataPath = path.join(root, "src", "data", "bibles.json");
const webDataPath = path.join(root, "web", "bibles-data.js");
const repoBase = "https://raw.githubusercontent.com/Faithlife/SBLGNT/master/data/sblgnt/text";

const bookMap = [
  ["Matt", "matthew"],
  ["Mark", "mark"],
  ["Luke", "luke"],
  ["John", "john"],
  ["Acts", "acts"],
  ["Rom", "romans"],
  ["1Cor", "1-corinthians"],
  ["2Cor", "2-corinthians"],
  ["Gal", "galatians"],
  ["Eph", "ephesians"],
  ["Phil", "philippians"],
  ["Col", "colossians"],
  ["1Thess", "1-thessalonians"],
  ["2Thess", "2-thessalonians"],
  ["1Tim", "1-timothy"],
  ["2Tim", "2-timothy"],
  ["Titus", "titus"],
  ["Phlm", "philemon"],
  ["Heb", "hebrews"],
  ["Jas", "james"],
  ["1Pet", "1-peter"],
  ["2Pet", "2-peter"],
  ["1John", "1-john"],
  ["2John", "2-john"],
  ["3John", "3-john"],
  ["Jude", "jude"],
  ["Rev", "revelation"],
];

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

async function fetchBook(fileName) {
  const response = await fetch(`${repoBase}/${fileName}.txt`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileName}.txt: ${response.status}`);
  }
  return response.text();
}

function convertBook(text, metadata, fileName) {
  const chapters = new Map();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^[1-3]?[A-Za-z]+ (\d+):(\d+)\t(.+)$/);
    if (!match) continue;

    const chapterNumber = Number(match[1]);
    const verseNumber = Number(match[2]);
    const verseText = normalizeText(match[3]);

    if (!chapters.has(chapterNumber)) {
      chapters.set(chapterNumber, []);
    }

    chapters.get(chapterNumber).push({
      verse: verseNumber,
      text: verseText,
    });
  }

  if (!chapters.size) {
    throw new Error(`No verses parsed from ${fileName}.txt`);
  }

  return {
    ...metadata,
    chapters: [...chapters.entries()].map(([chapter, verses]) => ({
      chapter,
      verses,
    })),
  };
}

async function main() {
  const bundle = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const baseTranslation = bundle.translations.find((translation) => translation.id === "krv");
  if (!baseTranslation) {
    throw new Error("Base KRV translation was not found.");
  }

  const metadataById = new Map(
    baseTranslation.books.map((book) => [
      book.id,
      {
        id: book.id,
        number: book.number,
        name: book.name,
        testament: book.testament,
      },
    ]),
  );

  const books = [];
  for (const [fileName, bookId] of bookMap) {
    const metadata = metadataById.get(bookId);
    if (!metadata) {
      throw new Error(`Missing book metadata for ${bookId}`);
    }
    const text = await fetchBook(fileName);
    books.push(convertBook(text, metadata, fileName));
  }

  const sblgnt = {
    id: "sblgnt",
    name: "SBLGNT 헬라어",
    language: "grc",
    source: {
      title: "SBL Greek New Testament",
      url: "https://github.com/Faithlife/SBLGNT",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      copyright: "Copyright 2010 Society of Biblical Literature and Logos Bible Software",
    },
    verseCount: books.reduce(
      (total, book) => total + book.chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0),
      0,
    ),
    books,
  };

  bundle.translations = bundle.translations.filter((translation) => translation.id !== sblgnt.id);
  bundle.translations.push(sblgnt);

  const json = JSON.stringify(bundle, null, 0);
  fs.writeFileSync(dataPath, json, "utf8");
  fs.writeFileSync(webDataPath, `window.BIBLE_TRANSLATIONS = ${json};`, "utf8");

  console.log(`Added ${sblgnt.name}: ${sblgnt.verseCount} verses`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
