import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
const toStream = require('tostream');
import * as multer from 'multer';

@Injectable()
export class CloudinaryService {
  private uploadImageMiddleware = multer({
    limits: {
      fileSize: 15 * 1024 * 1024, // 15MB
    },
  }).single('image');

  private uploadTxtMiddleware = multer({
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  }).single('txt');

  private uploadPdfMiddleware = multer({
    limits: {
      fileSize: 200 * 1024 * 1024, // 200MB
    },
  }).single('pdf');
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadMP3(file: Express.Multer.File) {
    try {
      const result = await v2.uploader.upload(file.path, {
        resource_type: 'video',
        format: 'mp3',
      });

      return result; // Return the URL of the uploaded MP3 file
    } catch (error) {
      throw new Error(`Failed to upload MP3: ${error.message}`);
    }
  }
  async uploadDocx(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'auto' }, // Обновлено до автоматического определения ресурса
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadPdf(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'raw' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
