const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Configuracion = connection.define("configuracion", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    itbis: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }
});

module.exports = Configuracion;
