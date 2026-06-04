import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private readonly bucketName = process.env.S3_BUCKET || 'lefer-saas-bucket';
  private readonly endPoint = process.env.S3_ENDPOINT || 'http://localhost:9000';

  constructor() {
    this.s3Client = new S3Client({
      endpoint: this.endPoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'admin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'password',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket '${this.bucketName}' já existe.`);
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404 || error.name === 'NotFound') {
        this.logger.log(`Bucket '${this.bucketName}' não encontrado. Criando...`);
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          this.logger.log(`Bucket '${this.bucketName}' criado com sucesso.`);
        } catch (createError) {
          this.logger.error(`Erro ao criar o bucket '${this.bucketName}'`, createError);
        }
      } else {
        this.logger.error(`Erro ao verificar o bucket '${this.bucketName}'`, error);
      }
    }
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
      
      // Return the key for easier database storage, we can construct the URL if needed
      return filename;
    } catch (error) {
      this.logger.error(`Error uploading file ${filename} to MinIO`, error);
      throw new Error('Failed to upload file');
    }
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(`Error fetching file buffer ${key} from MinIO`, error);
      throw new Error(`Failed to fetch file: ${key}`);
    }
  }

  async getFileStream(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Error fetching file stream ${key} from MinIO`, error);
      throw new Error(`Failed to fetch file stream: ${key}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Error deleting file ${key} from MinIO`, error);
      // We don't throw here to avoid failing the whole transaction if file was already deleted
    }
  }
}
