import { Request, Response, NextFunction } from 'express';
import * as backupService from '../services/backupService';

export const backupData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = req.body;
    const result = await backupService.uploadDataToS3(data);
    res.status(200).json({ message: 'Data backed up successfully', result });
  } catch (error) {
    next(error);
  }
};
