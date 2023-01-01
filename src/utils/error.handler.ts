import { Response } from "express";

// utils

const handlerHttp = (res: Response, error: string, exception?: unknown) => {
    res.status(500);
    res.send({ error, exception })
}

export { handlerHttp };