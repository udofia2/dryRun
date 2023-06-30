import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.methods.generateToken = () => {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      event: this.event
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
