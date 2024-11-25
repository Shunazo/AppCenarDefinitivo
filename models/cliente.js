const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Cliente = connection.define("cliente", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Cliente.associate = (models) => {
    Cliente.belongsTo(models.Usuario, { 
        foreignKey: "usuarioId", 
        onDelete: "CASCADE", 
        as: "usuario" 
    });
    Cliente.hasMany(models.Pedido, { 
        foreignKey: "clienteId", 
        onDelete: "CASCADE", 
        as: "pedidos" 
    });
    Cliente.hasMany(models.Direccion, { 
        foreignKey: "clienteId", 
        onDelete: "CASCADE", 
        as: "direcciones" 
    });
};

module.exports = Cliente;
