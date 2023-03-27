import { Router } from "express";
import { SessionMiddleware } from "../middleware/session";
import { OrderController } from "../controllers/order";
import { LogMiddleware } from "../middleware/log";

// router (secure)

export const router = Router();

router.get('/', LogMiddleware.log, SessionMiddleware.checkJwt, OrderController.getItems);
