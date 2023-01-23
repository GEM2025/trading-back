import { StorageInterface } from "../interfaces/storage.interface";
import StorageModel from "../models/storage";

export namespace StorageService {

  export const registerUpload = async ({ fileName, idUser, path }: StorageInterface.Storage) => {
    const responseItem = await StorageModel.create({ fileName, idUser, path });
    return responseItem;
  };

}
