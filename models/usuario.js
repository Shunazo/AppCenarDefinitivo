const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Usuario = connection.define("usuario", {
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
    apellido: {
        type: Sequelize.STRING,
        allowNull: false
    },
    correo: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    telefono: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fotoPerfil: {
        type: Sequelize.STRING,
        allowNull: true
    },
    nombreUsuario: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    rol: {
        type: Sequelize.ENUM("cliente", "comercio", "delivery", "administrador"),
        allowNull: false
    },
    activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

Usuario.associate = (models) => {
    Usuario.hasOne(models.Cliente, { foreignKey: "usuarioId", onDelete: "CASCADE", as: "cliente" });
    Usuario.hasOne(models.Comercio, { foreignKey: "usuarioId", onDelete: "CASCADE",  as: "comercio" });
    Usuario.hasOne(models.Delivery, { foreignKey: "usuarioId", onDelete: "CASCADE", as: "delivery" });
    Usuario.hasOne(models.Administrador, { foreignKey: "usuarioId", onDelete: "CASCADE", as: "administrador" });
};

module.exports = Usuario;
