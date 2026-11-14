import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import City from '../models/City.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tripona';
const CSV_FILE = path.resolve('server/data/worldcities.csv');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function seedWorldCities(limit = null) {
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ World cities CSV not found at: ${CSV_FILE}`);
    return;
  }

  console.log(`🌍 Connecting to MongoDB for world cities seed...`);
  await mongoose.connect(MONGODB_URI);

  const existingCount = await City.countDocuments();
  if (existingCount > 40000) {
    console.log(`✅ World cities collection already populated with ${existingCount} cities. Skipping re-seed.`);
    return existingCount;
  }

  console.log(`🚀 Starting world cities ingestion from ${CSV_FILE}...`);
  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_FILE),
    crlfDelay: Infinity
  });

  let lineIndex = 0;
  let batch = [];
  let totalInserted = 0;
  const BATCH_SIZE = 2500;

  for await (const line of rl) {
    lineIndex++;
    if (lineIndex === 1) continue; // Skip CSV header

    const cols = parseCSVLine(line);
    if (cols.length < 11) continue;

    const [
      city,
      cityAscii,
      latStr,
      lngStr,
      country,
      iso2,
      iso3,
      adminName,
      capital,
      popStr,
      cityId
    ] = cols;

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const population = parseInt(popStr, 10) || 0;

    if (!city || isNaN(lat) || isNaN(lng) || !cityId) continue;

    batch.push({
      updateOne: {
        filter: { cityId: String(cityId) },
        update: {
          $set: {
            cityId: String(cityId),
            city,
            cityAscii: cityAscii || city,
            lat,
            lng,
            country,
            iso2: iso2 || '',
            iso3: iso3 || '',
            adminName: adminName || '',
            capital: capital || '',
            population
          }
        },
        upsert: true
      }
    });

    if (batch.length >= BATCH_SIZE) {
      await City.bulkWrite(batch, { ordered: false });
      totalInserted += batch.length;
      process.stdout.write(`\r   📦 Imported ${totalInserted} world cities...`);
      batch = [];
    }

    if (limit && lineIndex >= limit) break;
  }

  if (batch.length > 0) {
    await City.bulkWrite(batch, { ordered: false });
    totalInserted += batch.length;
  }

  const finalCount = await City.countDocuments();
  console.log(`\n🎉 World cities ingestion complete! Total verified cities in DB: ${finalCount}`);
  return finalCount;
}

if (process.argv[1]?.includes('seedWorldCities.js')) {
  seedWorldCities()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Ingestion failed:', err);
      process.exit(1);
    });
}
