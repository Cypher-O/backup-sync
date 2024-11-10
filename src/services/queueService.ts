// src/services/queueService.ts
import Queue, { Job, QueueOptions } from 'bull';
import { BackupData } from '../types/backup';
import { logger } from '../utils/logger';
import queueConfig from '../config/queueConfig';

export class QueueService {
  private static instance: QueueService;
  private queue: Queue.Queue<BackupData>;
  private isInitialized: boolean = false;

  private constructor() {
    this.queue = new Queue<BackupData>('backupQueue', queueConfig);
    this.setupQueueEventHandlers();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private setupQueueEventHandlers(): void {
    // Queue-level events
    this.queue.on('error', (error) => {
      logger.error('Queue error:', error);
      this.isInitialized = false;
    });

    this.queue.on('waiting', (jobId) => {
      logger.info(`Job ${jobId} is waiting`);
    });

    this.queue.on('active', (job) => {
      logger.info(`Job ${job.id} has started processing`);
    });

    this.queue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} completed. Result:`, result);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed:`, error);
    });

    this.queue.on('stalled', (job) => {
      logger.warn(`Job ${job.id} has stalled`);
    });

    // Redis connection events
    const client = this.queue.client;
    
    client.on('connect', () => {
      logger.info('Redis client connected');
      this.isInitialized = true;
    });

    client.on('error', (error) => {
      logger.error('Redis client error:', error);
      this.isInitialized = false;
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
      this.isInitialized = true;
    });

    client.on('end', () => {
      logger.info('Redis client connection ended');
      this.isInitialized = false;
    });
  }

  public async addToQueue(data: BackupData): Promise<Queue.Job<BackupData>> {
    if (!this.isInitialized) {
      throw new Error('Queue not initialized. Please wait for Redis connection.');
    }

    try {
      const job = await this.queue.add(data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      logger.info(`Added job ${job.id} to queue`);
      return job;
    } catch (error) {
      logger.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  public async processQueue(
    processor: (job: Job<BackupData>) => Promise<any>
  ): Promise<void> {
    this.queue.process(async (job) => {
      try {
        logger.info(`Processing job ${job.id}`);
        return await processor(job);
      } catch (error) {
        logger.error(`Failed to process job ${job.id}:`, error);
        throw error;
      }
    });
  }

  public async getQueueStats() {
    const [
      activeCount,
      completedCount,
      failedCount,
      delayedCount,
      waitingCount
    ] = await Promise.all([
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
      this.queue.getWaitingCount()
    ]);

    return {
      active: activeCount,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
      waiting: waitingCount
    };
  }

  public async close(): Promise<void> {
    await this.queue.close();
    this.isInitialized = false;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getQueue(): Queue.Queue<BackupData> {
    return this.queue;
  }
}

// Export a singleton instance
export const queueService = QueueService.getInstance();
