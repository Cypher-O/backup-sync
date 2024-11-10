import dotenv from 'dotenv';

dotenv.config();

const appConfig = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || '',
    bucketName: process.env.AWS_S3_BUCKET_NAME || '',
  },
};

if (!appConfig.aws.bucketName) {
  throw new Error("AWS_S3_BUCKET_NAME is required in environment variables.");
}

export default appConfig;
