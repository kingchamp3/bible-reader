import html
import json
import re
import sqlite3
from pathlib import Path

TRANSLATIONS = [
    {"id": "krv", "name": "개역한글", "file": "krv.sqlite", "language": "ko"},
    {"id": "krv-revised", "name": "개역개정", "file": "krv-revised.sqlite", "language": "ko"},
    {"id": "common", "name": "공동번역", "file": "common.sqlite", "language": "ko"},
    {"id": "modern", "name": "현대어성경", "file": "modern.sqlite", "language": "ko"},
    {"id": "niv", "name": "NIV", "file": "niv.sqlite", "language": "en"},
]

TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


def clean_text(value: str) -> str:
    without_tags = TAG_RE.sub("", value)
    decoded = html.unescape(without_tags)
    return SPACE_RE.sub(" ", decoded).strip()


def load_book_metadata(root: Path):
    existing = json.loads((root / "src" / "data" / "krv.json").read_text(encoding="utf-8"))
    return [
        {
            "id": book["id"],
            "number": book["number"],
            "name": book["name"],
            "testament": book["testament"],
        }
        for book in existing["books"]
    ]


def convert_translation(root: Path, translation: dict, book_metadata: list[dict]) -> dict:
    db_path = root / "source-data" / translation["file"]
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "select book, chapter, verse, content from bible order by book, chapter, verse"
    ).fetchall()
    conn.close()

    books = []
    for book_meta in book_metadata:
        book_number = book_meta["number"]
        book_rows = [row for row in rows if row[0] == book_number]
        chapters = []
        for chapter_number in sorted({row[1] for row in book_rows}):
            verses = [
                {"verse": row[2], "text": clean_text(row[3])}
                for row in book_rows
                if row[1] == chapter_number
            ]
            chapters.append({"chapter": chapter_number, "verses": verses})

        books.append({**book_meta, "chapters": chapters})

    return {
        "id": translation["id"],
        "name": translation["name"],
        "language": translation["language"],
        "verseCount": len(rows),
        "books": books,
    }


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    book_metadata = load_book_metadata(root)
    translations = [convert_translation(root, item, book_metadata) for item in TRANSLATIONS]

    output = {
        "defaultTranslationId": "krv",
        "translations": translations,
    }

    output_path = root / "src" / "data" / "bibles.json"
    output_path.write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
    print("Wrote translations:")
    for translation in translations:
        print(f"- {translation['name']}: {translation['verseCount']} verses")


if __name__ == "__main__":
    main()
