import { Router } from "express";
import User from "../models/user";
import Blob from "../models/blob";
import Bucket from "../models/bucket";
import FileSystem from "../lib/fileSystem";
import fs from "fs";
import _ from "lodash";

const api = Router({ mergeParams: true });

/* ========= */
/*   HEAD    */
/* ========= */

api.head("/:id", async (request, response) => {
	try {
		const user = await User.findOne({ where: { uuid: request.params.uuid } });
		const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		if (FileSystem.exist(user, bucket.name)) {
			response.status(200).send();
			return;
		}
		response.status(400).send();
	} catch (error) {
		response.status(400).json({
			err: error.messages
		});
	}
});

/* ========= */
/*   READ    */
/* ========= */

/* get all objects from one bucket */
api.get("/:id", async (request, response) => {
	try {
		const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		const user = await User.findOne({ where: { uuid: request.params.uuid } });
		if (bucket.user_uuid != user.uuid) {
			throw new Error("Bucket does not belong to the specified user");
		}
		const Blobs = await Blob.findAll({ where: { bucket_id: bucket.id } });
		response.status(200).json({
			data: {
				Blobs,
				meta: {}
			}
		});
	} catch (error) {
		response.status(400).json({
			err: err.messages
		});
	}
});

/* =========== */
/*   CREATE    */
/* =========== */

// add a bucket
api.post("/", async (request, response) => {
	try {
		const { name } = request.body;
		const uuid = request.params.uuid;
		const user = await User.findOne({ where: { uuid } });
		if (await Bucket.findOne({ where: { user_uuid: uuid, name } })) {
			throw new Error(
				`Bucket with name ${name} already exists for ${user.nickname}`
			);
		}
		if (!user) {
			throw new Error("User not found");
		}
		let bucket = new Bucket({ name, user_uuid: uuid });
		FileSystem.addUserWorkspace(user);
		FileSystem.createBucket(user, bucket.name);
		await bucket.save();
		response.status(201).json({ data: { bucket }, meta: {} });
	} catch (error) {
		console.log(error);
		response.status(400).json({ err: error.message });
	}
});

/* ========== */
/*   Update   */
/* ========== */

/* update a bucket */
api.put("/:id", async (request, response) => {
	try {
		const user = await User.findOne({ where: { uuid: request.params.uuid } });
		if (!user) {
			throw new Error("User not found");
		}
		const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		if (!bucket) {
			throw new Error("Bucket not found");
		}
		let field = _.pick(request.body, ["name"]);
		await bucket.update(field);
		FileSystem.renameBucket(user, bucket.name, field.name);
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

/* Delete a bucket */
api.delete("/:id", async (request, response) => {
	try {
		const user = await User.findOne({ where: { uuid: request.params.uuid } });
		const id = request.params.id;
		const bucket = await Bucket.findOne({ where: { id } });
		if (!Bucket) {
			throw new Error("Bucket to delete does not exist");
		}
		const Blobs = await Blob.findAll({ where: { bucket_id: bucket.id } });
		for (const blob of Blobs) {
			await blob.destroy();
		}
		await bucket.destroy();
		FileSystem.removeBucket(user, bucket.name);
		response.status(204).send();
	} catch (error) {
		response.status(400).json({
			err: error.message
		});
	}
});

export default api;
