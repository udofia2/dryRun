import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../app.js";
import userModel from "../models/user.model.js";
import cities from "../utils/cities.js";
import capitalizeFirstLetter from "../utils/capitalizefunction.js";

class UserController {
  async create(req, res) {
    const data = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      type: req.body.type,
      state: req.body.state,
      city: req.body.city
    };
    const stateToCheck = capitalizeFirstLetter(data.state);
    const cityToCheck = capitalizeFirstLetter(data.city);
    const stateExists = cities.some(
      (state) => capitalizeFirstLetter(state.name) === stateToCheck
    );

    if (!stateExists) {
      return res.status(400).send({
        success: false,
        message: "State does not exist"
      });
    }

    const stateObject = cities.find(
      (state) => capitalizeFirstLetter(state.name) === stateToCheck
    ); // find state object

    const cityExists = stateObject.cities.some((city) => {
      const capitalizedCity = capitalizeFirstLetter(city);
      return (
        capitalizedCity === cityToCheck || capitalizedCity.includes(cityToCheck)
      );
    }); // Check if city exists in the state object also catering for cities with more than one word

    if (!cityExists) {
      return res.status(400).send({
        success: false,
        message: "City does not exist in that state"
      });
    }
    data.city = cityToCheck;
    data.state = stateToCheck;

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
          type: user.type,
          city: user.city,
          state: user.state
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
        {
          _id: user._id,
          email: user.email,
          city: user.city,
          state: user.state,
          type: user.type,
          firstname: user.firstname
        },
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
  async findByLocation(req, res) {
    if (req.user.type !== "event host") {
      return res.status(404).send({
        success: false,
        message: "Only event hosts can make this request"
      });
    }
    const data = {
      state: capitalizeFirstLetter(req.body.state),
      city: capitalizeFirstLetter(req.body.city)
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
      const eventvendors = await userModel.find({
        type: "event vendor",
        state: data.state,
        city: data.city
      });
      return res.status(200).send({
        success: true,
        data: eventvendors
      });
    } catch (err) {
      logger.error(err);
      return res.status(400).send({
        success: false,
        error: err.message
      });
    }
  }
}

export default new UserController();
