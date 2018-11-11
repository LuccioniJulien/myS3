import fs from "fs";
import path from "path";
import os from "os";

const root = os.platform == "win32" ? process.cwd().split(path.sep)[0] : "/";
const workPath = path.join(root, "opt", "workspace", "myS3");

class FileSystem {
	constructor(params) {
		if (!FileSystem.instance) {
			this.initialize();
		}
		return FileSystem.instance;
	}

	initialize() {
		FileSystem.instance = this;
	}

	getWorkspace(uuid, bucketname) {
		return path.join(workPath, uuid, bucketname);
	}

	exist(user, bucketName) {
		const workspace = path.join(workPath, user.uuid, bucketName);
		return fs.existsSync(workspace);
	}

	addUserWorkspace(user) {
		const workspace = path.join(workPath, user.uuid);
		if (!fs.existsSync(workspace)) {
			fs.mkdirSync(workspace);
		}
	}

	createBucket(user, bucketName) {
		const workspace = path.join(workPath, user.uuid, bucketName);
		if (fs.existsSync(workspace)) {
			throw new Error(`Bucket ${bucketName} already exist`);
		}
		fs.mkdirSync(workspace);
	}

	renameBucket(user, oldName, newName) {
		const old = path.join(workPath, user.uuid, oldName);
		const newer = path.join(workPath, user.uuid, newName);
		if (fs.existsSync(old) && !fs.existsSync(newer)) {
			fs.renameSync(old, newer);
		}
	}

	removeBucket(user, bucketName) {
		const workspace = path.join(workPath, user.uuid, bucketName);
		fs.readdirSync(workspace).forEach(folder => {
			fs.readdirSync(workspace).forEach(filename => {
				fs.unlinkSync(path.join(workspace, folder, filename));
			});
			fs.rmdirSync(path.join(workspace, folder));
		});
		fs.rmdirSync(workspace);
	}

	createBlob(user, bucketName, blobName) {
		const workspace = path.join(workPath, user.uuid, bucketName, blobName);
		if (fs.existsSync(workspace)) {
			throw new Error("Blob with this name already exists");
		}
	}

	removeBlob(user, bucketName, blobName) {
		const file = path.join(workPath, user.uuid, bucketName, blobName);
		fs.unlinkSync(file);
	}
}

const instance = new FileSystem();
Object.freeze(instance);
export default instance;
