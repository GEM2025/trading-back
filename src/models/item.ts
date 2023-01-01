import { Schema, model } from "mongoose";
import { Car } from "../interfaces/car.interface";

// models

const ItemSchema = new Schema<Car>(
    {
        color: {
            type: String,
            required: true,
        },
        gas: {
            type: String,
            enum: ["gasoline", "electronic"],
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },        
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ItemModel = model("items", ItemSchema);
export default ItemModel ;
