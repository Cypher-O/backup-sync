import express from 'express';
import { handleBackup } from '../controllers/backupController';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/backup', rateLimiter, handleBackup);

export default router;
