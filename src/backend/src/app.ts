import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import IndexRoutes from "./routes/index.routes";
import { logger, loggerMiddleware } from "./helpers/logger.helper";
import { COOKIE_SECRET_KEY } from "./config/keys";
import { connectDB } from "./config/database";

export class App {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 4000;
    this.middlewares();
    this.routes();

    connectDB();
  }

  private middlewares() {
    this.app.use(loggerMiddleware);
    this.app.use(cors({
      credentials: true,
      origin: [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://192.168.40.6:3000",
        "http://192.168.40.6:4000",
      ],
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(COOKIE_SECRET_KEY));
  }

  private routes() {
    this.app.use(IndexRoutes);
  }

  async listen() {
    this.app.listen(this.port, () => {
      console.log(`API running on port ${this.port}`);

      // Date info
      const date = new Date();
      logger.info(`Current server date: ${date.toString()}`);
    });
  }
}
