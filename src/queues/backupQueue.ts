// src/queues/backupQueue.ts
import { uploadDataToS3 } from '../services/backupService';
import { logger } from '../utils/logger';
import { BackupData } from '../types/backup';
import { queueService } from '../services/queueService';

// Initialize queue processing
queueService.processQueue(async (job) => {
  try {
    const result = await uploadDataToS3(
      job.data.content,
      job.data.metadata
    );

    // Add success metadata
    const successMetadata = {
      ...job.data.metadata,
      processedAt: new Date().toISOString(),
      status: 'completed'
    };

    logger.info(`Backup completed for job ${job.id}`);
    return { ...result, metadata: successMetadata };
  } catch (error) {
    logger.error(`Backup failed for job ${job.id}:`, error);
    throw error;
  }
});

// Export the queue service methods
export const addToBackupQueue = (data: BackupData) => queueService.addToQueue(data);
export const getQueueHealth = () => queueService.isReady();
export const getQueueStats = () => queueService.getQueueStats();
export const closeQueue = () => queueService.close();

// import Queue, { Job } from 'bull';
// import { uploadDataToS3 } from '../services/backupService';
// import { logger } from '../utils/logger';
// import { BackupData } from '../types/backup';

// const backupQueue = new Queue<BackupData>('backupQueue', { 
//   redis: { host: 'localhost', port: 6379 } 
// });

// backupQueue.process(async (job: Job<BackupData>) => { 
//   try {
//     const result = await uploadDataToS3(
//       job.data.content,
//       job.data.metadata
//     );
//     logger.info(`Data uploaded successfully: ${result.Location}`);
//   } catch (error) {
//     logger.error(`Failed to upload data: ${(error as Error).message}`);
//     throw error;
//   }
// });

// export const addToBackupQueue = (data: BackupData) => {
//   return backupQueue.add(data);
// };
