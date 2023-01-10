import { Router, Request, Response } from "express";
import { deleteCondorExchange, getCondorExchange, getCondorExchanges, postCondorExchange, updateCondorExchange } from "../controllers/condor_exchange";
import { logMiddleware } from "../middleware/log";

// routes
const router = Router();

/** http://localhost:3002/exchange */
router.get('/', getCondorExchanges);

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
router.get('/:id', logMiddleware, getCondorExchange);
router.post('/', postCondorExchange);
router.put('/:id', updateCondorExchange);
router.delete('/:id', deleteCondorExchange);

export { router };
