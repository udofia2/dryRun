import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const userSchema = mongoose.Schema({});

const userModel = mongoose.model("User", userSchema);

export default userModel;
