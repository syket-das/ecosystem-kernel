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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReferral = exports.getAllReferrals = void 0;
const models_1 = require("../models/models");
const response_1 = require("../utils/response");
const getAllReferrals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referrals = yield models_1.prisma.referral.findMany();
        (0, response_1.sendApiResponse)(res, 200, referrals, 'referrals retrieved successfully');
    }
    catch (error) {
        console.error(error);
        (0, response_1.sendApiResponse)(res, 500, [], 'Internal Server Error', [
            error.message || 'Unexpected error',
        ]);
    }
});
exports.getAllReferrals = getAllReferrals;
const createReferral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, referCode } = req.body;
    try {
        const user = yield models_1.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            (0, response_1.sendApiResponse)(res, 404, null, 'User not found');
            return;
        }
        const referredBy = yield models_1.prisma.user.findUnique({
            where: {
                referralCode: referCode,
            },
        });
        if (!referredBy) {
            (0, response_1.sendApiResponse)(res, 404, null, 'Referral code not found');
            return;
        }
        const referral = yield models_1.prisma.referral.create({
            data: {
                userId: referredBy.id,
                referredUserId: user.id,
            },
        });
        (0, response_1.sendApiResponse)(res, 200, referral, 'Referral created successfully');
    }
    catch (error) {
        console.error(error);
        (0, response_1.sendApiResponse)(res, 500, null, 'Internal Server Error', [
            error.message || 'Unexpected error',
        ]);
    }
});
exports.createReferral = createReferral;
