"use strict";
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
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        (0, response_1.sendApiResponse)(res, 401, [], 'Unauthorized', ['Missing token']);
        return;
    }
    try {
        const decoded = (0, exports.verifyToken)(token);
        req.payload = decoded;
        const sessionExist = yield models_1.prisma.session.findUnique({
            where: { userId: decoded.userId },
        });
        if (!sessionExist) {
            (0, response_1.sendApiResponse)(res, 403, [], 'Forbidden', [
                'Invalid token. Please login again.',
            ]);
            return;
        }
        next();
    }
    catch (error) {
        (0, response_1.sendApiResponse)(res, 403, [], 'Forbidden', ['Invalid token']);
        return;
    }
};
exports.authenticateToken = authenticateToken;
