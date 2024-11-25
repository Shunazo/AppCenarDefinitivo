const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Direccion = connection.define("direccion", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    clienteId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Direccion.associate = (models) => {
    Direccion.belongsTo(models.Cliente, { 
        foreignKey: "clienteId", 
        onDelete: "CASCADE", 
        as: "cliente" 
    });
};

module.exports = Direccion;
