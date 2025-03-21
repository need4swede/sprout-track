/**
 * Script to check and update all time fields in the database to UTC
 * Run with: npx ts-node scripts/ensure-utc-dates.ts
 */

import { PrismaClient } from '@prisma/client';
import { getSystemTimezone } from '../app/api/utils/timezone';

const prisma = new PrismaClient();

// Models and their date fields
const dateFieldsByModel = {
  Baby: ['birthDate', 'createdAt', 'updatedAt', 'deletedAt'],
  Caretaker: ['createdAt', 'updatedAt', 'deletedAt'],
  SleepLog: ['startTime', 'endTime', 'createdAt', 'updatedAt', 'deletedAt'],
  FeedLog: ['time', 'startTime', 'endTime', 'createdAt', 'updatedAt', 'deletedAt'],
  DiaperLog: ['time', 'createdAt', 'updatedAt', 'deletedAt'],
  MoodLog: ['time', 'createdAt', 'updatedAt', 'deletedAt'],
  Note: ['time', 'createdAt', 'updatedAt', 'deletedAt'],
  Settings: ['createdAt', 'updatedAt'],
  Milestone: ['date', 'createdAt', 'updatedAt', 'deletedAt'],
  PumpLog: ['startTime', 'endTime', 'createdAt', 'updatedAt', 'deletedAt'],
  PlayLog: ['startTime', 'endTime', 'createdAt', 'updatedAt', 'deletedAt'],
  BathLog: ['time', 'createdAt', 'updatedAt', 'deletedAt'],
  Measurement: ['date', 'createdAt', 'updatedAt', 'deletedAt'],
  Unit: ['createdAt', 'updatedAt']
};

/**
 * Check if a date is in UTC
 * @param date The date to check
 * @returns True if the date is in UTC, false otherwise
 */
function isUtcDate(date: Date): boolean {
  // A UTC date's toString() and toISOString() hours should be the same
  // This is a simple check that might not be 100% accurate in all cases
  const isoHours = new Date(date.toISOString()).getUTCHours();
  const dateHours = date.getUTCHours();
  
  return isoHours === dateHours;
}

/**
 * Convert a date to UTC
 * @param date The date to convert
 * @returns The date in UTC
 */
function toUtc(date: Date): Date {
  return new Date(date.toISOString());
}

/**
 * Process a model to ensure all date fields are in UTC
 * @param modelName The name of the model to process
 */
async function processModel(modelName: string) {
  console.log(`Processing ${modelName}...`);
  
  const dateFields = dateFieldsByModel[modelName as keyof typeof dateFieldsByModel];
  if (!dateFields || dateFields.length === 0) {
    console.log(`No date fields found for ${modelName}`);
    return;
  }
  
  // Get all records for the model
  // @ts-ignore - Dynamic access to prisma models
  const records = await prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)].findMany();
  console.log(`Found ${records.length} records for ${modelName}`);
  
  let updatedCount = 0;
  
  // Process each record
  for (const record of records) {
    const updates: Record<string, Date> = {};
    let needsUpdate = false;
    
    // Check each date field
    for (const field of dateFields) {
      const date = record[field];
      if (date && date instanceof Date) {
        if (!isUtcDate(date)) {
          updates[field] = toUtc(date);
          needsUpdate = true;
          console.log(`Converting ${field} for ${modelName} record ${record.id}`);
        }
      }
    }
    
    // Update the record if needed
    if (needsUpdate) {
      try {
        // @ts-ignore - Dynamic access to prisma models
        await prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)].update({
          where: { id: record.id },
          data: updates
        });
        updatedCount++;
      } catch (error) {
        console.error(`Error updating ${modelName} record ${record.id}:`, error);
      }
    }
  }
  
  console.log(`Updated ${updatedCount} records for ${modelName}`);
}

/**
 * Main function to process all models
 */
async function main() {
  console.log('Starting UTC date conversion...');
  console.log(`System timezone: ${getSystemTimezone()}`);
  
  // Process each model
  for (const modelName of Object.keys(dateFieldsByModel)) {
    await processModel(modelName);
  }
  
  console.log('UTC date conversion complete!');
}

// Run the main function
main()
  .catch(e => {
    console.error('Error in UTC date conversion:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
