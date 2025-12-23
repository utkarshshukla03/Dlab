import { PrismaClient } from './generated/prisma';

// Global singleton Prisma client with connection pooling
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a single Prisma client instance with optimized connection pooling
const prismaClient = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pool configuration for serverless databases
  // @ts-ignore - These options are valid for Prisma but may not be in type definitions
  __internal: {
    engine: {
      connection_limit: 10,
      pool_timeout: 10,
    },
  },
});

// Connection retry logic
async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prismaClient.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error('Failed to connect to database after multiple retries');
      }
    }
  }
}

// Middleware to handle connection errors and reconnect
prismaClient.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error: any) {
    // Handle closed connection errors
    if (error.message?.includes('Connection closed') || error.kind === 'Closed') {
      console.log('⚠️ Database connection closed, reconnecting...');
      await prismaClient.$connect();
      return await next(params);
    }
    throw error;
  }
});

// Initialize connection
connectWithRetry().catch((error) => {
  console.error('Fatal: Could not establish database connection', error);
  process.exit(1);
});

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prismaClient;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prismaClient.$disconnect();
});

export { prismaClient };
