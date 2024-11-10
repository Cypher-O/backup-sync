import { PutObjectCommand, S3Client, ServerSideEncryption } from '@aws-sdk/client-s3';
import appConfig from '../config/appConfig';
import { logger } from '../utils/logger';

// Initialize S3 client
const s3 = new S3Client({
  region: appConfig.aws.region,
  credentials: {
    accessKeyId: appConfig.aws.accessKeyId,
    secretAccessKey: appConfig.aws.secretAccessKey,
  },
});

export const uploadDataToS3 = async (
  data: Buffer,
  metadata: { [key: string]: any }
) => {
  const filename = metadata.filename || `backup-${Date.now()}.txt`;
  const key = `backup/${Date.now()}-${filename}`;
  
  const params = {
    Bucket: appConfig.aws.bucketName,
    Key: key,
    Body: metadata.mimetype ? data : data.toString(),
    ServerSideEncryption: ServerSideEncryption.AES256,  // Use the enum instead of a string
    Metadata: {
      ...Object.entries(metadata).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {})
    },
    ContentType: metadata.mimetype || 'text/plain'
  };

  const command = new PutObjectCommand(params);
  
  try {
    const result = await s3.send(command);
    
    // Since AWS SDK v3 does not return the Location directly, we can manually build the URL using the Bucket name and Key
    const fileUrl = `https://${appConfig.aws.bucketName}.s3.${appConfig.aws.region}.amazonaws.com/${key}`;
    logger.info(`Data uploaded successfully: ${fileUrl}`);
    return { Key: key, fileUrl };  // Return the key and URL so that the caller can use it
  } catch (error) {
    logger.error(`Failed to upload data: ${(error as Error).message}`);
    throw error;
  }
};
