import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

async function ensureConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.log('Database connection lost, reconnecting...');
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 2000));
    return false;
  }
}

async function loadSynergyData() {
  const csvPath = path.join(process.cwd(), 'all_synergy_per_concentration.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    console.log('Please make sure your CSV file is in the project root');
    process.exit(1);
  }

  console.log('Clearing existing drug combinations...');
  try {
    await ensureConnection();
    await prisma.drugCombination.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    process.exit(1);
  }

  const combinations = new Map();
  
  console.log('Loading drug combination data from CSV...');
  
  await new Promise((resolve, reject) => {
    let rowCount = 0;
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        if (parseFloat(row.concentration_a) === 0 && parseFloat(row.concentration_b) === 0) {
          return;
        }
        
        const drugA = row.Drug_A;
        const drugB = row.Drug_B;
        const cellLine = row.Cell_Line;
        const concA = parseFloat(row.concentration_a);
        const concB = parseFloat(row.concentration_b);
        
        const key = `${drugA}-${drugB}-${cellLine}`;
        
        if (!combinations.has(key)) {
          combinations.set(key, {
            drugA,
            drugB,
            cellLine,
            minConcA: Infinity,
            maxConcA: -Infinity,
            minConcB: Infinity,
            maxConcB: -Infinity,
          });
        }
        
        const combo = combinations.get(key);
        
        combo.minConcA = Math.min(combo.minConcA, concA);
        combo.maxConcA = Math.max(combo.maxConcA, concA);
        combo.minConcB = Math.min(combo.minConcB, concB);
        combo.maxConcB = Math.max(combo.maxConcB, concB);

        if (rowCount % 10000 === 0) {
          console.log(`Processed ${rowCount} rows...`);
        }
      })
      .on('end', () => {
        console.log(`CSV processing complete. Processed ${rowCount} total rows`);
        resolve(null);
      })
      .on('error', reject);
  });

  console.log(`Found ${combinations.size} unique drug combinations`);
  console.log('Starting database save process...');

  const combinationsArray = Array.from(combinations.values());
  let successCount = 0;
  let errorCount = 0;
  
  const batchSize = 100;
  
  for (let i = 0; i < combinationsArray.length; i += batchSize) {
    const batch = combinationsArray.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(combinationsArray.length / batchSize);
    
    console.log(`Saving batch ${batchNumber} of ${totalBatches} (${batch.length} combinations)...`);
    
    for (const combo of batch) {
      let retries = 3;
      let saved = false;
      
      while (retries > 0 && !saved) {
        try {
          await ensureConnection();
          
          await prisma.drugCombination.create({
            data: {
              drugA: combo.drugA,
              drugB: combo.drugB,
              cellLine: combo.cellLine,
              minConcA: combo.minConcA,
              maxConcA: combo.maxConcA,
              minConcB: combo.minConcB,
              maxConcB: combo.maxConcB,
            },
          });
          
          successCount++;
          saved = true;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error(`Failed to save ${combo.drugA}+${combo.drugB} in ${combo.cellLine} after 3 retries:`, error);
            errorCount++;
          } else {
            console.log(`Retrying ${combo.drugA}+${combo.drugB}... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }
    
    console.log(`Batch ${batchNumber} completed: ${successCount + errorCount}/${combinationsArray.length} combinations processed`);
    
    if (i + batchSize < combinationsArray.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`Data loading completed`);
  console.log(`Successfully saved: ${successCount} combinations`);
  console.log(`Failed to save: ${errorCount} combinations`);
  console.log(`Total unique combinations processed: ${combinations.size}`);
  
  await prisma.$disconnect();
}

loadSynergyData().catch(console.error);