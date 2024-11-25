const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Delivery = connection.define("delivery", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    estado: {
        type: Sequelize.ENUM("disponible", "ocupado"),
        defaultValue: "disponible"
    },
    usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Delivery.associate = (models) => {
    Delivery.belongsTo(models.Usuario, { 
        foreignKey: "usuarioId", 
        onDelete: "CASCADE", 
        as: "usuario" 
    });
    Delivery.hasMany(models.Pedido, { 
        foreignKey: "deliveryId", 
        onDelete: "SET NULL", 
        as: "pedidos" 
    });
};

module.exports = Delivery;
