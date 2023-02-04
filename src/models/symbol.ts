import { Schema, model } from "mongoose";
import { Interfaces } from "../interfaces/app.interfaces";

// models

const SymbolSchema = new Schema<Interfaces.Symbol>(
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
