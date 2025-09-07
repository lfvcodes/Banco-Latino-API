const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const router = express.Router();
const dbConnect = require("../dbConnect");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validación básica
  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }

  try {
    const db = await dbConnect();
    let user;

    switch (process.env.DATABASE_TYPE) {
      case "mysql": {
        const [rows] = await db.execute(
          "SELECT account, username, psw FROM user WHERE username = ?",
          [username]
        );
        user = rows[0];
        break;
      }
      case "postgresql": {
        const result = await db.query(
          "SELECT account, username, psw FROM user WHERE username = $1",
          [username]
        );
        user = result.rows[0];
        break;
      }
      case "sqlserver": {
        const result = await db
          .request()
          .input("username", username)
          .query("SELECT account, username, psw FROM user WHERE username = @username");
        user = result.recordset[0];
        break;
      }
      default:
        return res.status(500).json({ message: "Tipo de base de datos no soportado" });
    }

    if (!user || !user.psw) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Verificar contraseña con argon2
    const isValidPassword = await argon2.verify(user.psw, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.account, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        account: user.account,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
});

module.exports = router;