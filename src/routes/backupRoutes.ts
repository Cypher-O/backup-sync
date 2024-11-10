import express from 'express';
import { handleFileUpload, handleDataBackup } from '../controllers/backupController';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/backup/file', rateLimiter, handleFileUpload);
// router.post('/backup/data', rateLimiter, handleDataBackup);

export default router;