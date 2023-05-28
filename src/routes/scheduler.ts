import { Router } from "express";
import { SchedulerController } from "../controllers/scheduler";
import { LogMiddleware } from "../middleware/log";
import { SessionMiddleware } from "../middleware/session";

// routes

export const router = Router();

/** http://localhost:3002/scheduler */
router.get('/', LogMiddleware.log, SessionMiddleware.checkJwt, SchedulerController.getJobs);

/** http://localhost:3002/scheduler/63aa37ebd94c08c748fdd748 */
router.get('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, SchedulerController.getJob);
router.post('/', LogMiddleware.log, SessionMiddleware.checkJwt, SchedulerController.postJob);
router.put('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, SchedulerController.updateJob);
router.delete('/:id', LogMiddleware.log, SessionMiddleware.checkJwt, SchedulerController.deleteJob);
