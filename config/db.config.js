import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../app.js";
dotenv.config();

const database = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      logger.info("Database connection established");
    })
    .catch((error) => {
      logger.error(error);
      console.log(error.message);
    });
};

export default database;
