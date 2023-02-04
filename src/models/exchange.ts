import { Schema, model } from "mongoose";
import { Interfaces } from "../interfaces/app.interfaces";

// models

const ExchangeSchema = new Schema<Interfaces.Exchange>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: false,
        },
        key: {
            type: String,
            required: false,
        },
        secret: {
            type: String,
            required: false,
        },
        extra: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ExchangeModel = model("exchanges", ExchangeSchema);
export default ExchangeModel;
