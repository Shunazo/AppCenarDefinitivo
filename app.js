/* deja eto ahi por ahora es de las sesiones
const session = require("express-session");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 3600000 }, // 1 hora
}));
*/