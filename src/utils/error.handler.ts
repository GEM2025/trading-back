import { Response } from "express";

export namespace ErrorHandlerUtils {

    export const handlerHttp = (res: Response, error: string, exception?: unknown) => {
        res.status(500);
        res.send({ error, exception })
    }

}
