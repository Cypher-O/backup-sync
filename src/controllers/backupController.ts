import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDataToS3 } from '../services/backupService';
import { addToBackupQueue, getQueueHealth as checkQueueHealth, getQueueStats as fetchQueueStats } from '../queues/backupQueue';
import { BackupData } from '../types/backup';
import { logger } from '../utils/logger';

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf', '.doc', '.docx', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: ' + allowedTypes.join(', ')));
    }
  }
}).single('file');

export const handleFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check queue health before proceeding
    if (!checkQueueHealth()) {
      logger.error('Queue service is not ready');
      res.status(503).json({ 
        error: 'Service temporarily unavailable',
        details: 'Backup service is initializing or experiencing issues'
      });
      return;
    }

    upload(req, res, async (err) => {
      if (err) {
        logger.error('File upload error:', err);
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const backupData: BackupData = {
        type: 'file',
        content: req.file.buffer,
        metadata: {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          uploadedAt: new Date().toISOString()
        }
      };

      try {
        const result = await addToBackupQueue(backupData);
        
        res.status(202).json({
          message: "File upload initiated",
          jobId: result.id,
          metadata: backupData.metadata
        });
      } catch (queueError) {
        logger.error('Queue error:', queueError);
        next(queueError);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleDataBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body.data;
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const backupData: BackupData = {
      type: 'string',
      content: Buffer.from(data),
      metadata: {
        uploadedAt: new Date().toISOString()
      }
    };

    const result = await addToBackupQueue(backupData);

    res.status(202).json({
      message: "Backup initiated",
      jobId: result.id
    });
  } catch (error) {
    next(error);
  }
};


export const handleQueueHealth = (req: Request, res: Response): void => {
  const isHealthy = checkQueueHealth();
  
  if (isHealthy) {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(503).json({
    status: 'unhealthy',
    timestamp: new Date().toISOString(),
    message: 'Queue service is not ready'
  });
};

export const getQueueStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await fetchQueueStats();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      metrics: stats
    });
  } catch (error) {
    next(error);
  }
};