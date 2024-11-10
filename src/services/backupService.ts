import AWS from 'aws-sdk';
import appConfig from '../config/appConfig';
import { logger } from '../utils/logger';

AWS.config.update({
  accessKeyId: appConfig.aws.accessKeyId,
  secretAccessKey: appConfig.aws.secretAccessKey,
  region: appConfig.aws.region,
});

const s3 = new AWS.S3();

export const uploadDataToS3 = async (
  data: Buffer,
  metadata: { [key: string]: any }
): Promise<AWS.S3.ManagedUpload.SendData> => {
  const filename = metadata.filename || `backup-${Date.now()}.txt`;
  const key = `backup/${Date.now()}-${filename}`;
  
  const params = {
    Bucket: appConfig.aws.bucketName,
    Key: key,
    Body: metadata.mimetype ? data : data.toString(),
    ServerSideEncryption: "AES256",
    Metadata: {
      ...Object.entries(metadata).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {})
    },
    ContentType: metadata.mimetype || 'text/plain'
  };

  return await s3.upload(params).promise();
};
