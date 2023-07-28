import express from "express";
import userController from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";
import passport from "passport";

const userRouter = express.Router();

userRouter.post("/signup", userController.create);
userRouter.post("/login", userController.login);
userRouter.get("/findbylocation", userController.findByLocation);
userRouter.get(
  "/auth",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
userRouter.get(
  "/authenticate",
  passport.authenticate("google"),
  async (req, res) => {
    console.log(req.user);
    return res.send("done");
  }
);

export default userRouter;
