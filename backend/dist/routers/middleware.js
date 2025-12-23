"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("..");
function authMiddleware(req, res, next) {
    var _a;
    const authHeader = (_a = req.headers['authorization']) !== null && _a !== void 0 ? _a : "";
    try {
        const decode = jsonwebtoken_1.default.verify(authHeader, __1.JWT_SECRET);
        if (decode.userId) {
            req.userId = decode.userId;
            next();
        }
        else {
            res.status(403).json({
                message: "You are not logged in"
            });
        }
    }
    catch (e) {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
}
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
