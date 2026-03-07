import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

export const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  const ext = path.extname(file.originalname) || '.bin';
  const key = `${folder}/${uuidv4()}${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));
  return key;
};

export const deleteFromS3 = async (storageKey: string): Promise<void> => {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storageKey }));
};

export const getSignedUrl = async (storageKey: string): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: storageKey });
  return awsGetSignedUrl(s3, command, { expiresIn: 3600 });
};
