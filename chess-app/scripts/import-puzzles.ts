import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface PuzzleRecord {
  id: string;
  fen: string;
  solution: string[];
  rating: number;
  themes?: string;
  url?: string;
}

const CSV_COLUMNS = {
  ID: 0,
  FEN: 1,
  SOLUTION: 2,
  RATING: 3,
  THEMES: 7,
  URL: 8,
} as const;

async function importPuzzlesFromCSV(csvFilePath: string): Promise<void> {
  const fileStream = fs.createReadStream(csvFilePath, {
    encoding: 'utf8',
    highWaterMark: 64 * 1024, // 64KB buffer for streaming large files
  });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let recordsProcessed = 0;
  let recordsInserted = 0;
  const batchSize = 1000;
  const progressInterval = 10000;
  const batch: PuzzleRecord[] = [];

  console.log('Starting CSV import...');
  console.log(`Reading from: ${csvFilePath}\n`);

  for await (const line of rl) {
    try {
      // Parse CSV line - handles quoted fields
      const parts = parseCSVLine(line);
      
      // Expected format: id, fen, solution, rating, num1, num2, num3, themes, url, opening
      // We only need id/fen/solution/rating plus themes and url.
      if (parts.length < 4) {
        console.warn(`Skipping invalid line ${lineCount}: insufficient fields (got ${parts.length})`);
        lineCount++;
        continue;
      }

      const puzzle: PuzzleRecord = {
        id: parts[CSV_COLUMNS.ID]?.trim(),
        fen: parts[CSV_COLUMNS.FEN]?.trim(),
        solution: parseSolutionMoves(parts[CSV_COLUMNS.SOLUTION]),
        rating: parseInt(parts[CSV_COLUMNS.RATING], 10),
        themes: parts[CSV_COLUMNS.THEMES]?.trim() || undefined,
        url: parts[CSV_COLUMNS.URL]?.trim() || undefined,
      };

      // Validate data
      if (!puzzle.id || !puzzle.fen || puzzle.solution.length === 0 || isNaN(puzzle.rating)) {
        console.warn(`Skipping invalid puzzle at line ${lineCount}`);
        lineCount++;
        continue;
      }

      batch.push(puzzle);
      recordsProcessed++;

      // Insert batch when size is reached
      if (batch.length >= batchSize) {
        await insertBatch(batch);
        recordsInserted += batch.length;
        batch.length = 0;
        if (recordsInserted % progressInterval === 0) {
          console.log(`Progress: ${recordsInserted} records inserted, ${recordsProcessed} processed`);
        }
      }
    } catch (error) {
      console.warn(`Error parsing line ${lineCount}: ${error instanceof Error ? error.message : String(error)}`);
    }

    lineCount++;

    // Show progress every 10000 lines
    if (lineCount % 10000 === 0) {
      console.log(`  Read ${lineCount} lines, processed ${recordsProcessed} records`);
    }
  }

  // Insert remaining records
  if (batch.length > 0) {
    await insertBatch(batch);
    recordsInserted += batch.length;
    console.log(`Progress: ${recordsInserted} records inserted, ${recordsProcessed} processed`);
  }

  console.log('\n✅ CSV import completed successfully!');
  console.log(`Total lines read: ${lineCount}`);
  console.log(`Total records inserted: ${recordsInserted}`);
}

/**
 * Parse a CSV line carefully, handling quoted fields that may contain commas
 */
function parseCSVLine(line: string): string[] {
  const parts: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  parts.push(current.trim());
  return parts;
}

/**
 * Parse solution moves from space-separated format
 * Handles formats like: "e2e4 e7e5 g1f3" or "[e2e4, e7e5]"
 */
function parseSolutionMoves(solutionStr: string): string[] {
  if (!solutionStr) return [];
  
  // Remove quotes if present
  solutionStr = solutionStr.replace(/^["']|["']$/g, '');
  
  // Handle array notation like "[e2e4, e7e5]"
  if (solutionStr.startsWith('[') && solutionStr.endsWith(']')) {
    solutionStr = solutionStr.slice(1, -1);
  }
  
  // Split by comma or space and filter empty strings
  return solutionStr
    .split(/[,\s]+/)
    .map(move => move.trim().toLowerCase())
    .filter(move => move.length >= 4 && move.length <= 5); // Valid UCI moves are 4-5 chars
}

/**
 * Insert a batch of records into the database
 */
async function insertBatch(puzzles: PuzzleRecord[]): Promise<void> {
  try {
    // Upsert lets re-imports repair previously-mapped rows.
    for (const puzzle of puzzles) {
      await prisma.puzzle.upsert({
        where: { id: puzzle.id },
        create: {
          id: puzzle.id,
          fen: puzzle.fen,
          solution: JSON.stringify(puzzle.solution),
          rating: puzzle.rating,
          themes: puzzle.themes || null,
          pgn: puzzle.url || null,
        },
        update: {
          fen: puzzle.fen,
          solution: JSON.stringify(puzzle.solution),
          rating: puzzle.rating,
          themes: puzzle.themes || null,
          pgn: puzzle.url || null,
        },
      });
    }
  } catch (error) {
    console.error(`Error inserting batch: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Main function with error handling
 */
async function main(): Promise<void> {
  const csvPath = process.argv[2] || './puzzles.csv';

  try {
    if (!fs.existsSync(csvPath)) {
      console.error(`Error: CSV file not found at ${csvPath}`);
      console.error('Usage: npm run import-puzzles -- <path-to-csv-file>');
      console.error('\nExpected CSV format:');
      console.error('id,fen,solution,rating,num1,num2,num3,themes,url,opening');
      console.error('\nExample:');
      console.error('00sHx,q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17,e8d7 a2e6 d7d8 f7f8,1760,80,83,72,mate mateIn2 middlegame short,https://lichess.org/yyznGmXs/black#34,Italian_Game');
      process.exit(1);
    }

    await importPuzzlesFromCSV(csvPath);
    console.log('\n📊 All puzzles imported successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

