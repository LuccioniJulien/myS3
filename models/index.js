import Sequelize, { Op } from "sequelize";
import User from "./user";
import Bucket from "./bucket";
import Blob from "./blob";
import dotenv from "dotenv";
dotenv.config();

export const db = new Sequelize(process.env.DATABASE_URL, {
	operatorsAliases: Op,
	define: {
		underscored: true
	}
});

User.init(db, Sequelize);
Bucket.init(db, Sequelize);
Blob.init(db, Sequelize);

User.hasMany(Bucket);
Bucket.belongsTo(User);
Bucket.hasMany(Blob);
Blob.belongsTo(Bucket);
