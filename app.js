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

const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const deliveryRoute = require("./routes/delivery");
const clienteRoute = require("./routes/cliente");
const comercioRoute = require("./routes/comercio");
const errorController = require("./controllers/errorController");

const authMiddleware = require("./middleware/is-auth");

const PORT = 3000;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + "-" + file.originalname);
    },
});

app.use(multer({ storage: imageStorage }).single("fotoPerfil"));
app.use(multer({ storage: imageStorage }).single("logo"));


/* deja eto ahi por ahora es de las sesiones
const session = require("express-session");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 3600000 }, // 1 hora
}));
*/

//ya no se que mas poner despues de aqui 