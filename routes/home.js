const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, saldo } = decoded;

    if (name === undefined || saldo === undefined) {
      return res.status(400).json({ message: "Datos incompletos en el token" });
    }

    return res.json({ name, saldo });
  } catch (error) {
    console.error("Error en /home:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;