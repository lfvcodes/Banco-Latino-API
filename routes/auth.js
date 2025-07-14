const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Usuario de prueba (en producción usa una DB)
const users = [
  {
    id: 1,
    username: "admin",
    password: bcrypt.hashSync("admin123", 8),
  },
];

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validaciones básicas
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Usuario y contraseña requeridos" });
    }

    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secreto_desarrollo",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
