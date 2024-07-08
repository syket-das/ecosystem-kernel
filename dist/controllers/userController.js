"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.LoginOrRegisterUser = void 0;
// @ts-nocheck
const models_1 = require("../models/models");
const response_1 = require("../utils/response");
const jwt_1 = require("../utils/jwt");
const nanoid = __importStar(require("nanoid"));
const LoginOrRegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, authToken, address } = req.body;
    if (!authToken || !address) {
        (0, response_1.sendApiResponse)(res, 400, [], 'Bad Request', ['Missing required fields']);
        return;
    }
    try {
        let user = yield models_1.prisma.user.findUnique({
            where: {
                address: address,
            },
            include: {
                referredBy: true,
                referrals: true,
                points: true,
            },
        });
        let token;
        if (user) {
            token = (0, jwt_1.createToken)(user.id);
            yield models_1.prisma.session.upsert({
                where: { userId: user.id },
                update: { token },
                create: { userId: user.id, token },
            });
            (0, response_1.sendApiResponse)(res, 200, { user, token }, 'User logged in successfully');
            return;
        }
        user = yield models_1.prisma.user.create({
            data: {
                name,
                email,
                auth: authToken,
                address,
                referralCode: nanoid.customAlphabet(10),
            },
            include: {
                referredBy: true,
                referrals: true,
                points: true,
            },
        });
        token = (0, jwt_1.createToken)(user.id);
        yield models_1.prisma.session.create({
            data: { userId: user.id, token },
        });
        (0, response_1.sendApiResponse)(res, 200, { user, token }, 'User created successfully');
    }
    catch (error) {
        console.error(error);
        (0, response_1.sendApiResponse)(res, 500, [], 'Internal Server Error', [
            error.message || 'Unexpected error',
        ]);
    }
});
exports.LoginOrRegisterUser = LoginOrRegisterUser;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.payload;
    if (!userId) {
        (0, response_1.sendApiResponse)(res, 401, [], 'Unauthorized', ['Missing token']);
        return;
    }
    try {
        const user = yield models_1.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                referredBy: true,
                referrals: true,
                points: true,
            },
        });
        if (!user) {
            (0, response_1.sendApiResponse)(res, 404, null, 'User not found');
            return;
        }
        (0, response_1.sendApiResponse)(res, 200, user, 'User retrieved successfully');
    }
    catch (error) {
        console.error(error);
        (0, response_1.sendApiResponse)(res, 500, null, 'Internal Server Error', [
            error.message || 'Unexpected error',
        ]);
    }
});
exports.getProfile = getProfile;
