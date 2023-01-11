import { Router, Request, Response } from "express";
import { deleteExchange, getExchange, getExchanges, postExchange, updateExchange } from "../controllers/exchange";
import { logMiddleware } from "../middleware/log";

// routes
const router = Router();

/** http://localhost:3002/exchange */
router.get('/', getExchanges);

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
router.get('/:id', logMiddleware, getExchange);
router.post('/', postExchange);
router.put('/:id', updateExchange);
router.delete('/:id', deleteExchange);

export { router };
