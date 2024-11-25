const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Categoria = connection.define("categoria", {
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
    comercioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Categoria.associate = (models) => {
    Categoria.belongsTo(models.Comercio, { 
        foreignKey: "comercioId", 
        onDelete: "CASCADE", 
        as: "comercio" 
    });
    Categoria.hasMany(models.Producto, { 
        foreignKey: "categoriaId", 
        onDelete: "CASCADE", 
        as: "productos" 
    });
};

module.exports = Categoria;
