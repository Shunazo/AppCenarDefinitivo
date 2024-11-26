require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const connection = require("./database/appContext");
const { engine } = require("express-handlebars");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const flash = require("connect-flash");
const session = require("express-session");

const Usuario = require("./models/usuario");
const Administrador = require("./models/administrador");
const Categoria = require("./models/categoria");
const Cliente = require("./models/cliente");
const Comercio = require("./models/comercio");
const Delivery = require("./models/delivery");
const Direccion = require("./models/direccion");
const Pedido = require("./models/pedido");
const Producto = require("./models/producto");
const ProductoPedido = require("./models/productopedido");
const TipoComercio = require("./models/tipocomercio");
const Configuracion = require("./models/configuracion");

const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const deliveryRoute = require("./routes/delivery");
const clienteRoute = require("./routes/cliente");
const comercioRoute = require("./routes/comercio");
const errorController = require("./controllers/errorController");

const authMiddleware = require("./middleware/is-auth");

const PORT = 3000;

// Handlebars setup
app.engine("hbs", engine({ 
    extname: "hbs", 
    defaultLayout: "",
    layoutsDir: "", 
}));
app.set("view engine", "hbs");
app.set("views", "views");


// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Static files (public assets and images)
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Multer configuration for file uploads
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + "-" + file.originalname);
    },
});
app.use(multer({ storage: imageStorage }).fields([{ name: "logo", maxCount: 1 }, { name: "fotoPerfil", maxCount: 1 }]));


// Session setup
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 360000 }, // 1 hour
}));

// Flash messages
app.use(flash());




Usuario.associate({ Administrador, Cliente, Comercio, Delivery });
Administrador.associate({ Usuario });
Categoria.associate({ Comercio, Producto });
Cliente.associate({ Usuario, Pedido, Direccion });
Comercio.associate({ Usuario, TipoComercio, Categoria, Pedido });
Delivery.associate({ Usuario, Pedido });
Direccion.associate({ Cliente });
Pedido.associate({ Cliente, Comercio, Delivery, Direccion, ProductoPedido });
Producto.associate({ Categoria, ProductoPedido });
ProductoPedido.associate({ Pedido, Producto });
TipoComercio.associate({ Comercio });

app.use('/', authRoute); // Auth routes (login, register, etc.)
/*app.use('/admin', adminRoute);
app.use('/delivery', deliveryRoute); 
app.use('/cliente', clienteRoute); 
app.use('/comercio', comercioRoute); */
app.use(errorController.get404);


connection
    .sync({})
    .then(() => {
        console.log(`App is running on port ${PORT}`);
        app.listen(PORT);
    })
    .catch((err) => {
        console.log(err);
});
