import { Router } from "express";
import { ExchangeController } from "../controllers/exchange";
import { LogMiddleware } from "../middleware/log";

// routes

export const router = Router();

/** http://localhost:3002/exchange */
router.get('/', ExchangeController.getExchanges);

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, ExchangeController.getExchange);
router.post('/', ExchangeController.postExchange);
router.put('/:id', ExchangeController.updateExchange);
router.delete('/:id', ExchangeController.deleteExchange);
