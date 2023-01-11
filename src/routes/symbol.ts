import { Router, Request, Response } from "express";
import { deleteSymbol, getSymbol, getSymbols, postSymbol, updateSymbol } from "../controllers/symbol";
import { logMiddleware } from "../middleware/log";

// routes
const router = Router();

// router.get('/symbols', (req: Request, res: Response)  => {    
//     logger.info("OK");
//     res.send( {data: "OK"} );
// });

/** http://localhost:3002/symbol */
router.get('/', getSymbols);

/** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
router.get('/:id', logMiddleware, getSymbol);
router.post('/', postSymbol);
router.put('/:id', updateSymbol);
router.delete('/:id', deleteSymbol);

export { router };
