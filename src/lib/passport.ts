import PassportJwt from "passport-jwt";
import usersRepository from "../repositories/usersRepository";
import { UserAcademy } from "@prisma/client";

const JwtStrategy = PassportJwt.Strategy;
const ExtractJwt = PassportJwt.ExtractJwt;

declare global {
  namespace Express {
    interface User extends UserAcademy {}
  }
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// app.js will pass the global passport object here, and this function will configure it
const jwtStrategy = (passport) => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new JwtStrategy(options, async function (jwt_payload, done) {
      console.log(jwt_payload);

      try {
        // We will assign the `sub` property on the JWT to the database ID of user
        const client = await usersRepository.get(jwt_payload.sub);

        if (!client) {
          return done(null, false);
        }

        return done(null, client as UserAcademy);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export default jwtStrategy;
