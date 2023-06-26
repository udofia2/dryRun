import express from "express";
import pino from "pino";
import dotenv from "dotenv";
import database from "./config/db.config.js";
import middleware from "./middleware/middleware.js";
dotenv.config();

const app = express();
middleware(app);
const logger = pino();

const start = (port) => {
  database();
  app.listen(port, () => {
    logger.info("Server started on port " + port);
  });
};
const port = process.env.PORT || 4000;
start(port);

export default logger;
