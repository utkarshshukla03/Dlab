import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Prisma } from '../generated/prisma';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import {JWT_SECRET} from '..';
import { authMiddleware } from './middleware';
import { prismaClient } from '../db';

// Validation schemas
const taskSchema = z.object({
  title: z.string().min(3).max(200),
  signature: z.string().min(1),
  options: z.array(z.object({
    imageUrl: z.string().url()
  })).min(2).max(10)
});

const signinSchema = z.object({
  publicKey: z.string().min(32).max(44),
  signature: z.any().optional()
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const router = Router();

// Create a new task
router.post("/task", authMiddleware, async (req, res): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.userId;
    
    // Validate request body
    const validationResult = taskSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: validationResult.error.issues 
      });
      return;
    }

    const { options, title, signature } = validationResult.data;

    // Sanitize title to prevent XSS
    const sanitizedTitle = title.trim().replace(/<[^>]*>/g, '');

    // Create task
    const task = await prismaClient.task.create({
      data: {
        title: sanitizedTitle,
        signature,
        amount: 100000000, // 0.1 SOL in lamports (0.1 * 1e9)
        user: {
          connect: { id: userId }
        },
        options: {
          create: options.map((option: any) => ({
            image_url: option.imageUrl
          }))
        }
      },
      include: {
        options: true
      }
    });

    res.json({
      id: task.id,
      message: "Task created successfully"
    });

  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get task details and results
router.get("/task", authMiddleware, async (req, res): Promise<void> => {
  try {
    const { taskId } = req.query;
    
    if (!taskId) {
      res.status(400).json({ error: "Task ID is required" });
      return;
    }

    const task = await prismaClient.task.findUnique({
      where: { id: parseInt(taskId as string) },
      include: {
        options: {
          include: {
            submissions: true
          }
        }
      }
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Calculate results
    const result: Record<string, { count: number; option: { imageUrl: string } }> = {};
    
    task.options.forEach(option => {
      result[option.id.toString()] = {
        count: option.submissions.length,
        option: {
          imageUrl: option.image_url
        }
      };
    });

    res.json({
      taskDetails: {
        title: task.title
      },
      result
    });

  } catch (error) {
    console.error("Error fetching task details:", error);
    res.status(500).json({ error: "Failed to fetch task details" });
  }
});

// Get presigned URL for direct S3 upload from frontend
router.get("/presignedUrl", authMiddleware, async (req, res): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.userId;
    
    console.log('Generating presigned URL for user:', userId);
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials not configured');
      res.status(500).json({ error: "AWS credentials not configured" });
      return;
    }
    
    const key = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME || "dlab-captsone",
      Key: key,
      Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024], // 5MB max
        ['starts-with', '$Content-Type', 'image/']
      ],
      Fields: {
        'Content-Type': 'image/jpeg'
      },
      Expires: 3600 // 1 hour
    });

    // Return CloudFront URL for accessing the uploaded image
    const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DOMAIN || 'd3fog2x66tuiqa.cloudfront.net'}/${key}`;
    
    console.log('Generated presigned URL successfully');
    console.log('Upload URL:', url);
    console.log('CloudFront URL for access:', cloudFrontUrl);
    
    res.json({
      preSignedUrl: url,
      fields: {
        ...fields,
        key: key
      },
      cloudFrontUrl: cloudFrontUrl
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

// User signin with wallet
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

    console.log('User signin attempt:', { publicKey, signature: signature ? 'present' : 'missing' });

    const walletAddress = publicKey;

    const existingUser = await prismaClient.user.findFirst({
      where: {
        address: walletAddress
      }
    });

    if (existingUser) {
      const token = jwt.sign({
        userId: existingUser.id,
      }, JWT_SECRET);

      console.log('Existing user signed in:', existingUser.id);
      res.json({
        token,
        userId: existingUser.id
      });
    } else {
      const user = await prismaClient.user.create({
        data: {
          address: walletAddress,
        }
      });

      const token = jwt.sign({
        userId: user.id,
      }, JWT_SECRET);

      console.log('New user created and signed in:', user.id);
      res.json({
        token,
        userId: user.id
      });
    }
  } catch (error) {
    console.error("Error in user signin:", error);
    res.status(500).json({ error: "Sign in failed" });
  }
});

export default router;