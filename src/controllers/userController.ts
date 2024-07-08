// @ts-nocheck
import { prisma } from '../models/models';
import { Request, Response } from 'express';
import { sendApiResponse } from '../utils/response';
import { AuthType, User } from '@prisma/client';
import { createToken } from '../utils/jwt';
import { nanoid } from 'nanoid';
interface CreateUserRequest {
  email: User['email'];
  name: User['name'];
  authToken: AuthType;
  address: User['address'];
}

export const LoginOrRegisterUser = async (req: Request, res: Response) => {
  const { name, email, authToken, address } = req.body as CreateUserRequest;

  if (!authToken || !address) {
    sendApiResponse(res, 400, [], 'Bad Request', ['Missing required fields']);
    return;
  }

  try {
    let user = await prisma.user.findUnique({
      where: {
        address: address,
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
        points: true,
      },
    });

    token = createToken(user.id);
    await prisma.session.create({
      data: { userId: user.id, token },
    });

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
        referrals: true,
        points: true,
      },
    });

    if (!user) {
      sendApiResponse(res, 404, null, 'User not found');
      return;
    }

    sendApiResponse(res, 200, user, 'User retrieved successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, null, 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};
