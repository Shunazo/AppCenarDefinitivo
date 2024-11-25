const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const TipoComercio = connection.define("tipoComercio", {
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
    icono: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

TipoComercio.associate = (models) => {
    TipoComercio.hasMany(models.Comercio, { 
        foreignKey: "tipoComercioId", 
        onDelete: "CASCADE", 
        as: "comercios" 
    });
};

module.exports = TipoComercio;
