import { prisma, Role } from '../models/models';
import { Request, Response } from 'express';
import { sendApiResponse } from '../utils/response';

const getCurrentActiveUsers = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const activeUsers = await prisma.userActivity.findMany({
    where: {
      timestamp: {
        gte: tenMinutesAgo,
      },
    },
    distinct: ['userId'],
  });

  return activeUsers.map((activity) => activity.userId);
};

const getDailyActiveUsers = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const dailyActiveUsers = await prisma.userActivity.findMany({
    where: {
      timestamp: {
        gte: oneDayAgo,
      },
    },
    distinct: ['userId'],
  });

  return dailyActiveUsers.map((activity) => activity.userId);
};

export async function getGameStats(req: Request, res: Response) {
  try {
    const users = await prisma.user.count();
    const activeUsers = await getCurrentActiveUsers();
    const dailyActiveUsers = await getDailyActiveUsers();

    sendApiResponse(
      res,
      200,
      {
        users,
        activeUsers: activeUsers.length,
        dailyActiveUsers: dailyActiveUsers.length,
      },
      'Game stats retrieved successfully'
    );
  } catch (error: any) {
    sendApiResponse(res, 500, [], 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
}
