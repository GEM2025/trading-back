import { Schema, model } from "mongoose";
import { Symbol } from "../interfaces/symbol.interface";

// models

const SymbolSchema = new Schema<Symbol>(
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
