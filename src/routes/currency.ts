import { Router } from "express";
import { CurrencyController } from "../controllers/currency";
import { LogMiddleware } from "../middleware/log";
import { SessionMiddleware } from "../middleware/session";

// routes

export const router = Router();

/** http://localhost:3002/currency */
router.get('/', LogMiddleware.log, SessionMiddleware.checkJwt, CurrencyController.getCurrencies);

/** http://localhost:3002/currency/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, CurrencyController.getCurrency);
router.post('/', LogMiddleware.log, SessionMiddleware.checkJwt, CurrencyController.postCurrency);
router.put('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, CurrencyController.updateCurrency);
router.delete('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, CurrencyController.deleteCurrency);
