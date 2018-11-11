import { Router } from "express";
import User from "../models/user";
import _ from "lodash";

const api = Router();

/* ========= */
/*   READ    */
/* ========= */

/* get all user */
api.get("/", async (request, response) => {
	try {
		const users = await User.findAll();
		response.status(200).json({
			data: {
				users,
				meta: {}
			}
		});
	} catch (error) {
		response.status(400).json({
			err: error.message
		});
	}
});

/* get one user */
api.get("/:id", async (request, response) => {
	try {
		const uuid = request.params.id;
		const user = await User.findOne({ where: { uuid } });
		if (user) {
			response.status(200).json({
				data: {
					user,
					meta: {}
				}
			});
		} else {
			response.status(404).send();
		}
	} catch (error) {
		response.status(400).json({
			err: error.message
		});
	}
});

/* ========== */
/*   Update   */
/* ========== */

/* update an user */
api.put("/:uuid", async (request, response) => {
	try {
		const uuid = request.params.uuid;
		const user = await User.findOne({ where: { uuid } });
		if (!user) {
			response.status(404).send();
			return;
		}
		let field = _.pick(request.body, [
			"nickname",
			"password",
			"password_confirmation",
			"email"
		]);
		await user.update(field);
		response.status(204).send();
	} catch (error) {
		response.status(400).json({
			err: error.message
		});
	}
});

/* ========== */
/*   Delete   */
/* ========== */

/* Delete an user */
api.delete("/:uuid", async (request, response) => {
	try {
		const uuid = request.params.uuid;
		const user = await User.findOne({ where: { uuid } });
		if (!user) {
			response.status(404).send();
			return;
		}
		await user.destroy();
		response.status(204).send();
	} catch (error) {
		response.status(400).json({
			err: error.message
		});
	}
});

export default api;
