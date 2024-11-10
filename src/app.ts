import express, { Request, Response, NextFunction } from 'express';
import backupRoutes from './routes/backupRoutes';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());
app.use('/api', backupRoutes);

// Error handler with type imports
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const error = err as Error;  // Cast to Error to access .message
  logger.error(error.message);
  res.status(500).json({ error: "An unexpected error occurred" });
});

export default app;
