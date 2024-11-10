import Queue, { Job } from 'bull';
import { uploadDataToS3 } from '../services/backupService';
import { logger } from '../utils/logger';
import { BackupData } from '../types/backup';

const backupQueue = new Queue<BackupData>('backupQueue', { 
  redis: { host: 'localhost', port: 6379 } 
});

backupQueue.process(async (job: Job<BackupData>) => { 
  try {
    const result = await uploadDataToS3(
      job.data.content,
      job.data.metadata
    );
    logger.info(`Data uploaded successfully: ${result.Location}`);
  } catch (error) {
    logger.error(`Failed to upload data: ${(error as Error).message}`);
    throw error;
  }
});

export const addToBackupQueue = (data: BackupData) => {
  return backupQueue.add(data);
};
