import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import backupRoutes from './routes/backupRoutes';
import { logger } from './utils/logger';

const app: Express = express();

app.use(express.json());
app.use('/api', backupRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(500).json({ error: "An unexpected error occurred" });
});

export default app;