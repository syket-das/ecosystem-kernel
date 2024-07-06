import { prisma, Role } from '../models/models';
import { Request, Response } from 'express';
import { sendApiResponse } from '../utils/response';

export const getAllReferrals = async (req: Request, res: Response) => {
  try {
    const referrals = await prisma.referral.findMany();
    sendApiResponse(res, 200, referrals, 'referrals retrieved successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, [], 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};

export const createReferral = async (req: Request, res: Response) => {
  const { userId, referCode } = req.body as any;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      sendApiResponse(res, 404, null, 'User not found');
      return;
    }

    const referredBy = await prisma.user.findUnique({
      where: {
        referralCode: referCode,
      },
    });

    if (!referredBy) {
      sendApiResponse(res, 404, null, 'Referral code not found');
      return;
    }

    const referral = await prisma.referral.create({
      data: {
        userId: referredBy.id,
        referredUserId: user.id,
      },
    });
    sendApiResponse(res, 200, referral, 'Referral created successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, null, 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};
