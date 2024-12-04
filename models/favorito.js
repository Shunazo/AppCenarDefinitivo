const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Favorito = connection.define("favorito", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    comercioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    clienteId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Favorito.associate = (models) => {
    Favorito.belongsTo(models.Cliente, {
        foreignKey: "clienteId",
        onDelete: "CASCADE",
        as: "cliente"
    });
    Favorito.belongsTo(models.Comercio, {
        foreignKey: "comercioId",
        onDelete: "CASCADE",
        as: "comercio"
    });
};



module.exports = Favorito;