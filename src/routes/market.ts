import { Router } from "express";
import { MarketController } from "../controllers/market";
import { LogMiddleware } from "../middleware/log";
import { SessionMiddleware } from "../middleware/session";

// routes

export const router = Router();

// router.get('/markets', (req: Request, res: Response)  => {    
//     logger.info("OK");
//     res.send( {data: "OK"} );
// });

/** http://localhost:3002/market */
router.get('/', LogMiddleware.log, SessionMiddleware.checkJwt, MarketController.getMarkets);

/** http://localhost:3002/market/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, MarketController.getMarket);
router.post('/', LogMiddleware.log, SessionMiddleware.checkJwt, MarketController.postMarket);
router.put('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, MarketController.updateMarket);
router.delete('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, MarketController.deleteMarket);
