import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import userModel from "../models/user.model.js";

const passportConfig = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/user/authenticate"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the user exists in the database using the email from the Google profile
          let user = await userModel.findOne({ email: profile._json.email });

          if (user) {
            // User exists, so we perform the login process
            console.log("exists");
            done(null, user); // Passport will serialize the user to the session
          } else {
            // User does not exist, so we perform the signup process
            const data = {
              email: profile._json.email,
              lastname: profile._json.family_name,
              firstname: profile._json.given_name
            };
          const user = await userModel.create(data);
            console.log("DNE");
            done(null, user); // Passport will serialize the user to the session
          }
        } catch (error) {
          console.log(profile._json.email);
          console.log(error);
          done(error, null); // Pass any error to the done function
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log(
      "here"
    );
    done(null, user.email);
  });

  passport.deserializeUser(async (email, done) => {
    console.log("there");
    const user = await userModel.findOne({ email: email });
    done(null, user);
  });
};

export default passportConfig;
