import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../app.js";
import userModel from "../models/user.model.js";

class UserController {
  async create(req, res) {
    const data = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      event: req.body.event
    };

    for (const property in data) {
      if (!data[property]) {
        return res.status(400).send({
          success: false,
          message: `The ${property} field is required`
        });
      }
    }
    try {
      const userExists = await userModel.findOne({ email: data.email });
      if (userExists) {
        return res.status(400).send({
          success: false,
          message: "User with this email already exists"
        });
      }
      const user = await userModel.create(data);
      return res.status(200).send({
        success: true,
        data: {
          userId: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          event: user.event
        }
      });
    } catch (err) {
      logger.error(err);
      return res.status(400).send({
        success: false,
        error: err.message
      });
    }
  }
  async login(req, res) {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).send({
          success: false,
          body: "user does not exist"
        });
      }
      const verifyPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!verifyPassword) {
        return res.status(400).send({
          success: false,
          message: "email or password is invalid"
        });
      }
      const token = jwt.sign(
        { _id: user._id, email: user.email, event: user.event },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h", algorithm: "HS512" }
      );
      return res.status(200).send({
        success: true,
        body: {
          message: "user logged in successfully",
          token,
          data: user
        }
      });
    } catch (error) {
      logger.error(error);
      return res.status(404).send({
        success: false,
        token: token
      });
    }
  }
}

export default new UserController();
