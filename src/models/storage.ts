import { Schema, model } from "mongoose";
import { IStorage } from "../interfaces/storage.interface";

// models

const StorageSchema = new Schema<IStorage>(
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

const StorageModel = model("Storage", StorageSchema);
export default StorageModel;
