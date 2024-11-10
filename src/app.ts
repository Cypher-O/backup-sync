import express from 'express';
import { config } from 'dotenv';
import backupRoutes from './routes/backupRoutes';
import { errorHandler } from './middlewares/errorHandler';

config(); // Load environment variables

const app = express();

app.use(express.json());

// Apply routes and middlewares
app.use('/api/backup', backupRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
