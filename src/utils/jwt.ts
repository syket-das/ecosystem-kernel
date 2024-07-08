// @ts-nocheck
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { sendApiResponse } from './response';
import { prisma } from '../models/models';

const SECRET_KEY = process.env.SECRET_KEY as string;

export const createToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY) as { userId: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    sendApiResponse(res, 401, [], 'Unauthorized', ['Missing token']);
    return;
  }

  try {
    const decoded = verifyToken(token);
    const sessionExist = await prisma.session.findFirst({
      where: {
        token: token,
      },
    });

    if (!sessionExist) {
      sendApiResponse(res, 403, [], 'Forbidden', [
        'Invalid token. Please login again.',
      ]);
      return;
    }

    req.payload = decoded;
    next();
  } catch (error) {
    sendApiResponse(res, 403, [], 'Forbidden', ['Invalid token']);
    return;
  }
};
