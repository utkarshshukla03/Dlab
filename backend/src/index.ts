import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import userRouter from './routers/user';
import workerRouter from './routers/worker';
import { prismaClient } from './db';
import { initializePlatformWallet, getPlatformWalletAddress } from './solana';

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for upload endpoints
  message: 'Too many upload requests, please try again later.',
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'https://dlab-user.vercel.app', 'https://dlab-worker.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(limiter); // Apply rate limiting to all routes

export const JWT_SECRET = process.env.JWT_SECRET || "Utkarsh123;";

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 User Frontend: http://localhost:3000`);
  console.log(`👷 Worker Frontend: http://localhost:3001`);
  console.log(`🔗 CORS enabled for: localhost:3000, 3001, 3002, 3003`);
  
  // Initialize Solana wallet for payouts
  const walletInitialized = initializePlatformWallet();
  if (walletInitialized) {
    console.log(`💰 Platform Wallet: ${getPlatformWalletAddress()}`);
  } else {
    console.log(`⚠️  Payouts will be simulated (no private key configured)`);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prismaClient.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prismaClient.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});