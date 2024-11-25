const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Pedido = connection.define("pedido", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    estado: {
        type: Sequelize.ENUM("pendiente", "en proceso", "completado"),
        defaultValue: "pendiente"
    },
    subtotal: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    itbis: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    total: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    fechaHora: {
        type: Sequelize.DATE,
        allowNull: false
    },
    clienteId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    comercioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    deliveryId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    direccionId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Pedido.associate = (models) => {
    Pedido.belongsTo(models.Cliente, { 
        foreignKey: "clienteId", 
        onDelete: "CASCADE", 
        as: "cliente" 
    });
    Pedido.belongsTo(models.Comercio, { 
        foreignKey: "comercioId", 
        onDelete: "CASCADE", 
        as: "comercio" 
    });
    Pedido.belongsTo(models.Delivery, { 
        foreignKey: "deliveryId", 
        onDelete: "SET NULL", 
        as: "delivery" 
    });
    Pedido.belongsTo(models.Direccion, { 
        foreignKey: "direccionId", 
        onDelete: "CASCADE", 
        as: "direccion" 
    });
    Pedido.hasMany(models.ProductoPedido, { 
        foreignKey: "pedidoId", 
        onDelete: "CASCADE", 
        as: "productosPedido" 
    });
};

module.exports = Pedido;
