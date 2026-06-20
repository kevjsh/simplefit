import { logger } from './logger.helper';
import * as admin from 'firebase-admin';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

class FirebaseStorageHelper {
  private app: admin.app.App | null = null;
  private storage: admin.storage.Storage | null = null;
  private isInitialized = false;

  public initialize(config: FirebaseConfig): void {
    try {
      // Initialize Firebase Admin SDK for server-side operations only
      if (admin.apps.length === 0) {
        const serviceAccount = {
          type: "service_account",
          project_id: config.projectId,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
          client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
          client_id: process.env.FIREBASE_CLIENT_ID || "",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          storageBucket: config.storageBucket
        });

        this.storage = admin.storage();
      } else {
        this.app = admin.apps[0];
        this.storage = admin.storage();
      }

      this.isInitialized = true;
      logger.info(`Firebase Admin Storage initialized successfully with bucket: ${config.storageBucket}`);
    } catch (error) {
      logger.error(`Error initializing Firebase Storage: ${error}`);
      throw new Error(`Failed to initialize Firebase Storage: ${error}`);
    }
  }

  private checkInitialization(): void {
    if (!this.isInitialized || !this.storage) {
      throw new Error('Firebase Storage is not initialized. Call initialize() first.');
    }
  }
  public async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    this.checkInitialization();

    try {
      // Use Admin SDK for upload
      const bucket = this.storage!.bucket();
      const fileRef = bucket.file(path);

      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Generate permanent download token (never expires)
      const [downloadToken] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future date (effectively never expires)
      });

      logger.info(`File uploaded successfully to path: ${path}`);
      return downloadToken;
    } catch (error) {
      logger.error(`Error uploading file to Firebase Storage: ${error}`);
      throw new Error('Failed to upload file to Firebase Storage');
    }
  }

  public async deleteFile(path: string): Promise<void> {
    this.checkInitialization();

    try {
      // Use Admin SDK for deletion (has proper permissions)
      const bucket = this.storage!.bucket();
      const fileRef = bucket.file(path);
      await fileRef.delete();
      logger.info(`File deleted successfully from path: ${path}`);
    } catch (error: any) {
      // Check if the error is because the file doesn't exist
      if (error.code === 404 || error.message?.includes('No such object')) {
        logger.info(`File not found in Firebase Storage (may have been manually deleted): ${path}`);
        return; // Don't throw error if file doesn't exist
      }

      logger.error(`Error deleting file from Firebase Storage: ${error}`);
      throw new Error(`Failed to delete file from Firebase Storage: ${error.message}`);
    }
  }

  public generateProfilePicturePath(email: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    return `customers/profile-pictures/${email}_${timestamp}.${extension}`;
  }

  public extractPathFromURL(url: string): string {
    try {
      // Handle Firebase Storage signed URLs format: 
      // https://storage.googleapis.com/bucket-name/o/path%2Fencoded?GoogleAccessId=...&Expires=...&Signature=...
      if (url.includes('storage.googleapis.com') && url.includes('/o/')) {
        const urlParts = url.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'o');
        if (pathIndex !== -1 && pathIndex + 1 < urlParts.length) {
          const encodedPath = urlParts[pathIndex + 1].split('?')[0];
          return decodeURIComponent(encodedPath);
        }
      }

      // Handle Firebase Storage URLs with token format: 
      // https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path%2Fencoded?alt=media&token=...
      if (url.includes('firebasestorage.googleapis.com') && url.includes('/o/')) {
        const urlParts = url.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'o');
        if (pathIndex !== -1 && pathIndex + 1 < urlParts.length) {
          const encodedPath = urlParts[pathIndex + 1].split('?')[0];
          return decodeURIComponent(encodedPath);
        }
      }

      // Handle direct Firebase Storage URLs format:
      // https://storage.googleapis.com/bucket-name.firebasestorage.app/path?GoogleAccessId=...
      if (url.includes('storage.googleapis.com') && url.includes('.firebasestorage.app/')) {
        logger.info(`Processing direct Firebase Storage URL format`);
        const urlParts = url.split('/');
        const bucketIndex = urlParts.findIndex(part => part.includes('.firebasestorage.app'));
        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          // Get everything after the bucket name as the path
          const pathParts = urlParts.slice(bucketIndex + 1);
          const fullPath = pathParts.join('/').split('?')[0]; // Remove query parameters
          const decodedPath = decodeURIComponent(fullPath);
          logger.info(`Successfully extracted path from direct Firebase URL: ${decodedPath}`);
          return decodedPath;
        }
      }

      throw new Error('Invalid Firebase Storage URL format');
    } catch (error) {
      logger.error(`Error extracting path from URL: ${error}`);
      throw new Error('Failed to extract file path from URL');
    }
  }

  public isValidImageType(mimetype: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(mimetype.toLowerCase());
  }

  public isValidFileSize(size: number): boolean {
    const maxSize = 5 * 1024 * 1024;
    return size <= maxSize;
  }

  public async generatePermanentUrl(path: string): Promise<string> {
    this.checkInitialization();

    try {
      const bucket = this.storage!.bucket();
      const fileRef = bucket.file(path);

      const [permanentUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future date (effectively never expires)
      });

      logger.info(`Generated permanent URL for path: ${path} (never expires)`);
      return permanentUrl;
    } catch (error) {
      logger.error(`Error generating permanent URL for path ${path}: ${error}`);
      throw new Error('Failed to generate permanent URL');
    }
  }
}

export const firebaseStorageHelper = new FirebaseStorageHelper();
export default firebaseStorageHelper;
