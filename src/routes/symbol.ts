import { Router } from "express";
import { SymbolController } from "../controllers/symbol";
import { LogMiddleware } from "../middleware/log";

// routes

export const router = Router();

// router.get('/symbols', (req: Request, res: Response)  => {    
//     logger.info("OK");
//     res.send( {data: "OK"} );
// });

/** http://localhost:3002/symbol */
router.get('/', SymbolController.getSymbols);

/** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, SymbolController.getSymbol);
router.post('/', SymbolController.postSymbol);
router.put('/:id', SymbolController.updateSymbol);
router.delete('/:id', SymbolController.deleteSymbol);
