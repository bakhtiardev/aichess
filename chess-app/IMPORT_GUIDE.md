# Quick Import Guide

## Your CSV Format (10 columns)

```
id,fen,solution,rating,moveTime,clockAtMove,clockAfterMove,tags,url,opening
00sHx,q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17,e8d7 a2e6 d7d8 f7f8,1760,80,83,72,mate mateIn2 middlegame short,https://lichess.org/yyznGmXs/black#34,Italian_Game Italian_Game_Classical_Variation
00sJ9,r3r1k1/p4ppp/2p2n2/1p6/3P1qb1/2NQR3/PPB2PP1/R1B3K1 w - - 5 18,e3g3 e8e1 g1h2 e1c1 a1c1 f4h6 h2g1 h6c1,2671,105,87,325,advantage attraction fork middlegame sacrifice veryLong,https://lichess.org/gyFeQsOE#35,French_Defense French_Defense_Exchange_Variation
```

## Import Command

Replace `/path/to/your/puzzles.csv` with your actual file path:

```bash
npm run import-puzzles -- /path/to/your/puzzles.csv
```

### Windows Examples

```bash
# From same directory as puzzles.csv
npm run import-puzzles -- .\puzzles.csv

# From a specific path
npm run import-puzzles -- "C:\Users\YourName\Downloads\puzzles.csv"

# With your 1GB file
npm run import-puzzles -- "D:\Chess Data\lichess_puzzles.csv"
```

### macOS/Linux Examples

```bash
npm run import-puzzles -- ~/chess-puzzles.csv
npm run import-puzzles -- /home/user/downloads/lichess-puzzles.csv
```

## What Gets Extracted

The script automatically extracts what it needs:

| Column | Name | Extracted | Stored in |
|--------|------|-----------|-----------|
| 1 | id | ✅ Yes | `Puzzle.id` |
| 2 | fen | ✅ Yes | `Puzzle.fen` |
| 3 | solution | ✅ Yes (space-separated moves) | `Puzzle.solution` |
| 4 | rating | ✅ Yes | `Puzzle.rating` |
| 5 | moveTime | ❌ Skipped | - |
| 6 | clockAtMove | ❌ Skipped | - |
| 7 | clockAfterMove | ❌ Skipped | - |
| 8 | themes | ✅ Yes | `Puzzle.themes` |
| 9 | url | ✅ Yes (optional) | `Puzzle.pgn` |
| 10 | opening | ❌ Skipped | - |

## Expected Output

When you run the import, you'll see:

```
Starting CSV import...
Reading from: puzzles.csv

Progress: 1000 records inserted, 1000 processed
Progress: 2000 records inserted, 2000 processed
  Read 10000 lines, processed 10000 records
  Read 20000 lines, processed 20000 records
  Read 30000 lines, processed 30000 records
...
✅ CSV import completed successfully!
Total lines read: 1000001
Total records inserted: 1000000
📊 All puzzles imported successfully!
```

## Test After Import

After importing, verify the puzzles are working:

```bash
# Start dev server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/random-puzzle

# You should see a response like:
{
  "puzzle": {
    "id": "00sHx",
    "fen": "q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17",
    "solution": ["e8d7", "a2e6", "d7d8", "f7f8"],
    "rating": 1760
  }
}
```

## Troubleshooting

### "File not found" error
- Make sure your CSV path is correct
- Use absolute path if relative path doesn't work
- Check file exists: `ls /path/to/puzzles.csv` (or `dir` on Windows)

### "Skipping invalid line" warnings
- Verify your CSV is UTF-8 encoded
- Check that FEN strings are complete
- Ensure solution moves are valid UCI format (e.g., e2e4, e7e5)

### Import is slow
- This is normal! 1000 puzzles/second on typical hardware
- 1GB file = ~60-90 seconds
- Don't interrupt the process - let it complete

### Want to import again?
```bash
# Delete old database
rm prisma/puzzle.db

# Recreate schema
npx prisma db push

# Import new CSV
npm run import-puzzles -- /path/to/new-puzzles.csv
```

## Performance Expectations

| Size | Time | Records | DB Size |
|------|------|---------|---------|
| 10K puzzles | 10 sec | 10,000 | ~5 MB |
| 100K puzzles | 100 sec | 100,000 | ~50 MB |
| 1M puzzles | 15 min | 1,000,000 | ~500 MB |
| 1GB CSV | ~20 min | ~1M | ~500 MB |

## Next Steps

1. ✅ Updated import script ready
2. ⏳ Run: `npm run import-puzzles -- /path/to/puzzles.csv`
3. ⏳ Verify: `curl http://localhost:3000/api/random-puzzle`
4. ⏳ Deploy to production with database included

---

**Questions?** Check [PUZZLE_DATABASE_SETUP.md](./PUZZLE_DATABASE_SETUP.md) for more details.
