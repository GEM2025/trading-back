import { Router } from "express";
import { MarketController } from "../controllers/market";
import { LogMiddleware } from "../middleware/log";

// routes

export const router = Router();

// router.get('/markets', (req: Request, res: Response)  => {    
//     logger.info("OK");
//     res.send( {data: "OK"} );
// });

/** http://localhost:3002/market */
router.get('/', MarketController.getMarkets);

/** http://localhost:3002/market/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, MarketController.getMarket);
router.post('/', MarketController.postMarket);
router.put('/:id', MarketController.updateMarket);
router.delete('/:id', MarketController.deleteMarket);
