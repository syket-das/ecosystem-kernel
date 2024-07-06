import { prisma, Role } from '../models/models';
import { Request, Response } from 'express';
import { sendApiResponse } from '../utils/response';
import { AuthType, User } from '@prisma/client';

interface CreateUserRequest {
  email: User['email'];
  name: User['name'];
  authToken: AuthType;
  address: User['address'];
}

export const LoginOrRegisterUser = async (req: Request, res: Response) => {
  const { name, email, authToken, address } = req.body as CreateUserRequest;

  try {
    let user = await prisma.user.findUnique({
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
      sendApiResponse(res, 200, user, 'User logged in successfully');
      return;
    }

    user = await prisma.user.create({
      data: {
        name,
        email,
        auth: authToken,
        role: Role.USER,
        address,
        points: {
          create: {
            points: 0,
            alltimePoints: 0,
          },
        },
      },

      include: {
        referredBy: true,
        referrals: true,
        points: true, // Including the Points relation
      },
    });

    sendApiResponse(res, 200, user, 'User created successfully');
  } catch (error: any) {
    console.error(error);
    sendApiResponse(res, 500, [], 'Internal Server Error', [
      error.message || 'Unexpected error',
    ]);
  }
};
