import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadDataToS3 = async (data: Buffer) => {
  // Ensure Bucket is a string and not undefined
  const bucketName = process.env.AWS_S3_BUCKET_NAME as string;
  
  if (!bucketName) {
    throw new Error("Bucket name is not defined. Please set AWS_S3_BUCKET_NAME in environment variables.");
  }

  const params = {
    Bucket: bucketName,
    Key: `backup/${Date.now()}.json`,
    Body: JSON.stringify(data),
  };

  return await s3.upload(params).promise();
};
