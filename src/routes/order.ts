import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getItems } from "../controllers/order";

// routes

/**
 * Secure logged-on route
 */

const router = Router();

router.get('/', checkJwt, getItems);

export { router };
