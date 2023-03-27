import multerMiddleware from "../middleware/file";
import { Router } from "express";
import { SessionMiddleware } from "../middleware/session";
import { UploadController } from "../controllers/upload";
import { LogMiddleware } from "../middleware/log";

// routes
export const router = Router();

router.post("/", LogMiddleware.log, SessionMiddleware.checkJwt, multerMiddleware.single("myfile"), UploadController.getFile);
