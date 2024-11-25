const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Administrador = connection.define("administrador", {
    id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    usuarioId: { 
        type: Sequelize.INTEGER, 
        allowNull: false 
    },
    cedula: { 
        type: Sequelize.STRING, 
        unique: true, 
        allowNull: false 
    }
});

Administrador.associate = (models) => {
    Administrador.belongsTo(models.Usuario, { 
        foreignKey: "usuarioId", 
        as: "usuario" 
    });
};

module.exports = Administrador;
