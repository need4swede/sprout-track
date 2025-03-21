# Baby Tracker Scripts

This directory contains utility scripts for the Baby Tracker application.

## ensure-utc-dates.ts

This script checks and updates all date/time fields in the database to ensure they are stored in UTC format.

### Purpose

In a web application, it's best practice to store all dates in UTC format in the database, and then convert them to the user's local timezone when displaying them in the UI. This script helps ensure that all date fields in the database are properly stored in UTC.

### How It Works

The script:

1. Connects to the database using Prisma
2. Iterates through all models that have date/time fields
3. For each model, retrieves all records
4. Checks each date field to determine if it's already in UTC
5. Converts any non-UTC dates to UTC
6. Updates the database records with the corrected UTC dates

### Running the Script

To run the script:

```bash
# Using the standalone JavaScript version (most reliable)
node scripts/ensure-utc-dates-standalone.js

# OR using the regular JavaScript version
node scripts/ensure-utc-dates.js

# OR using TypeScript with ESM flag
npx ts-node --esm scripts/ensure-utc-dates.ts
```

If you encounter errors:

1. Try the standalone version first, which has no external dependencies
2. If you get an "Unknown file extension '.ts'" error, use one of the JavaScript versions
3. If you get import errors, use the standalone version which has the timezone detection built-in

### Output

The script provides detailed output about its progress:

- The system timezone detected
- Each model being processed
- The number of records found for each model
- Which date fields are being converted for which records
- The total number of records updated for each model
- Confirmation when the process is complete

### When to Use

You should run this script:

1. After migrating data from another system
2. If you suspect that dates might not be stored in UTC
3. After making changes to the timezone handling in the application
4. As part of a database maintenance routine

### Models and Date Fields Processed

The script processes the following models and their date fields:

- Baby: birthDate, createdAt, updatedAt, deletedAt
- Caretaker: createdAt, updatedAt, deletedAt
- SleepLog: startTime, endTime, createdAt, updatedAt, deletedAt
- FeedLog: time, startTime, endTime, createdAt, updatedAt, deletedAt
- DiaperLog: time, createdAt, updatedAt, deletedAt
- MoodLog: time, createdAt, updatedAt, deletedAt
- Note: time, createdAt, updatedAt, deletedAt
- Settings: createdAt, updatedAt
- Milestone: date, createdAt, updatedAt, deletedAt
- PumpLog: startTime, endTime, createdAt, updatedAt, deletedAt
- PlayLog: startTime, endTime, createdAt, updatedAt, deletedAt
- BathLog: time, createdAt, updatedAt, deletedAt
- Measurement: date, createdAt, updatedAt, deletedAt
- Unit: createdAt, updatedAt

### Safety

The script includes error handling to prevent data loss:

- It only updates fields that need conversion to UTC
- It logs any errors that occur during the update process
- It processes each model and record independently, so an error with one record won't affect others
