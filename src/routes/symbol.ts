import { Router } from "express";
import { SymbolController } from "../controllers/symbol";
import { LogMiddleware } from "../middleware/log";
import { SessionMiddleware } from "../middleware/session";

// routes

export const router = Router();

// router.get('/symbols', (req: Request, res: Response)  => {    
//     logger.info("OK");
//     res.send( {data: "OK"} );
// });

/** http://localhost:3002/symbol */
router.get('/', LogMiddleware.log, SessionMiddleware.checkJwt, SymbolController.getSymbols);

/** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, SymbolController.getSymbol);
router.post('/', LogMiddleware.log, SessionMiddleware.checkJwt, SymbolController.postSymbol);
router.put('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, SymbolController.updateSymbol);
router.delete('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, SymbolController.deleteSymbol);
