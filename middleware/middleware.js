import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "../routes/router.js";
import errorHandler from "./error.middleware.js";

const middleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(router);
  app.use(errorHandler);
};

export default middleware;
