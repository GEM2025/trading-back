import { Router } from "express";
import { LoggerService } from "../services/logger";

// routes

LoggerService.logger.info("BlogRouter");

export const router = Router();
