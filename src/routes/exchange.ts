import { Router } from "express";
import { ExchangeController } from "../controllers/exchange";
import { LogMiddleware } from "../middleware/log";

// routes

export const router = Router();

/** http://localhost:3002/exchange */
router.get('/', ExchangeController.getExchanges);

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, ExchangeController.getExchange);
router.post('/', LogMiddleware.log, ExchangeController.postExchange);
router.put('/:id', LogMiddleware.log, ExchangeController.updateExchange);
router.delete('/:id', LogMiddleware.log, ExchangeController.deleteExchange);
