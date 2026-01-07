import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "@utils/readDockerSecret"

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryStorageService {
  async uploadReport(pdfBuffer: Buffer, transactionId: string, reportType: string): Promise<{
    url: string;
    publicId: string;
    secureUrl: string;
  }> {
    try {
      return new Promise((resolve, reject) => {
        const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
        
        const publicId = `car-reports/${reportType.toLowerCase()}/${transactionId}_${uuidv4().substring(0, 8)}.pdf`;
        
        cloudinary.uploader.upload(
          pdfBase64,
          {
            public_id: publicId,
            folder: 'car-reports',
            resource_type: 'raw',
            type: 'upload',
            overwrite: false,
            access_mode: 'public',
            tags: [`report-${reportType}`, 'vehicle-report', transactionId],
            context: {
              transactionId: transactionId,
              reportType: reportType,
              uploadedAt: new Date().toISOString(),
            },
            filename_override: `${transactionId}.pdf`,
            use_filename: true,
            unique_filename: false,
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(new Error(`Failed to upload to Cloudinary: ${error.message}`));
            } else if (result) {
              logger.info(`Report uploaded to Cloudinary: ${result.public_id}`);

              const secureUrl = this.ensurePdfExtension(result.secure_url);
              const url = this.ensurePdfExtension(result.url);
              
              resolve({
                url: url,
                publicId: result.public_id,
                secureUrl: secureUrl,
              });
            } else {
              reject(new Error('No result returned from Cloudinary'));
            }
          }
        );
      });
    } catch (error) {
      logger.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  private ensurePdfExtension(url: string): string {
    if (url.toLowerCase().endsWith('.pdf')) {
      return url;
    }
    return `${url}.pdf`;
  }

  async generateSignedUrl(publicId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        {
          public_id: publicId,
          timestamp: timestamp,
          expires_at: timestamp + expiresIn,
        },
        CLOUDINARY_API_SECRET!
      );

      let url = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'authenticated',
        version: timestamp,
        signature: signature,
        expires_at: timestamp + expiresIn,
        secure: true,
      });

      return this.ensurePdfExtension(url);
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  async deleteReport(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        invalidate: true,
      });
      logger.info(`Report deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }

  async getReportInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'raw',
      });
      return result;
    } catch (error) {
      logger.error('Error getting report info:', error);
      throw error;
    }
  }
}

export default new CloudinaryStorageService();