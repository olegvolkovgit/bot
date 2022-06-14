import { Sequalize } from "sequelize";

module.exports = new Sequalize(
    'PPK_bot',
    'root',
    'root',
    {
        host: "",
        port: "",
        dialect: "postgres"
    }
)
