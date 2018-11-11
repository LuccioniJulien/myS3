import { Router } from "express";
import User from "../models/user";
import Blob from "../models/blob";
import Bucket from "../models/bucket";
import FileSystem from "../lib/fileSystem";
import fs from "fs";
import multer from "multer";
import path from "path";
import _ from "lodash";

const upload = multer({
	storage: multer.diskStorage({
		destination: async (request, file, callback) => {
			const bucket = await Bucket.findOne({ where: { id: request.params.id } });
			const path = FileSystem.getWorkspace(request.params.uuid, bucket.name);
			callback(null, path);
		},
		filename: (request, file, callback) => {
			//originalname is the uploaded file's name with extn
			callback(null, file.originalname);
		}
	})
});

const api = Router({ mergeParams: true });

/* =========== */
/*   CREATE    */
/* =========== */

// add a blob
api.post("/", upload.single("file"), async (request, response) => {
	try {
		const { size, filename: name, destination: path } = request.file;
		const bucket_id = request.params.id;
		// const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		// const user = await User.findOne({ where: { uuid: request.params.uuid } });
		// FileSystem.createBlob(user, bucket.name, name);
		const existBlob = await Blob.findOne({
			where: { name, bucket_id }
		});
		if (existBlob) {
			throw new Error("Blob with this name already exists");
		}
		const blob = new Blob({ name, path, size, bucket_id });
		await blob.save();
		response.status(201).json({ data: { blob }, meta: {} });
	} catch (error) {
		response.status(400).json({ err: error.message });
	}
});

/* duplicate a blob */
api.get("/duplicate/:id_blob", async (request, response) => {
	try {
		const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		let filePath = FileSystem.getWorkspace(request.params.uuid, bucket.name);
		const { name, path: bpath, size, bucket_id } = await Blob.findOne({
			where: { id: request.params.id_blob }
		});
		const blobPath = path.join(filePath, name);
		const arr = name.split(".");
		arr.splice(arr.length - 1, 0, "copy");
		let newFile = arr.join(".");
		const newBlob = new Blob({
			name: newFile,
			path: bpath,
			size,
			bucket_id
		});
		await newBlob.save();
		newFile = path.join(filePath, newFile);
		fs.createReadStream(blobPath).pipe(fs.createWriteStream(newFile));
		response.status(201).json({ data: { blob: newBlob }, meta: {} });
	} catch (error) {
		response.status(400).json({ err: error.message });
	}
});

/* ========== */
/*   Read     */
/* ========== */

/* Download a blob */
api.get("/:id_blob", async (request, response) => {
	try {
		const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		let filePath = FileSystem.getWorkspace(request.params.uuid, bucket.name);
		const blob = await Blob.findOne({ where: { id: request.params.id_blob } });
		filePath = path.join(filePath, blob.name);
		response.status(200).download(filePath);
	} catch (error) {
		response.status(400).json({ err: error.message });
	}
});

/* get all blob */
api.get("/", async (request, response) => {
	try {
		const blobs = await Blob.findAll({
			where: { bucket_id: request.params.id }
		});
		response.status(201).json({ data: { blobs }, meta: {} });
	} catch (error) {
		response.status(400).json({ err: error.message });
	}
});

/* get a blob */
api.get("/meta/:id_blob", async (request, response) => {
	try {
		const blob = await Blob.findOne({
			where: { bucket_id: request.params.id, id: request.params.id_blob }
		});
		response.status(201).json({ data: { blob }, meta: {} });
	} catch (error) {
		response.status(400).json({ err: error.message });
	}
});

/* ========== */
/*   Delete   */
/* ========== */

/* Delete a blob */
api.delete("/:id_blob", async (request, response) => {
	try {
		const user = await User.findOne({ where: { uuid: request.params.uuid } });
		const bucket = await Bucket.findOne({ where: { id: request.params.id } });
		const blob = await Blob.findOne({ where: { id: request.params.id_blob } });
		FileSystem.removeBlob(user, bucket.name, blob.name);
		blob.destroy();
		response.status(204).send();
	} catch (error) {
		response.status(400).json({ err: error.message });
	}
});

export default api;
