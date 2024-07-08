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
exports.authenticateToken = exports.verifyToken = exports.createToken = void 0;
// @ts-nocheck
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("./response");
const models_1 = require("../models/models");
const SECRET_KEY = process.env.SECRET_KEY;
const createToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};
exports.createToken = createToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        (0, response_1.sendApiResponse)(res, 401, [], 'Unauthorized', ['Missing token']);
        return;
    }
    try {
        const decoded = (0, exports.verifyToken)(token);
        const sessionExist = yield models_1.prisma.session.findFirst({
            where: {
                token: token,
            },
        });
        if (!sessionExist) {
            (0, response_1.sendApiResponse)(res, 403, [], 'Forbidden', [
                'Invalid token. Please login again.',
            ]);
            return;
        }
        req.payload = decoded;
        next();
    }
    catch (error) {
        (0, response_1.sendApiResponse)(res, 403, [], 'Forbidden', ['Invalid token']);
        return;
    }
});
exports.authenticateToken = authenticateToken;
