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
exports.getPoints = getPoints;
exports.updatePoints = updatePoints;
exports.getUserPoints = getUserPoints;
const models_1 = require("../models/models");
const response_1 = require("../utils/response");
function getPoints(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const points = yield models_1.prisma.points.findMany();
        (0, response_1.sendApiResponse)(res, 200, points, 'points retrieved successfully');
    });
}
function updatePoints(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, points, verifiedForBossMode, verifiedForLudoMode, regenInterval, decreaseAmount, increaseAmount, maxLifeline, } = req.body;
        try {
            const userPoints = yield models_1.prisma.points.findUnique({
                where: {
                    id,
                },
            });
            if (!userPoints) {
                (0, response_1.sendApiResponse)(res, 404, null, 'Points not found');
                return;
            }
            const updatedPoints = yield models_1.prisma.points.update({
                where: {
                    id,
                },
                data: {
                    points,
                    alltimePoints: userPoints.alltimePoints + points,
                },
            });
            (0, response_1.sendApiResponse)(res, 200, updatedPoints, 'points updated successfully');
        }
        catch (error) {
            console.error(error);
            (0, response_1.sendApiResponse)(res, 500, null, 'Internal Server Error', [
                error.message || 'Unexpected error',
            ]);
        }
    });
}
function getUserPoints(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        try {
            const userPoints = yield models_1.prisma.points.findUnique({
                where: {
                    userId,
                },
            });
            if (!userPoints) {
                (0, response_1.sendApiResponse)(res, 404, null, 'Points not found');
                return;
            }
            (0, response_1.sendApiResponse)(res, 200, userPoints, 'points retrieved successfully');
        }
        catch (error) {
            console.error(error);
            (0, response_1.sendApiResponse)(res, 500, null, 'Internal Server Error', [
                error.message || 'Unexpected error',
            ]);
        }
    });
}
