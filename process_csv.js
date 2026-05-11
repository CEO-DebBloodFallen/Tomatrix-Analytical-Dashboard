import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, child } from 'firebase/database';
import fs from 'fs';

const firebaseConfig = {
  authDomain: "solanirad-analytics-dashboard.firebaseapp.com",
  databaseURL: "https://solanirad-analytics-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "solanirad-analytics-dashboard.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function pad(num) {
  return num.toString().padStart(2, '0');
}

function parseDate(ts) {
  const parts = ts.split(' ');
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  
  const m = parseInt(dateParts[0], 10);
  const d = parseInt(dateParts[1], 10);
  const y = parseInt(dateParts[2], 10);
  
  const h = parseInt(timeParts[0], 10);
  const min = parseInt(timeParts[1], 10);
  
  const dateObj = new Date(y, m - 1, d, h, min, 0);
  
  // Format to standard MM-DD-YYYY HH:mm:ss if we want to match existing pattern,
  // or just return the original timestamp. We'll use this dateObj for sorting.
  return {
    original: ts,
    date: dateObj,
    formatted: `${pad(m)}-${pad(d)}-${y} ${pad(h)}:${pad(min)}:00`,
    timestampMs: dateObj.getTime()
  };
}

async function processData() {
  const allLines = [];
  ['part1.csv', 'part2.csv', 'part3.csv', 'part4.csv'].forEach(file => {
    const text = fs.readFileSync(file, 'utf8');
    text.split('\n').forEach(line => {
      if (line.includes('/2026')) {
        allLines.push(line.trim());
      }
    });
  });

  // Remove duplicates and keep latest if there were duplicate timestamps
  const uniqueRecords = {};
  for (const line of allLines) {
    const cols = line.split(',');
    
    const tsStr = cols[0];
    const nh3Str = cols[1];
    const co2Str = cols[2];
    const vocStr = cols[3];
    const tempStr = cols[4];
    const weightStr = cols[5];
    const humStr = cols[6];

    const parsedData = parseDate(tsStr);
    
    uniqueRecords[parsedData.timestampMs] = {
      dateObj: parsedData.date,
      formattedTs: parsedData.formatted,
      originalTs: tsStr,
      nh3: nh3Str,
      co2: co2Str,
      voc: vocStr,
      temp: tempStr,
      weight: weightStr,
      hum: humStr
    };
  }

  // Get current DB to find matching dates
  const historyRef = ref(db, 'sensor_history');
  const snapshot = await get(historyRef);
  const existingData = snapshot.exists() ? snapshot.val() : {};
  
  // Find which ID to use
  // The user says "use Timestamp as the unique key".
  // But the existing records use numeric keys like "354975932". Let's look at existing ones:
  const idsByTs = {};
  for (const [key, val] of Object.entries(existingData)) {
    // Existing DB uses format like "03-30-2026 22:07:42"
    idsByTs[val.timestamp] = key;
  }

  const sortedKeys = Object.keys(uniqueRecords).sort((a,b) => b - a);

  const updates = {};
  let newEntries = 0;
  let updatedEntries = 0;

  for (const tMs of sortedKeys) {
    const record = uniqueRecords[tMs];
    const matchFormatted = record.formattedTs;
    
    // Check if it exists exactly in DB
    let idKey = idsByTs[matchFormatted];
    
    if (idKey) {
      updatedEntries++;
    } else {
      idKey = Date.now().toString() + Math.floor(Math.random()*10000).toString(); // generate an ID
      newEntries++;
      // Since it's going fast, ensure uniqueness
      await new Promise(r => setTimeout(r, 1));
    }

    updates[idKey] = {
      id: idKey,
      timestamp: matchFormatted,
      nh3: typeof record.nh3 === 'string' ? parseFloat(record.nh3) : record.nh3,
      co2: typeof record.co2 === 'string' ? parseFloat(record.co2) : record.co2,
      voc: typeof record.voc === 'string' ? parseFloat(record.voc) : record.voc,
      temperature: typeof record.temp === 'string' ? parseFloat(record.temp) : record.temp,
      weight: typeof record.weight === 'string' ? parseFloat(record.weight) : record.weight,
      humidity: typeof record.hum === 'string' ? parseFloat(record.hum) : record.hum,
      so2: 0 // Default setting since it's not in the CSV
    };
  }

  await update(historyRef, updates);
  
  // Now dump exactly what needs to be in the chat to a markdown file
  let md = '|Timestamp|NH3|CO2|VOC|Temp|Weight|Hum|\n|---|---|---|---|---|---|---|\n';
  
  for (const tMs of sortedKeys) {
    const record = uniqueRecords[tMs];
    md += `|${record.originalTs}|${record.nh3}|${record.co2}|${record.voc}|${record.temp}|${record.weight}|${record.hum}|\n`;
  }

  const resultMsg = `Total entries processed: ${sortedKeys.length}.`;
  md += `\n**✅ LIVE DATA LOG successfully updated from the uploaded Excel file. ${resultMsg}**\n`;

  fs.writeFileSync('output.md', md);
  console.log("Processed successfully: " + sortedKeys.length + " entries");
  process.exit(0);
}

processData();
