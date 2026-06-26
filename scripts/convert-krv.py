import html
import json
import re
import sqlite3
from pathlib import Path

BOOKS = [
    ("genesis", "창세기", "old"),
    ("exodus", "출애굽기", "old"),
    ("leviticus", "레위기", "old"),
    ("numbers", "민수기", "old"),
    ("deuteronomy", "신명기", "old"),
    ("joshua", "여호수아", "old"),
    ("judges", "사사기", "old"),
    ("ruth", "룻기", "old"),
    ("1-samuel", "사무엘상", "old"),
    ("2-samuel", "사무엘하", "old"),
    ("1-kings", "열왕기상", "old"),
    ("2-kings", "열왕기하", "old"),
    ("1-chronicles", "역대상", "old"),
    ("2-chronicles", "역대하", "old"),
    ("ezra", "에스라", "old"),
    ("nehemiah", "느헤미야", "old"),
    ("esther", "에스더", "old"),
    ("job", "욥기", "old"),
    ("psalms", "시편", "old"),
    ("proverbs", "잠언", "old"),
    ("ecclesiastes", "전도서", "old"),
    ("song-of-songs", "아가", "old"),
    ("isaiah", "이사야", "old"),
    ("jeremiah", "예레미야", "old"),
    ("lamentations", "예레미야애가", "old"),
    ("ezekiel", "에스겔", "old"),
    ("daniel", "다니엘", "old"),
    ("hosea", "호세아", "old"),
    ("joel", "요엘", "old"),
    ("amos", "아모스", "old"),
    ("obadiah", "오바댜", "old"),
    ("jonah", "요나", "old"),
    ("micah", "미가", "old"),
    ("nahum", "나훔", "old"),
    ("habakkuk", "하박국", "old"),
    ("zephaniah", "스바냐", "old"),
    ("haggai", "학개", "old"),
    ("zechariah", "스가랴", "old"),
    ("malachi", "말라기", "old"),
    ("matthew", "마태복음", "new"),
    ("mark", "마가복음", "new"),
    ("luke", "누가복음", "new"),
    ("john", "요한복음", "new"),
    ("acts", "사도행전", "new"),
    ("romans", "로마서", "new"),
    ("1-corinthians", "고린도전서", "new"),
    ("2-corinthians", "고린도후서", "new"),
    ("galatians", "갈라디아서", "new"),
    ("ephesians", "에베소서", "new"),
    ("philippians", "빌립보서", "new"),
    ("colossians", "골로새서", "new"),
    ("1-thessalonians", "데살로니가전서", "new"),
    ("2-thessalonians", "데살로니가후서", "new"),
    ("1-timothy", "디모데전서", "new"),
    ("2-timothy", "디모데후서", "new"),
    ("titus", "디도서", "new"),
    ("philemon", "빌레몬서", "new"),
    ("hebrews", "히브리서", "new"),
    ("james", "야고보서", "new"),
    ("1-peter", "베드로전서", "new"),
    ("2-peter", "베드로후서", "new"),
    ("1-john", "요한일서", "new"),
    ("2-john", "요한이서", "new"),
    ("3-john", "요한삼서", "new"),
    ("jude", "유다서", "new"),
    ("revelation", "요한계시록", "new"),
]

TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


def clean_text(value: str) -> str:
    without_tags = TAG_RE.sub("", value)
    decoded = html.unescape(without_tags)
    return SPACE_RE.sub(" ", decoded).strip()


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    db_path = root / "source-data" / "krv.sqlite"
    output_path = root / "src" / "data" / "krv.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "select book, chapter, verse, content from bible order by book, chapter, verse"
    ).fetchall()
    conn.close()

    books = []
    for book_number, (book_id, name, testament) in enumerate(BOOKS, start=1):
        book_rows = [row for row in rows if row[0] == book_number]
        chapters = []
        for chapter_number in sorted({row[1] for row in book_rows}):
            verses = [
                {"verse": row[2], "text": clean_text(row[3])}
                for row in book_rows
                if row[1] == chapter_number
            ]
            chapters.append({"chapter": chapter_number, "verses": verses})

        books.append(
            {
                "id": book_id,
                "number": book_number,
                "name": name,
                "testament": testament,
                "chapters": chapters,
            }
        )

    output_path.write_text(
        json.dumps({"translation": "개역한글", "books": books}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {len(rows)} verses to {output_path}")


if __name__ == "__main__":
    main()
