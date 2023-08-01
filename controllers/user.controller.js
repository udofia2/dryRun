import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../app.js";
import userModel from "../models/user.model.js";
import cities from "../utils/cities.js";
import capitalizeFirstLetter from "../utils/capitalizefunction.js";
import event_types from "../utils/event.types.js";
import passportConfig from "../config/passport.config.js";
import userServices from "../services/user.services.js";

class UserController {
  async create(req, res) {
    const data = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      type: req.body.type
    };
    if (data.type === "vendor" && event_types.includes(req.body.event_type)) {
      data.event_type = req.body.event_type;
    }
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
        message: "Signup Successful",
        data: {
          userId: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          type: user.type
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
          id: user._id,
          email: user.email,
          type: user.type,
          firstname: user.firstname,
          lastname: user.lastname
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h", algorithm: "HS512" }
      );
      return res.status(200).send({
        success: true,
        body: {
          message: "user logged in successfully",
          token,
          data: {
            id: user._id,
            email: user.email,
            type: user.type,
            firstname: user.firstname,
            lastname: user.lastname
          }
        }
      });
    } catch (error) {
      logger.error(error);
      return res.status(404).send({
        success: false,
        message: error.message
      });
    }
  }
  async loginGoogle(req, res) {
    passportConfig();
  }

  async findByLocation(req, res) {
    const data = {
      location: req.query.location,
      type: "vendor",
      event_type: req.query.event_type
    };
    // Function to extract state and city from the location string
    function getLocationData(location) {
      if (!location || location.trim() === "") {
        return;
      }
      const [state, city] = location.split(",").map((item) => item.trim());
      return {
        state: capitalizeFirstLetter(state),
        city: capitalizeFirstLetter(city)
      };
    }

    const locationData = getLocationData(data.location);
    if (locationData && locationData.state) {
      data.state = locationData.state;
    }

    if (locationData && locationData.city) {
      data.city = locationData.city;
    }
    let newData = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        newData[key] = data[key];
      }
    }

    try {
      const eventvendors = await userServices.find(
        newData.type,
        newData.event_type,
        newData.state,
        newData.city
      );
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
