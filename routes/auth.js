import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import passport from "passport";
import Mailer from "../lib/mail";
import FileSystem from "../lib/fileSystem";

const api = Router();

/* =============== */
/*   CREATE USER   */
/* =============== */

/* Create an user */
api.post("/register", async (request, response) => {
	try {
		const { nickname, password, password_confirmation, email } = request.body;
		console.log(request.body);
		let user = new User({ nickname, password, password_confirmation, email });
		await user.save();
		Mailer.send(
			user.email,
			"Welcome",
			`Guten Tag ${user.nickname}`,
			`<h1>Guten Tag ${user.nickname}</h1>`
		);
		const payload = { uuid: user.uuid, nickname, email };
		const token = jwt.sign(payload, process.env.JWT_ENCRYPTION);
		response.status(201).json({ data: { user }, meta: { token } });
	} catch (error) {
		console.log(error);
		response.status(400).json({ err: error.message });
	}
});

api.post("/login", async (request, response) => {
	passport.authenticate("local", { session: false }, (err, user, message) => {
		if (err) {
			response.status(400).json({ data: err });
		}
		const { nickname, uuid, email } = user.toJson();
		const payload = { uuid: user.uuid, nickname, email };
		const token = jwt.sign(payload, process.env.JWT_ENCRYPTION);
		response.status(200).json({
			data: {
				user: { nickname, uuid, email },
				meta: {
					token
				}
			}
		});
	})(request, response);
});

export default api;
