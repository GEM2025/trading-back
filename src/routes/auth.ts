import { Router } from "express";
import { AuthController } from "../controllers/auth";

// routes

export const router = Router();

/**
 * http://localhost:3002/auth/register [POST]
 */
router.post("/register", AuthController.registerController);
router.post("/login", AuthController.loginController);
