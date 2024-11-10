// src/config/queueConfig.ts
import { QueueOptions } from 'bull';
import redisConfig from './redisConfig';

export const queueConfig: QueueOptions = {
  redis: redisConfig,
  limiter: {
    max: 1000,
    duration: 5000,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export default queueConfig;