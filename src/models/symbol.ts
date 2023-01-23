import { Schema, model } from "mongoose";
import { CondorInterface } from "../interfaces/condor.interfaces";

// models

const SymbolSchema = new Schema<CondorInterface.Symbol>(
    {
        name: {
            type: String,
            required: true,
        },
        exchange: {
            type: String,
            required: true,
        },
        pair: {
            type: [String, String],
            required: false,
        },
        bid: {
            type: [Number, Number],
            required: true,
        },
        ask: {
            type: [Number, Number],
            required: false,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

SymbolSchema.index({ exchange: 1, name: 1 }, { unique: true });

const SymbolModel = model("symbols", SymbolSchema);
export default SymbolModel;
