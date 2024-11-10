import Queue, { Job } from 'bull';
import { uploadDataToS3 } from '../services/backupService';
import { logger } from '../utils/logger';

const backupQueue = new Queue<string>('backupQueue', { redis: { host: 'localhost', port: 6379 } });

backupQueue.process(async (job: Job<string>) => {  // Type the job parameter
  try {
    const result = await uploadDataToS3(Buffer.from(job.data));
    logger.info(`Data uploaded successfully: ${result.Location}`);
  } catch (error) {
    logger.error(`Failed to upload data: ${(error as Error).message}`);
    throw error;
  }
});

export const addToBackupQueue = (data: string) => {
  return backupQueue.add(data);
};
