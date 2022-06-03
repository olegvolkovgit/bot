const sequielize = require("./db");
const { DataTypes } = require(sequielize);

const user = sequielize.define(user, {
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
    chatId: { type: DataTypes.STRING, unique: true },
    message: { Type: DataTypes.STRING },
});
