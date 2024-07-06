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
exports.LoginOrRegisterUser = void 0;
const models_1 = require("../models/models");
const response_1 = require("../utils/response");
const LoginOrRegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, authToken, address } = req.body;
    try {
        let user = yield models_1.prisma.user.findUnique({
            where: {
                address: address,
            },
            include: {
                referredBy: true,
                referrals: true,
                points: true, // Including the Points relation
            },
        });
        if (user) {
            (0, response_1.sendApiResponse)(res, 200, user, 'User logged in successfully');
            return;
        }
        // Create points entry for new user
        const points = yield models_1.prisma.points.create({
            data: {
                userId: '', // Temporarily set to empty, will update after user creation
                points: 0,
                alltimePoints: 0,
                maxLifeline: 100,
                decreaseAmount: 1,
                increaseAmount: 1,
                regenInterval: 1000,
                verifiedForBossMode: false,
                verifiedForLudoMode: false,
            },
        });
        user = yield models_1.prisma.user.create({
            data: {
                name,
                email,
                auth: authToken,
                role: models_1.Role.USER,
                address,
                pointsId: points.id, // Set the pointsId in user creation
            },
            include: {
                referredBy: true,
                referrals: true,
                points: true, // Including the Points relation
            },
        });
        // Update the userId in points table
        yield models_1.prisma.points.update({
            where: { id: points.id },
            data: { userId: user.id },
        });
        (0, response_1.sendApiResponse)(res, 200, user, 'User created successfully');
    }
    catch (error) {
        console.error(error);
        (0, response_1.sendApiResponse)(res, 500, [], 'Internal Server Error', [
            error.message || 'Unexpected error',
        ]);
    }
});
exports.LoginOrRegisterUser = LoginOrRegisterUser;
