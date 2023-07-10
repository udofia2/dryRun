import jwt from "jsonwebtoken";
import logger from "../app.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(403).send({
      message: "Forbidden"
    });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = {
      _id: payload._id,
      firstname: payload.firstname,
      email: payload.email,
      city: payload.city,
      state: payload.state,
      type: payload.type
    };
    next();
  } catch (error) {
    logger.error(error);
    return res.status(403).send({
      message: "Invalid Authentication",
      error: error.message
    });
  }
};

export default auth;
