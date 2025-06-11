"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../generated/prisma");
const JWT_SECRET = "Utkarsh123;";
const router = (0, express_1.Router)();
const prismaClient = new prisma_1.PrismaClient();
// signin with wallet 
// signing message
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // todo: handle user signin with wallet
    const hardcodeWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const existinguser = yield prismaClient.user.findFirst({
        where: {
            address: hardcodeWalletAddress
        }
    });
    if (existinguser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existinguser.id,
        }, JWT_SECRET);
        res.json({
            token
        });
    }
    else {
        const user = yield prismaClient.user.create({
            data: {
                address: hardcodeWalletAddress,
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, JWT_SECRET);
        res.json({
            token
        });
    }
}));
exports.default = router;
