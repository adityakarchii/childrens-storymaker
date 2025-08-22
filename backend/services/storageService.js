const cloudinary = require('cloudinary').v2;
const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const path = require('path');

class StorageService {
  constructor() {
    this.cloudinary = null;
    this.gcs = null;
    this.initializeServices();
  }

  initializeServices() {
    // Initialize Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      this.cloudinary = cloudinary;
    }

    // Initialize Google Cloud Storage
    if (process.env.GOOGLE_CLOUD_TTS_KEY_FILE && process.env.GOOGLE_CLOUD_PROJECT_ID) {
      try {
        this.gcs = new Storage({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: process.env.GOOGLE_CLOUD_TTS_KEY_FILE
        });
      } catch (error) {
        console.error('Failed to initialize Google Cloud Storage:', error);
      }
    }
  }

  async uploadImage(imageBuffer, options = {}) {
    const { folder = 'storybook/images', public_id, format = 'jpg' } = options;

    try {
      if (this.cloudinary) {
        return await this.uploadToCloudinary(imageBuffer, {
          folder,
          public_id,
          resource_type: 'image',
          format
        });
      } else if (this.gcs) {
        return await this.uploadToGCS(imageBuffer, `${folder}/${public_id || Date.now()}.${format}`, 'image');
      } else {
        return await this.saveLocally(imageBuffer, `image_${Date.now()}.${format}`, 'images');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async uploadAudio(audioBuffer, options = {}) {
    const { folder = 'storybook/audio', public_id, format = 'mp3' } = options;

    try {
      if (this.cloudinary) {
        return await this.uploadToCloudinary(audioBuffer, {
          folder,
          public_id,
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          format
        });
      } else if (this.gcs) {
        return await this.uploadToGCS(audioBuffer, `${folder}/${public_id || Date.now()}.${format}`, 'audio');
      } else {
        return await this.saveLocally(audioBuffer, `audio_${Date.now()}.${format}`, 'audio');
      }
    } catch (error) {
      console.error('Audio upload failed:', error);
      throw error;
    }
  }

  async uploadFromUrl(url, options = {}) {
    try {
      if (this.cloudinary) {
        const result = await this.cloudinary.uploader.upload(url, options);
        return {
          url: result.secure_url,
          public_id: result.public_id,
          service: 'cloudinary'
        };
      } else {
        // Download and upload to alternative service
        const axios = require('axios');
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        if (url.includes('image') || options.resource_type === 'image') {
          return await this.uploadImage(buffer, options);
        } else {
          return await this.uploadAudio(buffer, options);
        }
      }
    } catch (error) {
      console.error('Upload from URL failed:', error);
      throw error;
    }
  }

  async uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              service: 'cloudinary'
            });
          }
        }
      ).end(buffer);
    });
  }

  async uploadToGCS(buffer, fileName, type) {
    try {
      const bucket = this.gcs.bucket(process.env.GCS_BUCKET_NAME || 'storybook-assets');
      const file = bucket.file(fileName);
      
      await file.save(buffer, {
        metadata: {
          contentType: type === 'image' ? 'image/jpeg' : 'audio/mpeg'
        }
      });

      // Make file public
      await file.makePublic();

      return {
        url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
        fileName: fileName,
        service: 'gcs'
      };
    } catch (error) {
      console.error('GCS upload error:', error);
      throw error;
    }
  }

  async saveLocally(buffer, fileName, subfolder) {
    try {
      const uploadDir = path.join(__dirname, '../uploads', subfolder);
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      return {
        url: `/uploads/${subfolder}/${fileName}`,
        filePath: filePath,
        service: 'local'
      };
    } catch (error) {
      console.error('Local save error:', error);
      throw error;
    }
  }

  async deleteFile(publicId, service = 'cloudinary') {
    try {
      if (service === 'cloudinary' && this.cloudinary) {
        await this.cloudinary.uploader.destroy(publicId);
      } else if (service === 'gcs' && this.gcs) {
        const bucket = this.gcs.bucket(process.env.GCS_BUCKET_NAME || 'storybook-assets');
        await bucket.file(publicId).delete();
      } else if (service === 'local') {
        await fs.unlink(publicId); // publicId is actually filePath for local
      }
    } catch (error) {
      console.error('File deletion failed:', error);
      // Don't throw - file might already be deleted
    }
  }

  async uploadFile(filePath, options = {}) {
    try {
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        return await this.uploadImage(buffer, options);
      } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
        return await this.uploadAudio(buffer, options);
      } else {
        throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

module.exports = new StorageService();
