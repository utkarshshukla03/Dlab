// creating simple express server
import express from 'express';
import userRouter from './routers/user';
import workerRouter from './routers/worker';
const app=express();


export const JWT_SECRET ="Utkarsh123;"
app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);
//postgres + prism=> ORM
// string of credentials users : postgresql://neondb_owner:npg_0WpzXkvlVI9D@ep-calm-breeze-a4q4ixtu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
app.listen(3000)