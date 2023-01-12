import { Schema, model } from "mongoose";
import { Condor } from "../interfaces/condor.interfaces";

// models

const SymbolSchema = new Schema<Condor.Symbol>(
    {
        name: {
            type: String,
            required: true,
        },
        exchange: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        bid: {
            type: Number,
            required: true,
        },
        ask: {
            type: Number,
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
