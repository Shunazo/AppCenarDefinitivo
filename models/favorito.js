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
    usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Favorito.associate = (models) => {
    Favorito.belongsTo(models.Cliente, {
        foreignKey: "usuarioId",
        onDelete: "CASCADE",
        as: "cliente"
    })
};

module.exports = Favorito;