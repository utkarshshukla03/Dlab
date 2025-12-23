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
const client_1 = require("@prisma/client");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const __1 = require("..");
const middleware_1 = require("./middleware");
const s3Client = new client_s3_1.S3Client();
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
router.get("/presignedUrl", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: "utkarsh-cms",
        Key: `/pro/${userId}`
    });
    const preSignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
        expiresIn: 3600 // 1 hour
    });
}));
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
        }, __1.JWT_SECRET);
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
        }, __1.JWT_SECRET);
        res.json({
            token
        });
    }
}));
exports.default = router;
