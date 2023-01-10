import { Schema, model } from "mongoose";
import { CondorExchange } from "../interfaces/condor_exchange.interface";

// models

const CondorExchangeSchema = new Schema<CondorExchange>(
    {
        name: {
            type: String,
            required: true,
        },
        desc: {
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

const CondorExchangeModel = model("condor_exchanges", CondorExchangeSchema);
export default CondorExchangeModel ;
