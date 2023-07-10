import express from "express";
import userController from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/signup", userController.create);
userRouter.post("/login", userController.login);
userRouter.post("/findbylocation", auth, userController.findByLocation);

export default userRouter;
