import { Router } from "express";
import { CurrencyController } from "../controllers/currency";
import { LogMiddleware } from "../middleware/log";

// routes

export const router = Router();

/** http://localhost:3002/currency */
router.get('/', CurrencyController.getCurrencies);

/** http://localhost:3002/currency/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, CurrencyController.getCurrency);
router.post('/', CurrencyController.postCurrency);
router.put('/:id', CurrencyController.updateCurrency);
router.delete('/:id', CurrencyController.deleteCurrency);
