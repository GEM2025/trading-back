import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { SessionMiddleware } from "../middleware/session";
import { LogMiddleware } from "../middleware/log";

// routes

export const router = Router();

/** http://localhost:3002/auth */
router.get("/", LogMiddleware.log, SessionMiddleware.checkJwt, AuthController.getUsers);

/** http://localhost:3002/auth/register [POST] */
router.post("/register", LogMiddleware.log, AuthController.registerController);
router.post("/login", LogMiddleware.log, AuthController.loginController);
router.post("/resetpassword", LogMiddleware.log, AuthController.resetPasswordController);

