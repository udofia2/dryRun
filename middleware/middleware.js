import express from "express";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import router from "../routes/router.js";
import errorHandler from "./error.middleware.js";

const middleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000 // One day in milliseconds
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cors());
  app.use(router);
  app.use(errorHandler);
};

export default middleware;
