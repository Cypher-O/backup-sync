// import express from 'express';
// import { handleFileUpload, handleDataBackup } from '../controllers/backupController';
// import { rateLimiter } from '../middlewares/rateLimiter';

// const router = express.Router();

// router.post('/backup/file', rateLimiter, handleFileUpload);
// // router.post('/backup/data', rateLimiter, handleDataBackup);

// export default router;

// src/routes/backupRoutes.ts
import express from 'express';
import { handleFileUpload, handleQueueHealth, getQueueStats } from '../controllers/backupController';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// Backup endpoints
router.post('/backup/file', rateLimiter, handleFileUpload);

// Health check endpoints
router.get('/health', handleQueueHealth);
router.get('/stats', getQueueStats);

export default router;