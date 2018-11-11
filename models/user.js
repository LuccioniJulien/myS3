import { Model } from "sequelize";
import bcrypt from "bcrypt";

const MIN_PASSWORD_LENGTH = 7;

export default class User extends Model {
	static init(sequelize, DataTypes) {
		return super.init(
			{
				uuid: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					validate: {
						isEmail: true
					},
					unique: {
						args: true,
						msg: "email address already in use"
					}
				},
				nickname: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: {
						args: true,
						msg: "nickname already in use"
					}
				},
				password: {
					type: DataTypes.VIRTUAL,
					validate: {
						isLongEnough(value) {
							if (value.length < MIN_PASSWORD_LENGTH) {
								throw new Error("Password is to short");
							}
						}
					}
				},
				password_confirmation: {
					type: DataTypes.VIRTUAL,
					validate: {
						isEqual(val) {
							if (this.password !== val) {
								throw new Error("Passwords don't match");
							}
						}
					}
				},
				password_digest: {
					type: DataTypes.STRING,
					allowNull: false
				}
			},
			{
				sequelize,
				hooks: {
					beforeValidate: async user => {
						if (user.isNewRecord) {
							user.password_digest = await User.getHashPassword(user.password);
						}
					},
					beforeSave: async user => {
						if (user.changed("password")) {
							if (user.password !== user.password_confirmation) {
								throw new Error("Passwords don't match");
							}
							user.password_digest = await User.getHashPassword(user.password);
						}
					}
				}
			}
		);
	}

	static async getHashPassword(password) {
		const SALT_ROUND = 10;
		const hash = await bcrypt.hash(password, SALT_ROUND);
		if (!hash) {
			throw new Error("Hash error");
		}
		return hash;
	}

	async checkPassword(password) {
		return await bcrypt.compare(password, this.password_digest);
	}

	toJson() {
		const obj = Object.assign({}, this.get());
		delete obj.password_digest;
		delete obj.password;
		delete obj.password_confirmation;
		return obj;
	}
}
