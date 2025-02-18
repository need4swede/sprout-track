import { PrismaClient, Prisma } from '@prisma/client';

// Log levels for development
const logLevels: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' 
  ? ['query', 'info', 'warn', 'error']
  : ['error'];

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: logLevels.map(level => ({
      emit: 'stdout',
      level,
    })),
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, use global singleton to prevent multiple instances
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: logLevels.map(level => ({
        emit: 'stdout',
        level,
      })),
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = (global as any).prisma;
}

// Handle graceful shutdown
const handleShutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};

// Remove any existing listeners to prevent duplicates
process.removeAllListeners('beforeExit');
process.removeAllListeners('SIGTERM');
process.removeAllListeners('SIGINT');

// Add single listeners for each event
process.once('beforeExit', handleShutdown);
process.once('SIGTERM', handleShutdown);
process.once('SIGINT', handleShutdown);

export default prisma;
