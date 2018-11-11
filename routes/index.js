import { Router } from "express";
import users from "./users";
import auth from "./auth";
import buckets from "./buckets";
import blob from "./blobs";
import passport from "passport";
const api = Router();

api.get("/", (request, response) => {
	response.json({ hello: "Yes" });
});

api.use("/users", passport.authenticate("jwt", { session: false }), users);
api.use(
	"/users/:uuid/buckets",
	passport.authenticate("jwt", { session: false }),
	buckets
);
api.use(
	"/users/:uuid/buckets/:id/blob",
	passport.authenticate("jwt", { session: false }),
	blob
);
api.use("/auth", auth);

api.get("*", (request, response) => {
	response.status(404).json({ err: "Not found." });
});

export default api;
