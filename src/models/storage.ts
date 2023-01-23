import { Schema, model } from "mongoose";
import { StorageInterface } from "../interfaces/storage.interface";

// models

const StorageSchema = new Schema<StorageInterface.Storage>(
  {
    fileName: {
      type: String,
    },
    idUser: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const StorageModel = model("storage", StorageSchema);
export default StorageModel;
