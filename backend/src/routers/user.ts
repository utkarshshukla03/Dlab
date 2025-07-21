import { Router } from 'express';
import jwt from 'jsonwebtoken';
// import { Prisma, PrismaClient } from '../generated/prisma';
import { Prisma, PrismaClient } from "../generated/prisma";
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {JWT_SECRET} from '..';
import { authMiddleware } from './middleware';

const s3Client = new S3Client()

const router = Router();
const prismaClient = new PrismaClient();




router.get("/presignedUrl", authMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    const command = new PutObjectCommand({
      Bucket: "utkarsh-cms",
      Key: `uploads/${userId}/${Date.now()}`, // Add a proper key
      ContentType: "image/jpeg" // Add content type as needed
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Don't return this - just call it
    res.json({ presignedUrl });
    
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    // Don't return this either
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});
// signin with wallet 
// signing message
router.post("/signin",  async(req, res)=>{
// todo: handle user signin with wallet

   const hardcodeWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";

   const existinguser= await prismaClient.user.findFirst({
    where: {
      address: hardcodeWalletAddress
    }
   })
   if(existinguser){
    const token= jwt.sign({
    userId:existinguser.id,
   }, JWT_SECRET)
   res.json({
    token
   })
   }else{
    const user = await prismaClient.user.create({
        data:{
            address: hardcodeWalletAddress,
        }
    })
    const token = jwt.sign({
        userId: user.id,
      }, JWT_SECRET)
      res.json({
        token
      })
   }
   
});

export default router;