import { Schema, model } from "mongoose";
import { Interfaces } from "../interfaces/app.interfaces";

// models

const MarketSchema = new Schema<Interfaces.Market>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        items: {
            type: [String],            
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const MarketModel = model("markets", MarketSchema);
export default MarketModel;
