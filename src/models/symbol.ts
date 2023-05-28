import { Schema, model } from "mongoose";
import { ISymbol } from "../interfaces/symbol.interfaces";

// models

const SymbolSchema = new Schema<ISymbol>(
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
            base: {
                type: String,
                required: true,
            },
            term: {
                type: String,
                required: true,
            },
        },
        bid: {
            px: {
                type: Number,
                required: false,
            },
            qty: {
                type: Number,
                required: false,
            },
        },
        ask: {
            px: {
                type: Number,
                required: false,
            },
            qty: {
                type: Number,
                required: false,
            },
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

SymbolSchema.index({ exchange: 1, name: 1 }, { unique: true });

const SymbolModel = model("Symbol", SymbolSchema);
export default SymbolModel;
