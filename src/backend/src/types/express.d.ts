import { Session } from '../interfaces/session.interface';

declare global {
  namespace Express {
    interface Request {
      session?: Session;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};
