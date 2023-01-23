import { Router } from "express";
import { SessionMiddleware } from "../middleware/session";
import { OrderController } from "../controllers/order";

// router (secure)

export const router = Router();

router.get('/', SessionMiddleware.checkJwt, OrderController.getItems);
