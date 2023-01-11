import { Schema, model } from "mongoose";
import { Condor } from "../interfaces/exchange.interface";

// models

const ExchangeSchema = new Schema<Condor.Exchange>(
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
export default ExchangeModel ;
