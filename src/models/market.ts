import { Schema, model } from "mongoose";
import { IMarket } from "../interfaces/market.interfaces";

// models

const MarketSchema = new Schema<IMarket>(
    {
        hashkey: {
            type: String,
            required: true,
            unique: true
        },
        items: {
            type: [String],            
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

const MarketModel = model("Market", MarketSchema);
export default MarketModel;
