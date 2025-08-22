const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const usersRegister = require("./routes/register");
const authRouter = require("./routes/auth");
require("dotenv").config();
const app = express();

const HOST = process.env.HOST || "http://localhost";
const FRONTEND_PORT = process.env.FRONTEND_PORT;

// Configuración CORS más estricta
app.use(
	cors({
		origin: `${HOST}:${FRONTEND_PORT}`,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

// Configuración del motor de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", usersRegister);

// Manejo de errores
app.use(function (req, res, next) {
	next(createError(404));
});

app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
