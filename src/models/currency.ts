import { Schema, model } from "mongoose";
import { Interfaces } from "../interfaces/app.interfaces";

// models

const CurrencySchema = new Schema<Interfaces.Currency>(
    {
        name: {
            type: String,
            required: true,
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

CurrencySchema.index({ exchange: 1, name: 1 }, { unique: true });

const CurrencyModel = model("Currencies", CurrencySchema);
export default CurrencyModel;
