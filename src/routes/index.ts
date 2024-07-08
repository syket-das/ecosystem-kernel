import express from 'express';
import * as userController from '../controllers/userController';
import * as referralController from '../controllers/referralController';
import * as pointsController from '../controllers/pointsController';
import { authenticateToken } from '../utils/jwt';

const router = express.Router();

// Users
router.post('/v1/users', userController.LoginOrRegisterUser);
router.get('/v1/users/profile', authenticateToken, userController.getProfile);

// Referrals

router.get('/v1/referrals', referralController.getAllReferrals);
router.post('/v1/referrals', referralController.createReferral);

// Points
router.get('/v1/points/:userId', pointsController.getUserPoints);
router.put('/v1/points', pointsController.updatePoints);

export default router;
