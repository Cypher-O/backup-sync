import express from 'express';
import type { Express } from 'express';
import app from './app';
import { closeQueue } from './queues/backupQueue';
import { logger } from './utils/logger';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server: Express = app;

const gracefulShutdown = async () => {
  logger.info('Received shutdown signal. Closing connections...');
  
  try {
    await closeQueue();
    logger.info('Queue connections closed.');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
