import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private readonly bucketName = 'lefer-saas-bucket'; // Local bucket for dev
  private readonly endPoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';

  constructor() {
    this.s3Client = new S3Client({
      endpoint: this.endPoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || 'admin',
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'password',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async uploadFile(filename: string, buffer: Buffer, mimetype: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      
      // Return public URL
      return `${this.endPoint}/${this.bucketName}/${filename}`;
    } catch (error) {
      this.logger.error(`Error uploading file ${filename} to MinIO`, error);
      throw new Error('Failed to upload file');
    }
  }
}
