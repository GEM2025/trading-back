import multerMiddleware from "../middleware/file";
import { Router } from "express";
import { SessionMiddleware } from "../middleware/session";
import { UploadController } from "../controllers/upload";

// routes
export const router = Router();

router.post("/", SessionMiddleware.checkJwt, multerMiddleware.single("myfile"), UploadController.getFile);
