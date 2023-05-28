import { Schema, model } from "mongoose";
import { IExchange } from "../interfaces/exchange.interfaces";

// models

const ExchangeSchema = new Schema<IExchange>(
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
        markets: {
            type: [String],            
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
        enabled: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ExchangeModel = model("Exchange", ExchangeSchema);
export default ExchangeModel;
