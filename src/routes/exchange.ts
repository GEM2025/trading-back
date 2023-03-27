import { Router } from "express";
import { ExchangeController } from "../controllers/exchange";
import { LogMiddleware } from "../middleware/log";
import { SessionMiddleware } from "../middleware/session";

// routes

export const router = Router();

/** http://localhost:3002/exchange */
router.get('/', LogMiddleware.log, SessionMiddleware.checkJwt, ExchangeController.getExchanges);

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, ExchangeController.getExchange);
router.post('/', LogMiddleware.log, SessionMiddleware.checkJwt, ExchangeController.postExchange);
router.put('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, ExchangeController.updateExchange);
router.delete('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, ExchangeController.deleteExchange);
