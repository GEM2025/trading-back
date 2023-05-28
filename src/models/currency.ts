import { Schema, model } from "mongoose";
import { ICurrency } from "../interfaces/currency.interfaces";

// models

const CurrencySchema = new Schema<ICurrency>(
    {
        name: {
            type: String,
            required: true,
            unique: true
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

// CurrencySchema.index({ name: 1 }, { unique: true });

const CurrencyModel = model("Currency", CurrencySchema);
export default CurrencyModel;
