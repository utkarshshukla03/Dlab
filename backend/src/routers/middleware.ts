// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import {JWT_SECRET} from '..';
// export function authMiddleware(req: Request, res: Response, next: NextFunction){
//     const authHeader = req.headers['authorization']?? "";
//   try{
//       const decode = jwt.verify(authHeader, JWT_SECRET);
//         // @ts-ignore
//       if(decode.userId){
//         // @ts-ignore
//         req.userId = decode.userId;
//         return next();
//       }else{
//         return res.status(403).json({
//           message: "You are not logged in"
//         })
//       }
//   }catch(e){
//     return res.status(403).json({
//     message: "You are not logged in"
//     })
//   }
// }
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from '..';

// Extend Express Request interface to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

interface JWTPayload {
    userId: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'] ?? "";
    
    try {
        const decode = jwt.verify(authHeader, JWT_SECRET) as JWTPayload;
        
        if (decode.userId) {
            req.userId = decode.userId;
            next();
        } else {
            res.status(403).json({
                message: "You are not logged in"
            });
        }
    } catch (e) {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
}