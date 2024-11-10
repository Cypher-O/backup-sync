import AWS from 'aws-sdk';
import appConfig from '../config/appConfig';
import { logger } from '../utils/logger';

AWS.config.update({
  accessKeyId: appConfig.aws.accessKeyId,
  secretAccessKey: appConfig.aws.secretAccessKey,
  region: appConfig.aws.region,
});

const s3 = new AWS.S3();

export const uploadDataToS3 = async (data: Buffer): Promise<AWS.S3.ManagedUpload.SendData> => {
  try {
    const params = {
      Bucket: appConfig.aws.bucketName,
      Key: `backup/${Date.now()}.json`,
      Body: JSON.stringify(data),
    };

    logger.info(`Starting data upload to S3 bucket: ${appConfig.aws.bucketName}`);
    const result = await s3.upload(params).promise();
    logger.info(`Data upload successful: ${result.Location}`);
    
    return result;
  } catch (error) {
    // Ensure error is typed correctly to access `message`
    if (error instanceof Error) {
      logger.error(`S3 Upload Error: ${error.message}`);
    } else {
      logger.error(`S3 Upload Error: Unknown error occurred`);
    }
    throw new Error('Failed to upload data to S3. Please try again later.');
  }
};
