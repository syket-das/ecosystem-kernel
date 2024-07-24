import express from 'express';
import { authenticateToken } from '../utils/jwt';
import * as userController from '../controllers/userController';
import * as referralController from '../controllers/referralController';
import * as pointsController from '../controllers/pointsController';
import * as statsController from '../controllers/statsController';

const router = express.Router();

// Users
router.post('/v1/users', userController.LoginOrRegisterUser);
router.get('/v1/users/all', userController.getAllUsers);

router.get('/v1/users/profile', authenticateToken, userController.getProfile);

// Referrals

router.get('/v1/referrals', referralController.getAllReferrals);
router.post(
  '/v1/referrals',
  authenticateToken,
  referralController.createReferral
);

// Points
router.get('/v1/points/:userId', pointsController.getUserPoints);
router.put('/v1/points', authenticateToken, pointsController.increasePoints);

// game stats

router.get('/v1/stats', authenticateToken, statsController.getGameStats);

export default router;
