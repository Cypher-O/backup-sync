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
  const params = {
    Bucket: appConfig.aws.bucketName,
    Key: `backup/${Date.now()}.json`,
    Body: JSON.stringify(data),
    ServerSideEncryption: "AES256",
  };

  return await s3.upload(params).promise();
};
