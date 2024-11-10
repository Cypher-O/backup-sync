// src/controllers/backupController.ts
import { Request, Response, NextFunction } from 'express';
import { uploadDataToS3 } from '../services/backupService';
import { dataSchema } from '../validators/backupValidator';
import { addToBackupQueue } from '../queues/backupQueue';

export const handleBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    dataSchema.parse(req.body);  // Validate data

    const result = await addToBackupQueue(req.body.data);
    res.status(202).json({ message: "Backup initiated", jobId: result.id });
  } catch (error) {
    next(error);
  }
};
