import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import { mLog } from "./lib/utils";
import { db as database } from "./models";
import routes from "./routes";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
// import User from "./models/user";

import "./middlewares/passport";

dotenv.config();

const port = parseInt(process.argv[2]) || process.env.PORT;
const app = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const root = os.platform == "win32" ? process.cwd().split(path.sep)[0] : "/";
const arrPath = ["myS3", "workspace", "opt"];
let workpath = root;
while (arrPath.length !== 0) {
	workpath = path.join(workpath, arrPath.pop());
	if (!fs.existsSync(workpath)) {
		try {
			fs.mkdirSync(workpath);
		} catch (error) {
			mLog(`${error}`, "red");
		}
	}
}

(async () => {
	try {
		await database.authenticate();
		if (process.env.APP === "development") {
			await database.sync({
				force: process.env.DATABASE_SYNC_FORCE == "true" ? true : false
			});
			// let user = new User({
			// 	nickname: "Juju",
			// 	password: "Warcraft3?",
			// 	password_confirmation: "Warcraft3?",
			// 	email: "juju@juju.com"
			// });
			// await user.save();
		}
		app.use("/api", routes);

		app.listen(port, err => {
			if (err) {
				throw err;
			} else {
				mLog(`Server is running on port ${port}`, "cyan");
			}
		});
	} catch (e) {
		mLog(`${e}`, "red");
	}
})();
