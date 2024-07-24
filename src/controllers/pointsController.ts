import { prisma, Role } from '../models/models';
import { Request, Response } from 'express';
import { sendApiResponse } from '../utils/response';
import { Points } from '@prisma/client';

export async function getPoints(req: Request, res: Response) {
  const points = await prisma.points.findMany();
  sendApiResponse(res, 200, points, 'points retrieved successfully');
}

export async function increasePoints(req: any, res: Response) {
  const { userId } = req.payload;

  const {
    points,
    verifiedForBossMode,
    verifiedForLudoMode,
    regenInterval,
    decreaseAmount,
    increaseAmount,
    maxLifeline,
  } = req.body as Points;

  try {
    const userPoints = await prisma.points.findUnique({
      where: {
        userId,
      },
    });

    if (!userPoints) {
      sendApiResponse(res, 404, null, 'Points not found');
      return;
    }

    const updatedPoints = await prisma.points.update({
      where: {
        id: userPoints.id,
      },
      data: {
        points,
        alltimePoints: points,
      },
    });
    sendApiResponse(res, 200, updatedPoints, 'points updated successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, null, 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
}

export async function getUserPoints(req: Request, res: Response) {
  const { userId } = req.params;

  try {
    const userPoints = await prisma.points.findUnique({
      where: {
        userId,
      },
    });

    if (!userPoints) {
      sendApiResponse(res, 404, null, 'Points not found');
      return;
    }

    sendApiResponse(res, 200, userPoints, 'points retrieved successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, null, 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
}
