import { PrismaClient, Prisma } from '@prisma/client';

// Log levels for development
const logLevels: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' 
  ? ['query', 'info', 'warn', 'error']
  : ['error'];

// Configure Prisma Client with logging and connection options
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: logLevels.map(level => ({
      emit: 'stdout',
      level,
    } as Prisma.LogDefinition)),
    // Add connection configuration for production
    ...(process.env.NODE_ENV === 'production' && {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }),
  });
};

// Declare global type for PrismaClient
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Initialize singleton
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
