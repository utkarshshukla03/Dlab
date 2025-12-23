import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Prisma } from '../generated/prisma';
import {JWT_SECRET} from '..';
import { authMiddleware } from './middleware';
import { prismaClient } from '../db';
import { sendPayout } from '../solana';

const router = Router();

// Validation schemas
const signinSchema = z.object({
  publicKey: z.string().min(32).max(44),
  signature: z.any().optional()
});

const submissionSchema = z.object({
  taskId: z.string().or(z.number()),
  selection: z.string().or(z.number())
});

// Worker signin with wallet
router.post("/signin", async (req, res): Promise<void> => {
  try {
    // Validate request body
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: validationResult.error.issues 
      });
      return;
    }

    const { signature, publicKey } = validationResult.data;

    const existingWorker = await prismaClient.worker.findFirst({
      where: {
        address: publicKey
      }
    });

    if (existingWorker) {
      const token = jwt.sign({
        userId: existingWorker.id,
      }, JWT_SECRET);

      res.json({
        token,
        amount: (existingWorker.pending_amount / 1000000000).toFixed(2) // Convert lamports to SOL
      });
    } else {
      const worker = await prismaClient.worker.create({
        data: {
          address: publicKey,
          pending_amount: 0,
          locked_amount: 0
        }
      });

      const token = jwt.sign({
        userId: worker.id,
      }, JWT_SECRET);

      res.json({
        token,
        amount: "0.00"
      });
    }
  } catch (error) {
    console.error("Error in worker signin:", error);
    res.status(500).json({ error: "Sign in failed" });
  }
});

// Get next available task for worker
router.get("/nextTask", authMiddleware, async (req, res): Promise<void> => {
  try {
    // @ts-ignore
    const workerId = req.userId;

    console.log('Worker requesting next task, workerId:', workerId);

    // Find tasks that this worker hasn't submitted to yet
    const availableTask = await prismaClient.task.findFirst({
      where: {
        submissions: {
          none: {
            worker_id: workerId
          }
        }
      },
      include: {
        options: true
      },
      orderBy: {
        id: 'asc' // Get oldest task first
      }
    });

    console.log('Available task found:', availableTask ? `ID: ${availableTask.id}` : 'None');

    if (!availableTask) {
      res.json({ task: null });
      return;
    }

    res.json({
      task: {
        id: availableTask.id,
        title: availableTask.title,
        amount: availableTask.amount,
        options: availableTask.options.map(option => ({
          id: option.id,
          image_url: option.image_url,
          task_id: option.task_id
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching next task:", error);
    res.status(500).json({ error: "Failed to fetch next task" });
  }
});

// Submit worker's choice for a task
router.post("/submission", authMiddleware, async (req, res): Promise<void> => {
  try {
    // @ts-ignore
    const workerId = req.userId;
    
    // Validate request body
    const validationResult = submissionSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: validationResult.error.issues 
      });
      return;
    }

    const { taskId, selection } = validationResult.data;

    // Convert to numbers
    const taskIdNum = typeof taskId === 'number' ? taskId : parseInt(taskId);
    const selectionNum = typeof selection === 'number' ? selection : parseInt(selection);

    // Check if worker already submitted for this task
    const existingSubmission = await prismaClient.submission.findFirst({
      where: {
        worker_id: workerId,
        task_id: taskIdNum
      }
    });

    if (existingSubmission) {
      res.status(400).json({ error: "You have already submitted for this task" });
      return;
    }

    // Verify the option exists and belongs to the task
    const option = await prismaClient.options.findFirst({
      where: {
        id: selectionNum,
        task_id: taskIdNum
      }
    });

    if (!option) {
      res.status(400).json({ error: "Invalid option selected" });
      return;
    }

    // Create submission
    await prismaClient.submission.create({
      data: {
        worker: {
          connect: { id: workerId }
        },
        option: {
          connect: { id: selectionNum }
        },
        task: {
          connect: { id: taskIdNum }
        },
        amount: 10000000 // 0.01 SOL in lamports (0.01 * 1e9)
      }
    });

    // Update worker's pending balance
    await prismaClient.worker.update({
      where: { id: workerId },
      data: {
        pending_amount: {
          increment: 10000000 // 0.01 SOL in lamports
        }
      }
    });

    // Find next available task
    const nextTask = await prismaClient.task.findFirst({
      where: {
        submissions: {
          none: {
            worker_id: workerId
          }
        }
      },
      include: {
        options: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Get updated worker balance
    const updatedWorker = await prismaClient.worker.findUnique({
      where: { id: workerId }
    });

    const responseData: any = {
      message: "Submission successful",
      reward: "0.01 SOL",
      pendingAmount: (updatedWorker?.pending_amount ?? 0) / 1000000000
    };

    if (nextTask) {
      responseData.nextTask = {
        id: nextTask.id,
        title: nextTask.title,
        amount: nextTask.amount,
        options: nextTask.options.map(option => ({
          id: option.id,
          image_url: option.image_url,
          task_id: option.task_id
        }))
      };
    } else {
      responseData.nextTask = null;
    }

    res.json(responseData);

  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ error: "Failed to submit task" });
  }
});

// Handle payout request
router.post("/payout", authMiddleware, async (req, res): Promise<void> => {
  try {
    // @ts-ignore
    const workerId = req.userId;

    const worker = await prismaClient.worker.findUnique({
      where: { id: workerId }
    });

    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }

    if (worker.pending_amount === 0) {
      res.status(400).json({ error: "No pending balance to payout" });
      return;
    }

    const payoutAmount = worker.pending_amount;
    const payoutSOL = (payoutAmount / 1000000000).toFixed(4);

    console.log(`Processing payout for worker ${workerId}: ${payoutSOL} SOL to ${worker.address}`);

    // Send actual Solana transaction
    const payoutResult = await sendPayout(worker.address, payoutAmount);

    if (!payoutResult.success) {
      res.status(500).json({ 
        error: "Payout failed", 
        details: payoutResult.error 
      });
      return;
    }

    // Update worker balance after successful transaction
    await prismaClient.worker.update({
      where: { id: workerId },
      data: {
        pending_amount: 0
      }
    });

    // Create payout record (you can link this to user's Payouts table if needed)
    console.log(`✅ Payout successful: ${payoutSOL} SOL sent to ${worker.address}`);
    console.log(`Transaction signature: ${payoutResult.signature}`);

    res.json({
      message: "Payout successful! SOL has been sent to your wallet.",
      amount: payoutSOL + " SOL",
      workerAddress: worker.address,
      transactionSignature: payoutResult.signature,
      explorerUrl: `https://explorer.solana.com/tx/${payoutResult.signature}?cluster=devnet`
    });

  } catch (error) {
    console.error("Error processing payout:", error);
    res.status(500).json({ error: "Failed to process payout" });
  }
});

export default router;