const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const ProductoPedido = connection.define("productoPedido", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    precio: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    pedidoId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    productoId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

ProductoPedido.associate = (models) => {
    ProductoPedido.belongsTo(models.Pedido, { 
        foreignKey: "pedidoId", 
        onDelete: "CASCADE", 
        as: "pedido" 
    });
    ProductoPedido.belongsTo(models.Producto, { 
        foreignKey: "productoId", 
        onDelete: "CASCADE", 
        as: "producto" 
    });
};

module.exports = ProductoPedido;
