// src/config/redisConfig.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: true,
};

export default redisConfig;

// // src/config/redisConfig.ts
// import * as dotenv from 'dotenv';

// dotenv.config();

// interface RedisConfig {
//   host: string;
//   port: number;
//   password?: string;
//   username?: string;
//   tls?: boolean;
//   maxRetriesPerRequest: number | null;
//   retryStrategy: (times: number) => number | null;
//   enableReadyCheck: boolean;
// }

// const redisConfig: RedisConfig = {
//   host: process.env.REDIS_HOST || 'localhost',
//   port: parseInt(process.env.REDIS_PORT || '6379'),
//   maxRetriesPerRequest: null, // Disable retry limit
//   retryStrategy: (times: number) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   },
//   enableReadyCheck: true,
// };

// // // Add optional configurations if provided
// // if (process.env.REDIS_PASSWORD) {
// //   redisConfig.password = process.env.REDIS_PASSWORD;
// // }

// // if (process.env.REDIS_USERNAME) {
// //   redisConfig.username = process.env.REDIS_USERNAME;
// // }

// // if (process.env.REDIS_TLS === 'true') {
// //   redisConfig.tls = true;
// // }

// export default redisConfig;