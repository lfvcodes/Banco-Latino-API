const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Simulación de usuario (en producción, usa una base de datos)
const users = [
  { id: 1, username: "admin", password: bcrypt.hashSync("admin123", 8) },
];

// Ruta de login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

  // Generar token JWT
  const token = jwt.sign({ id: user.id, username: user.username }, "secreto", {
    expiresIn: "1h",
  });
  res.json({ token });
});

module.exports = router;
