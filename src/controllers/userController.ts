// @ts-nocheck
import { prisma } from '../models/models';
import { Request, Response } from 'express';
import { sendApiResponse } from '../utils/response';
import { AuthType, User } from '@prisma/client';
import { createToken } from '../utils/jwt';
import { nanoid } from 'nanoid';
import { logUserActivity } from '../utils/activityLogger';
interface CreateUserRequest {
  email: User['email'];
  name: User['name'];
  authToken: AuthType;
  address: User['address'];
}

export const LoginOrRegisterUser = async (req: Request, res: Response) => {
  const { name, email, authToken, address } = req.body as CreateUserRequest;

  if (!authToken) {
    sendApiResponse(res, 400, [], 'Bad Request', ['Missing required fields']);
    return;
  }

  try {
    let user = await prisma.user.findUnique({
      where: {
        address: authToken.address,
      },
      include: {
        referredBy: true,
        referrals: true,
        points: true,
      },
    });

    let token: string;
    if (user) {
      token = createToken(user.id);
      await prisma.session.upsert({
        where: { userId: user.id },
        update: { token },
        create: { userId: user.id, token },
      });
      await logUserActivity(user.id, 'Logged in');
      sendApiResponse(res, 200, { user, token }, 'User logged in successfully');
      return;
    }

    user = await prisma.user.create({
      data: {
        name,
        email,
        auth: authToken,
        address,
        referralCode: nanoid(10),
      },
      include: {
        referredBy: true,
        referrals: true,
      },
    });

    const point = await prisma.points.create({
      data: {
        userId: user.id,
        points: 0,
        alltimePoints: 0,
        decreaseAmount: 1,
        increaseAmount: 1,
        maxLifeline: 1000,
        regenInterval: 60,
      },
    });

    token = createToken(user.id);

    await prisma.session.create({
      data: { userId: user.id, token },
    });
    await logUserActivity(user.id, 'Registered');
    sendApiResponse(res, 200, { user, token }, 'User created successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, [], 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const { userId } = req.payload;

  if (!userId) {
    sendApiResponse(res, 401, [], 'Unauthorized', ['Missing token']);
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        referredBy: true,
        referrals: {
          include: {
            referredUser: {
              include: {
                points: true,
                referrals: true,
              },
            },
          },
        },
        points: true,
      },
    });

    if (!user) {
      sendApiResponse(res, 404, null, 'User not found');
      return;
    }
    await logUserActivity(userId, 'Viewed profile');
    sendApiResponse(res, 200, user, 'User retrieved successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, null, 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        points: true,
      },
    });

    console.log(users);

    if (!users) {
      sendApiResponse(res, 404, null, 'users not found');
      return;
    }
    sendApiResponse(res, 200, users, 'users retrieved successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, null, 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};
