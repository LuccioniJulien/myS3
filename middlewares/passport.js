import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JsonWebTokenStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user";
passport.use(
	new LocalStrategy(
		{ usernameField: "nickname", passwordField: "password" },
		async (nickname, password, done) => {
			try {
				const user = await User.findOne({ where: { nickname } });
				if (!user) {
					done("Please check your nickname", false);
					return;
				}
				password = await user.checkPassword(password);
				if (!password) {
					done("Incorrect password", false);
					return;
				}
				done(false, user);
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	new JsonWebTokenStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_ENCRYPTION
		},
		async (jwtPayload, done) => {
			try {
				const user = await User.findOne({ where: { uuid: jwtPayload.uuid } });
				if (!user) {
					done("User not found", false);
					return;
				}
				done(false, user);
			} catch (error) {
				done(error, false);
			}
		}
	)
);
