"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
// creating simple express server
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routers/user"));
const worker_1 = __importDefault(require("./routers/worker"));
const app = (0, express_1.default)();
exports.JWT_SECRET = "Utkarsh123;";
app.use("/v1/user", user_1.default);
app.use("/v1/worker", worker_1.default);
//postgres + prism=> ORM
// string of credentials users : postgresql://neondb_owner:npg_0WpzXkvlVI9D@ep-calm-breeze-a4q4ixtu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
app.listen(3000);
