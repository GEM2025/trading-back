import "dotenv/config";
import mongoose, { connect } from "mongoose";

// config

mongoose.set('strictQuery', false); // get rid of deprecation warning 


async function dbConnect(): Promise<void> {
    const DB_URI = <string>process.env.DB_URI;
    await connect(DB_URI);
}

export default dbConnect;
