import { Router } from "express";
import { checkJwt } from "../middleware/session";
import multerMiddleware from "../middleware/file";
import { getFile } from "../controllers/upload";

// routes

const router = Router();

router.post("/", checkJwt, multerMiddleware.single("myfile"), getFile);

export { router };
