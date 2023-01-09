import { Router, Request, Response } from "express";
import { deleteItem, getItem, getItems, postItem, updateItem } from "../controllers/item";
import { logMiddleware } from "../middleware/log";

// routes
const router = Router();

// router.get('/items', (req: Request, res: Response)  => {    
//     logger.info("OK");
//     res.send( {data: "OK"} );
// });

/** http://localhost:3002/item */
router.get('/', getItems);

/** http://localhost:3002/item/63aa37ebd94c08c748fdd748 */
router.get('/:id', logMiddleware, getItem);
router.post('/', postItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export { router };
