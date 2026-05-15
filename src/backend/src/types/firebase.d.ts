declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: any;
  }
  
  export function initializeApp(config: any): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/storage' {
  export interface FirebaseStorage {
    app: any;
  }
  
  export function getStorage(app?: any): FirebaseStorage;
  export function ref(storage: FirebaseStorage, path: string): any;
  export function uploadBytes(ref: any, data: any, metadata?: any): Promise<any>;
  export function getDownloadURL(ref: any): Promise<string>;
  export function deleteObject(ref: any): Promise<void>;
}
