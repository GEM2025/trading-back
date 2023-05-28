import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/user.interface";

// models

const UserSchema = new Schema<IUser>(
    {     
        name:{
            type: String,
            required: true,
        }   ,
        password: {
            type: String,
            required: true ,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },        
        role: {
            type: String,
            required: false,
            default: "READONLY",
        },        
        enabled: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const UserModel = model("User", UserSchema);
export default UserModel ;
