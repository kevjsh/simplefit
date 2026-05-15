import { firebaseStorageHelper } from '../helpers/firebaseStorage.helper';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
export function initializeFirebase(): void {
  try {
    const firebaseConfig: FirebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    };

    const requiredFields = ['storageBucket'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof FirebaseConfig]);

    if (missingFields.length > 0) {
      throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
    }

    firebaseStorageHelper.initialize(firebaseConfig);
    
    console.log('Firebase Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Storage:', error);
    throw error;
  }
}

export default initializeFirebase;
