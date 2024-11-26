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

const usuario = require("./models/usuario");
const administrador = require("./models/administrador");
const comercio = require("./models/comercio");
const delivery = require("./models/delivery");
const cliente = require("./models/cliente");

const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const deliveryRoute = require("./routes/delivery");
const clienteRoute = require("./routes/cliente");
const comercioRoute = require("./routes/comercio");
const errorController = require("./controllers/errorController");

const authMiddleware = require("./middleware/is-auth");

const PORT = 3000;

// Handlebars setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
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
app.use(multer({ storage: imageStorage }).single("fotoPerfil"));
app.use(multer({ storage: imageStorage }).single("logo"));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 360000 }, // 1 hour
}));

// Flash messages
app.use(flash());


app.use(authRoute); // Auth routes (login, register, etc.)
app.use('/admin', adminRoute); // Admin-related routes
app.use('/delivery', deliveryRoute); // Delivery-related routes
app.use('/cliente', clienteRoute); // Cliente-related routes
app.use('/comercio', comercioRoute); // Comercio-related routes

// Error handling
app.use(errorController.notFound); // 404 Error handling

// Global error handling middleware (e.g., internal server errors)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
