import { Response } from "express";
import { RequestExtInterface } from "../interfaces/requestext.interface";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { StorageService } from "../services/storage";
import { IStorage } from "../interfaces/storage.interface";

export namespace UploadController {

  export const getFile = async (req: RequestExtInterface.RequestExt, res: Response) => {
    try {
      const { user, file } = req;
      const dataToRegister: IStorage = {
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