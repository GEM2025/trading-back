import { Router } from "express";
import { loginController, registerController } from "../controllers/auth";

// routes

const router = Router();

/**
 * http://localhost:3002/auth/register [POST]
 */
router.post("/register", registerController);
router.post("/login", loginController);

export { router };