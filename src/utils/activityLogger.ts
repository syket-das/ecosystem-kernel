import { prisma } from '../models/models';

export const logUserActivity = async (userId: string, activity: string) => {
  await prisma.userActivity.create({
    data: {
      userId,
      activity,
    },
  });
};
