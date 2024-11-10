import express from 'express';
import { backupData } from '../controllers/backupController';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/sync', rateLimiter, backupData);

export default router;
