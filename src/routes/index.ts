import { Router } from "express";
import { readdirSync } from "fs";
import { LoggerService } from "../services/logger";

// routes

const PATH_ROUTER = `${__dirname}`;
export const router = Router();

/**
 * Regresa el nombre del prefijo de la ruta
 * index.ts item 
 */
const cleanFileName = (fileName: string) => {
    const file = fileName.split(".").shift();
    return file;
};

// escanea los archivos que existen dentro del directorio actual (routes)
readdirSync(PATH_ROUTER).filter((fileName) => {
    const cleanName = cleanFileName(fileName);

    // evitamos recursión pues index no es un api
    if (cleanName !== "index") {
        LoggerService.logger.info(`Indexing ${cleanName}`);
        // dynamic importing
        import(`./${cleanName}`).then((moduleRouter) => {
            router.use(`/${cleanName}`, moduleRouter.router);
            LoggerService.logger.info(`Loading ${cleanName} from ${fileName}`);
        });
    }
});
