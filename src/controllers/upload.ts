import { Response } from "express";
import { RequestExt } from "../interfaces/requestext.interface";
import { handlerHttp } from "../utils/error.handler";
import { Storage } from "../interfaces/storage.interface";
import { registerUpload } from "../services/storage";

// controllers

const getFile = async (req: RequestExt, res: Response) => {
    try {
      const { user, file } = req;
      const dataToRegister: Storage = {
        fileName: `${file?.filename}`,
        idUser: `${user?.id}`,
        path: `${file?.path}`,
      };
      const response = await registerUpload(dataToRegister);
      res.send(response);
    } catch (e) {
      handlerHttp(res, "ERROR_GET_BLOG");
    }
  };
  
  export { getFile };