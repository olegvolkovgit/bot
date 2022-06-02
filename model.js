const sequielize = require("./db");
const { DataTypes } = require(sequielize);

const user = sequielize.define(user, {
    id: { type: DataTypes.Integer, primaryKey: true, unique: true, autoIncrement: true },
    chatId: { type: DataTypes.String, unique: true },
    message: { Type: DataTypes.String },
});
