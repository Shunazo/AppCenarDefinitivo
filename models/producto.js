const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Producto = connection.define("producto", {
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
    precio: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imagen: {
        type: Sequelize.STRING,
        allowNull: true
    },
    categoriaId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Producto.associate = (models) => {
    Producto.belongsTo(models.Categoria, { 
        foreignKey: "categoriaId", 
        onDelete: "CASCADE", 
        as: "categoria" 
    });
    Producto.hasMany(models.ProductoPedido, { 
        foreignKey: "productoId", 
        onDelete: "CASCADE", 
        as: "productosPedido" 
    });
    Producto.belongsTo(models.Comercio, { 
        foreignKey: "comercioId", 
        onDelete: "CASCADE", 
        as: "comercio" 
    });
};

module.exports = Producto;
