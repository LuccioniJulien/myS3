import { Model } from "sequelize";

export default class Blob extends Model {
	static init(sequelize, DataTypes) {
		return super.init(
			{
				id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false
				},
				path: {
					type: DataTypes.STRING,
					allowNull: false
				},
				size: {
					type: DataTypes.INTEGER,
					allowNull: false
				}
			},
			{
				sequelize
			}
		);
	}

	toJson() {
		const obj = Object.assign({}, this.get());
		return obj;
	}
	
}
