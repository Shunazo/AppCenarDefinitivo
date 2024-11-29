const Sequelize = require("sequelize");
const connection = require("../database/appContext");

const Comercio = connection.define("comercio", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombreComercio: {
        type: Sequelize.STRING,
        allowNull: false
    },
    logo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    horaApertura: {
        type: Sequelize.TIME,
        allowNull: false
    },
    horaCierre: {
        type: Sequelize.TIME,
        allowNull: false
    },
    tipoComercioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Comercio.associate = (models) => {
    Comercio.belongsTo(models.Usuario, { 
        foreignKey: "usuarioId", 
        as: "usuario" 
    });
    Comercio.belongsTo(models.TipoComercio, { 
        foreignKey: "tipoComercioId", 
        onDelete: "CASCADE", 
        as: "tipoComercio" 
    });
    Comercio.hasMany(models.Categoria, { 
        foreignKey: "comercioId", 
        onDelete: "CASCADE", 
        as: "categorías" 
    });
    Comercio.hasMany(models.Pedido, { 
        foreignKey: "comercioId", 
        onDelete: "CASCADE", 
        as: "pedidos" 
    });
    Comercio.hasMany(models.Producto, { 
        foreignKey: "comercioId", 
        onDelete: "CASCADE", 
        as: "productos" 
    });
};

module.exports = Comercio;
