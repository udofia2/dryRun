import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true
    },
    lastname: {
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
    },
    type: {
      required: true,
      type: String,
      enum: ["vendor", "host"]
    },
    state: {
      required: true,
      type: String
    },
    city: {
      required: true,
      type: String
    }
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.generateToken = () => {
  const token = jwt.sign(
    {
      _id: this._id,
      firstname: this.firstname,
      email: this.email,
      city: this.city,
      state: this.state,
      type: this.type
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
