import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDataToS3 } from '../services/backupService';
import { addToBackupQueue } from '../queues/backupQueue';
import { BackupData } from '../types/backup';

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

export const handleFileUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
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

      // Add to backup queue with metadata
      const result = await addToBackupQueue(backupData);

      res.status(202).json({
        message: "File upload initiated",
        jobId: result.id,
        metadata: backupData.metadata
      });
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
