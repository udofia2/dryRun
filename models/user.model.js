import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String
    },
    lastname: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String
    },
    type: {
      type: String,
      enum: ["vendor", "host"]
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    booked_dates: [
      {
        date: {
          type: Date
        }
      }
    ],
    event_type: {
      type: String,
      enum: [
        "Event venues",
        "Event planner",
        "Bar services and beverages",
        "Photography",
        "Beauty professional",
        "Fashion designers & Stylists",
        "Decorators",
        "Videographer",
        "Clothing and accessories",
        "Event staffs",
        "Caterer",
        "Baker",
        "Printing service",
        "Event rental",
        "Favours & Gifts",
        "Music & Entertainment",
        "Lighting and AV",
        "Officiant & Speaker",
        "Dancing instructor",
        "Health & Fitness",
        "Accomodation",
        "Transportation service",
        "Model",
        "Social media influencer"
      ]
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
      type: this.type
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
