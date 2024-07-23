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
exports.getGameStats = getGameStats;
const models_1 = require("../models/models");
const response_1 = require("../utils/response");
const getCurrentActiveUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const activeUsers = yield models_1.prisma.userActivity.findMany({
        where: {
            timestamp: {
                gte: tenMinutesAgo,
            },
        },
        distinct: ['userId'],
    });
    return activeUsers.map((activity) => activity.userId);
});
const getDailyActiveUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyActiveUsers = yield models_1.prisma.userActivity.findMany({
        where: {
            timestamp: {
                gte: oneDayAgo,
            },
        },
        distinct: ['userId'],
    });
    return dailyActiveUsers.map((activity) => activity.userId);
});
function getGameStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield models_1.prisma.user.count();
            const activeUsers = yield getCurrentActiveUsers();
            const dailyActiveUsers = yield getDailyActiveUsers();
            (0, response_1.sendApiResponse)(res, 200, {
                users,
                activeUsers: activeUsers.length,
                dailyActiveUsers: dailyActiveUsers.length,
            }, 'Game stats retrieved successfully');
        }
        catch (error) {
            (0, response_1.sendApiResponse)(res, 500, [], 'Internal Server Error', [
                error.message || 'Unexpected error',
            ]);
        }
    });
}
