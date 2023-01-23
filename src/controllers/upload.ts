import { Response } from "express";
import { RequestExtInterface } from "../interfaces/requestext.interface";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { StorageInterface } from "../interfaces/storage.interface";
import { StorageService } from "../services/storage";

export namespace UploadController {

  export const getFile = async (req: RequestExtInterface.RequestExt, res: Response) => {
    try {
      const { user, file } = req;
      const dataToRegister: StorageInterface.Storage = {
        fileName: `${file?.filename}`,
        idUser: `${user?.id}`,
        path: `${file?.path}`,
      };
      const response = await StorageService.registerUpload(dataToRegister);
      res.send(response);
    } catch (e) {
      ErrorHandlerUtils.handlerHttp(res, "ERROR_GET_BLOG");
    }
  };

} 